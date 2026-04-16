<template>
  <section class="profile-page">
    <div class="profile-panel profile-dashboard">
      <header class="profile-header">
        <div class="profile-heading">
          <div class="profile-avatar-block">
            <div class="avatar-preview" :style="profilePhotoStyle">
              <span v-if="!profilePictureUrl">{{ profileInitials }}</span>
            </div>
            <label class="avatar-upload">
              Change photo
              <input type="file" accept="image/*" @change="handleAvatarChange" />
            </label>
          </div>
          <div>
            <input class="profile-name-input" v-model="profileName" placeholder="Your display name" />
            <p>Update your profile name and picture to personalize the dashboard.</p>
          </div>
        </div>

        <div class="level-chip">Rank {{ rankTitle }}</div>
      </header>

      <section class="profile-grid">
        <article class="profile-card stats-card">
          <h3>Performance summary</h3>
          <div class="stat-grid">
            <div>
              <span>{{ summary?.totalTasks ?? 0 }}</span>
              <p>Tasks completed</p>
            </div>
            <div>
              <span>{{ summary?.totalMinutes ?? 0 }}</span>
              <p>Minutes logged</p>
            </div>
            <div>
              <span>{{ summary?.averageFocus ?? 0 }}%</span>
              <p>Average focus</p>
            </div>
          </div>
        </article>

        <article class="profile-card growth-card">
          <h3>Experience & Growth</h3>
          <div class="growth-bar">
            <span class="growth-label">{{ experiencePoints }} XP</span>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <p>Level {{ userLevel }} · {{ progressPercent }}% to next level</p>
          </div>
        </article>

        <article class="profile-card badge-card">
          <h3>Mastery results</h3>
          <ul>
            <li>Focus streak: {{ streakText }}</li>
            <li>Top zone: {{ topZone || 'No activity yet' }}</li>
            <li>Study power: {{ studyPower }}</li>
          </ul>
        </article>
      </section>

      <section class="profile-footer">
        <div class="profile-details">
          <div>
            <label>Email</label>
            <input type="email" :value="user?.email" disabled />
          </div>
          <div>
            <label>Current rank</label>
            <input type="text" :value="rankTitle" disabled />
          </div>
        </div>
        <button class="primary" :disabled="isSaving || !profileName.trim()" @click="saveProfile">
          {{ isSaving ? 'Saving...' : 'Save profile' }}
        </button>
      </section>

      <section class="activity-results">
        <div class="activity-results-header">
          <h3>Activity results</h3>
          <p>Recent insights from your productivity and focus tracking.</p>
        </div>

        <div class="activity-grid">
          <div class="activity-card">
            <strong>{{ summary?.totalTasks ?? 0 }}</strong>
            <span>Tasks completed</span>
          </div>
          <div class="activity-card">
            <strong>{{ summary?.totalMinutes ?? 0 }}</strong>
            <span>Minutes logged</span>
          </div>
          <div class="activity-card">
            <strong>{{ summary?.averageFocus ?? 0 }}%</strong>
            <span>Average focus</span>
          </div>
          <div class="activity-card">
            <strong>{{ topZone || 'No activity yet' }}</strong>
            <span>Top zone</span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useTaskStore } from '../stores/tasks';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const user = userStore;

const profileName = ref('');
const profilePictureUrl = ref('');
const isSaving = ref(false);

const summary = computed(() => taskStore.summary || {});
const experiencePoints = computed(() => {
  const totalMinutes = summary.value.totalMinutes || 0;
  const totalTasks = summary.value.totalTasks || 0;
  const averageFocus = summary.value.averageFocus || 0;
  return Math.round(totalMinutes + totalTasks * 20 + averageFocus * 5);
});
const userLevel = computed(() => Math.max(1, Math.floor(experiencePoints.value / 200) + 1));
const progressPercent = computed(() => Math.min(100, Math.round((experiencePoints.value % 200) / 2)));
const topZone = computed(() => summary.value.zoneBreakdown?.[0]?.zone || null);
const streakText = computed(() => {
  if (!summary.value.totalTasks) return 'No streak yet';
  if (summary.value.totalTasks > 20) return 'Elite streak';
  if (summary.value.totalTasks > 10) return 'Strong streak';
  return 'Getting started';
});
const studyPower = computed(() => {
  if (!summary.value.totalMinutes) return 'Use the dashboard to log tasks';
  return summary.value.averageFocus >= 80 ? 'High' : summary.value.averageFocus >= 60 ? 'Medium' : 'Growing';
});
const rankTitle = computed(() => {
  if (userLevel.value >= 6) return 'Master Tracker';
  if (userLevel.value >= 4) return 'Productivity Pro';
  if (userLevel.value >= 2) return 'Focused Runner';
  return 'Novice Builder';
});
const profileInitials = computed(() => {
  const names = profileName.value.trim().split(' ').filter(Boolean);
  if (!names.length) return 'LT';
  return names.map((part) => part[0].toUpperCase()).slice(0, 2).join('');
});
const profilePhotoStyle = computed(() => ({
  backgroundImage: profilePictureUrl.value ? `url(${profilePictureUrl.value})` : 'none',
}));

const loadProfileData = () => {
  profileName.value = userStore.user?.name || '';
  profilePictureUrl.value = userStore.user?.profile_picture_url || '';
};

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    profilePictureUrl.value = reader.result;
  };
  reader.readAsDataURL(file);
};

const saveProfile = async () => {
  if (!profileName.value.trim()) return;
  isSaving.value = true;
  try {
    await userStore.updateProfile({
      name: profileName.value.trim(),
      profile_picture_url: profilePictureUrl.value || null,
    });
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => userStore.user,
  () => {
    loadProfileData();
  },
  { immediate: true }
);

onMounted(async () => {
  if (!userStore.token) {
    return router.push('/login');
  }

  await userStore.fetchProfile();
  await taskStore.loadSummary();
  loadProfileData();
});
</script>

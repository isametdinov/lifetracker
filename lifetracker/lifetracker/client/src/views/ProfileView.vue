<template>
  <section class="profile-page">
    <aside class="sidebar">
      <div class="brand">{{ uiStore.translate('appName') }}</div>
      <nav>
        <router-link to="/dashboard" class="sidebar-link">{{ uiStore.translate('dashboard') }}</router-link>
        <router-link to="/profile" class="sidebar-link">{{ uiStore.translate('profile') }}</router-link>
      </nav>
      <button class="secondary" @click="logout">{{ uiStore.translate('logout') }}</button>
    </aside>

    <div class="profile-panel profile-dashboard">
      <header class="profile-header">
        <div class="profile-heading">
          <div class="profile-avatar-block">
            <div class="avatar-preview" :style="profilePhotoStyle">
              <span v-if="!profilePictureUrl">{{ profileInitials }}</span>
            </div>
            <label class="avatar-upload">
              {{ uiStore.translate('changePhoto') }}
              <input type="file" accept="image/*" @change="handleAvatarChange" />
            </label>
          </div>
          <div>
            <input class="profile-name-input" v-model="profileName" :placeholder="uiStore.translate('yourDisplayName')" />
            <p>{{ uiStore.translate('updateProfileNote') }}</p>
          </div>
        </div>

        <div class="level-chip">{{ uiStore.translate('rank') }} {{ rankTitle }}</div>
      </header>

      <section class="profile-grid">
        <article class="profile-card stats-card">
          <h3>{{ uiStore.translate('performanceSummary') }}</h3>
          <div class="stat-grid">
            <div>
              <span>{{ summary?.totalTasks ?? 0 }}</span>
              <p>{{ uiStore.translate('tasksCompleted') }}</p>
            </div>
            <div>
              <span>{{ summary?.totalMinutes ?? 0 }}</span>
              <p>{{ uiStore.translate('minutesLogged') }}</p>
            </div>
            <div>
              <span>{{ summary?.averageFocus ?? 0 }}%</span>
              <p>{{ uiStore.translate('averageFocusLabel') }}</p>
            </div>
          </div>
        </article>

        <article class="profile-card growth-card">
          <h3>{{ uiStore.translate('experienceGrowth') }}</h3>
          <div class="growth-bar">
            <span class="growth-label">{{ experiencePoints }} XP</span>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <p>{{ uiStore.translate('levelToNext', { level: userLevel.value, percent: progressPercent.value }) }}</p>
          </div>
        </article>

        <article class="profile-card badge-card">
          <h3>{{ uiStore.translate('masteryResults') }}</h3>
          <ul>
            <li>{{ uiStore.translate('focusStreak') }}: {{ streakText }}</li>
            <li>{{ uiStore.translate('topZone') }}: {{ topZone || uiStore.translate('noStreakYet') }}</li>
            <li>{{ uiStore.translate('studyPower') }}: {{ studyPower }}</li>
          </ul>
        </article>
      </section>

      <section class="profile-footer">
        <div class="profile-details">
          <div>
            <label>{{ uiStore.translate('email') }}</label>
            <input type="email" :value="user?.email" disabled />
          </div>
          <div>
            <label>{{ uiStore.translate('currentRank') }}</label>
            <input type="text" :value="rankTitle" disabled />
          </div>
        </div>
        <button class="primary" :disabled="isSaving || !profileName.trim()" @click="saveProfile">
          {{ isSaving ? uiStore.translate('saving') : uiStore.translate('saveProfile') }}
        </button>
      </section>

      <section class="activity-results">
        <div class="activity-results-header">
          <h3>{{ uiStore.translate('activityResults') }}</h3>
          <p>{{ uiStore.translate('recentInsights') }}</p>
        </div>

        <div class="activity-grid">
          <div class="activity-card">
            <strong>{{ summary?.totalTasks ?? 0 }}</strong>
            <span>{{ uiStore.translate('tasksCompleted') }}</span>
          </div>
          <div class="activity-card">
            <strong>{{ summary?.totalMinutes ?? 0 }}</strong>
            <span>{{ uiStore.translate('minutesLogged') }}</span>
          </div>
          <div class="activity-card">
            <strong>{{ summary?.averageFocus ?? 0 }}%</strong>
            <span>{{ uiStore.translate('averageFocusLabel') }}</span>
          </div>
          <div class="activity-card">
            <strong>{{ topZone || uiStore.translate('noStreakYet') }}</strong>
            <span>{{ uiStore.translate('topZone') }}</span>
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
import { useTaskStore } from '../stores/tasks';import { useUiStore } from '../stores/ui';
const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const uiStore = useUiStore();
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

const logout = () => {
  userStore.logout();
  router.push('/login');
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

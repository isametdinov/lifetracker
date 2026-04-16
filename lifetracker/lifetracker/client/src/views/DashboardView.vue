<template>
  <section class="dashboard-page">
    <aside class="sidebar">
      <div class="brand">LifeTracker AI</div>
      <nav>
        <router-link to="/dashboard" class="sidebar-link">Dashboard</router-link>
        <router-link to="/profile" class="sidebar-link">Profile</router-link>
      </nav>
      <button class="secondary" @click="logout">Logout</button>
    </aside>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <div>
          <h2>Welcome back, {{ userStore.user?.name || 'Tracker' }}</h2>
          <p>Here is your quick overview for staying focused and productive.</p>
        </div>
      </header>

      <section class="stats-grid">
        <article class="stat-card">
          <h3>Total tasks</h3>
          <p>{{ taskStore.summary?.totalTasks ?? taskStore.tasks.length }}</p>
        </article>

        <article class="stat-card">
          <h3>Completed</h3>
          <p>{{ completedCount }}</p>
        </article>

        <article class="stat-card">
          <h3>Pending</h3>
          <p>{{ pendingCount }}</p>
        </article>

        <article class="stat-card">
          <h3>Average focus</h3>
          <p>{{ taskStore.summary?.averageFocus ?? '—' }}</p>
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="panel">
          <div class="panel-header">
            <h3>AI Productivity Assistant</h3>
            <span>Smart task guidance</span>
          </div>
          <AiAssistant :summary="taskStore.summary || { totalTasks: 0, totalMinutes: 0, averageFocus: 0, zoneBreakdown: [] }" />
        </article>

        <article class="panel">
          <div class="panel-header">
            <h3>Focus analytics</h3>
            <span>See your task performance</span>
          </div>
          <AnalyticsChart :summary="taskStore.summary || { totalTasks: 0, totalMinutes: 0, averageFocus: 0 }" />
        </article>

        <article class="panel">
          <div class="panel-header">
            <h3>Motivation hub</h3>
            <span>Music for study and work</span>
          </div>
          <YouTubePanel />
        </article>

        <article class="panel">
          <div class="panel-header">
            <h3>Recent activity map</h3>
            <span>Tracked locations</span>
          </div>
          <MapView />
        </article>

        <article class="panel">
          <div class="panel-header">
            <h3>Log a new activity</h3>
            <span>Quick capture</span>
          </div>
          <TaskInput @task-created="refreshDashboard" />
        </article>

        <article class="panel task-panel">
          <div class="panel-header">
            <h3>Recent tasks</h3>
            <span>{{ taskStore.tasks.length }} tasks logged</span>
          </div>

          <ul class="task-list">
            <li v-for="task in taskStore.tasks.slice(0, 6)" :key="task.id" class="task-item">
              <div>
                <strong>{{ task.title || task.name || 'Untitled task' }}</strong>
                <p>{{ task.description || task.details || 'No additional details' }}</p>
              </div>
              <div class="task-item-actions">
                <button
                  type="button"
                  class="finish-button"
                  :disabled="task.completed"
                  @click="startReview(task)"
                >
                  {{ task.completed ? 'Completed' : 'Finish' }}
                </button>
                <button
                  v-if="task.completed"
                  type="button"
                  class="open-button"
                  @click="openTask(task)"
                >
                  Open
                </button>
                <span class="task-status">{{ task.completed ? 'Done' : 'Open' }}</span>
              </div>
            </li>
          </ul>

          <p v-if="!taskStore.tasks.length" class="empty-state">No tasks yet. Add your first task from the form above.</p>

          <div v-if="zoneBreakdown.length" class="zone-breakdown">
            <h4>Zone breakdown</h4>
            <ul>
              <li v-for="zone in zoneBreakdown" :key="zone.zone" class="zone-item">
                <span>{{ zone.zone }}</span>
                <strong>{{ zone.count }}</strong>
              </li>
            </ul>
          </div>
        </article>
      </section>

      <section v-if="activeReviewTask" class="review-panel">
        <div class="panel">
          <div class="panel-header">
            <h3>Task review</h3>
            <span>Answer a few questions before completing this task</span>
          </div>
          <AiAssistant
            :summary="taskStore.summary || { totalTasks: 0, totalMinutes: 0, averageFocus: 0, zoneBreakdown: [] }"
            :reviewTask="activeReviewTask"
            @review-complete="completeReview"
          />
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AnalyticsChart from '../components/AnalyticsChart.vue';
import AiAssistant from '../components/AiAssistant.vue';
import MapView from '../components/MapView.vue';
import TaskInput from '../components/TaskInput.vue';
import YouTubePanel from '../components/YouTubePanel.vue';
import { useUserStore } from '../stores/user';
import { useTaskStore } from '../stores/tasks';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();

const completedCount = computed(() => taskStore.tasks.filter((task) => task.completed).length);
const pendingCount = computed(() => taskStore.tasks.filter((task) => !task.completed).length);
const zoneBreakdown = computed(() => taskStore.summary?.zoneBreakdown || []);
const activeReviewTask = ref(null);

const logout = () => {
  userStore.logout();
  router.push('/login');
};

const refreshDashboard = async () => {
  await taskStore.loadTasks();
  await taskStore.loadSummary();
};

const startReview = (task) => {
  activeReviewTask.value = task;
};

const completeReview = async ({ taskId }) => {
  activeReviewTask.value = null;
  await taskStore.completeTask(taskId);
  await refreshDashboard();
};

const openTask = (task) => {
  activeReviewTask.value = task;
};

onMounted(async () => {
  if (!userStore.token) {
    return router.push('/login');
  }

  await userStore.fetchProfile();
  await taskStore.loadTasks();
  await taskStore.loadSummary();
});
</script>

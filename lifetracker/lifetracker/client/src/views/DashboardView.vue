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
          <p>{{ taskStore.tasks.length }}</p>
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

      <section class="panel task-panel">
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
            <span class="task-status">{{ task.completed ? 'Done' : 'Open' }}</span>
          </li>
        </ul>

        <p v-if="!taskStore.tasks.length" class="empty-state">No tasks yet. Add your first task from the task input section.</p>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useTaskStore } from '../stores/tasks';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();

const completedCount = computed(() => taskStore.tasks.filter((task) => task.completed).length);
const pendingCount = computed(() => taskStore.tasks.filter((task) => !task.completed).length);

const logout = () => {
  userStore.logout();
  router.push('/login');
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

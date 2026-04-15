<template>
  <section class="profile-page">
    <div class="profile-panel">
      <h2>Profile & Settings</h2>
      <div class="profile-card">
        <label>Name</label>
        <input type="text" :value="user?.name" disabled />
        <label>Email</label>
        <input type="email" :value="user?.email" disabled />
        <p class="hint">JWT-based auth keeps your session secure. Update preferences in the backend or profile settings later.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const user = userStore;

onMounted(async () => {
  if (!userStore.token) {
    return router.push('/login');
  }
  await userStore.fetchProfile();
});
</script>

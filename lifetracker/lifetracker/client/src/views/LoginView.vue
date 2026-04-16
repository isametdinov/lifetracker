<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1>LifeTracker AI</h1>
      <p>Sign in to your productivity dashboard.</p>
      <form @submit.prevent="onSubmit">
        <label>Email</label>
        <input v-model="email" type="email" required />
        <label>Password</label>
        <input v-model="password" type="password" required />
        <button type="submit">Sign In</button>
      </form>
      <p class="auth-note">Use admin@gmail.com / admin123 to sign in after registering.</p>
      <p class="auth-switch">
        Don't have an account? <router-link to="/register">Register</router-link>
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const email = ref('admin@gmail.com');
const password = ref('admin123');
const error = ref('');
const router = useRouter();
const userStore = useUserStore();

const onSubmit = async () => {
  try {
    error.value = '';
    await userStore.login(email.value, password.value);
    await router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to sign in.';
  }
};
</script>

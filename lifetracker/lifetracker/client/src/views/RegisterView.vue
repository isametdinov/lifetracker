<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1>Create your LifeTracker account</h1>
      <p>Register to access your productivity dashboard.</p>
      <form @submit.prevent="onSubmit">
        <label>Name</label>
        <input v-model="name" type="text" required />
        <label>Email</label>
        <input v-model="email" type="email" required />
        <label>Password</label>
        <input v-model="password" type="password" required />
        <button type="submit">Register</button>
      </form>
      <p class="auth-switch">
        Already have an account? <router-link to="/login">Sign In</router-link>
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const userStore = useUserStore();

const onSubmit = async () => {
  try {
    error.value = '';
    await userStore.register(name.value, email.value, password.value);
    await router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to register.';
  }
};
</script>

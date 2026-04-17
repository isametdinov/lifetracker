<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1>{{ uiStore.translate('signInTitle') }}</h1>
      <p>{{ uiStore.translate('signInDescription') }}</p>
      <form @submit.prevent="onSubmit">
        <label>{{ uiStore.translate('email') }}</label>
        <input v-model="email" type="email" required />
        <label>{{ uiStore.translate('password') }}</label>
        <input v-model="password" type="password" required />
        <button type="submit">{{ uiStore.translate('signIn') }}</button>
      </form>
      <p class="auth-note">{{ uiStore.translate('defaultAccountNote') }}</p>
      <p class="auth-switch">
        {{ uiStore.translate('haveAccount') }} <router-link to="/register">{{ uiStore.translate('register') }}</router-link>
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
/*
  Login view handles existing user sign-in.
  - Uses the user store to authenticate
  - Redirects to dashboard when successful
  - Displays localized labels through uiStore
*/
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useUserStore } from '../stores/user';

const uiStore = useUiStore();
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

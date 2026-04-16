<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1>{{ uiStore.translate('registerTitle') }}</h1>
      <p>{{ uiStore.translate('registerDescription') }}</p>
      <form @submit.prevent="onSubmit">
        <label>{{ uiStore.translate('name') }}</label>
        <input v-model="name" type="text" required />
        <label>{{ uiStore.translate('email') }}</label>
        <input v-model="email" type="email" required />
        <label>{{ uiStore.translate('password') }}</label>
        <input v-model="password" type="password" required />
        <button type="submit">{{ uiStore.translate('register') }}</button>
      </form>
      <p class="auth-note">{{ uiStore.translate('defaultAccountNote') }}</p>
      <p class="auth-switch">
        {{ uiStore.translate('alreadyHaveAccount') }} <router-link to="/login">{{ uiStore.translate('signIn') }}</router-link>
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useUserStore } from '../stores/user';

const uiStore = useUiStore();
const name = ref('Admin');
const email = ref('admin@gmail.com');
const password = ref('admin123');
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

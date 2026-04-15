import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';
import './assets/styles.css';
import 'leaflet/dist/leaflet.css';
import { useUserStore } from './stores/user';

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes,
});

app.use(pinia);
app.use(router);

router.beforeEach((to, from, next) => {
  const userStore = useUserStore(pinia);
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !userStore.token) {
    return next('/login');
  }

  if ((to.path === '/login' || to.path === '/register') && userStore.token) {
    return next('/dashboard');
  }

  return next();
});

app.mount('#app');

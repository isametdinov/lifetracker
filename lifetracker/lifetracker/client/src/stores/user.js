import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('lifetracker_token') || null,
  }),
  actions: {
    async login(email, password) {
      const response = await api.post('/auth/login', { email, password });
      this.user = response.data.user;
      this.token = response.data.token;
      localStorage.setItem('lifetracker_token', this.token);
      return response;
    },
    async register(name, email, password) {
      const response = await api.post('/auth/register', { name, email, password });
      this.user = response.data.user;
      this.token = response.data.token;
      localStorage.setItem('lifetracker_token', this.token);
      return response;
    },
    async fetchProfile() {
      const response = await api.get('/auth/me');
      this.user = response.data.user;
      return response;
    },
    async updateProfile(profileData) {
      const response = await api.patch('/auth/me', profileData);
      this.user = response.data.user;
      return response;
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('lifetracker_token');
    },
  },
});

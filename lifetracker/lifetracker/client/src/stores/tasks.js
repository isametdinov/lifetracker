import { defineStore } from 'pinia';
import api from '../services/api';

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    summary: null,
  }),
  actions: {
    async loadTasks() {
      const response = await api.get('/tasks');
      this.tasks = response.data.tasks;
      return response;
    },
    async loadSummary() {
      const response = await api.get('/tasks/summary');
      this.summary = response.data.summary;
      return response;
    },
    async createTask(payload) {
      const response = await api.post('/tasks/log', payload);
      this.tasks.unshift(response.data.task);
      return response;
    },
  },
});

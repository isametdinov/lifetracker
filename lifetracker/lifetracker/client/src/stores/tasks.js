/*
  Task store is responsible for task CRUD operations and dashboard analytics.
  - loadTasks/loadSummary: fetch current user data
  - createTask: add a new task and update list immediately
  - completeTask: mark tasks done and keep local state in sync
*/
import { defineStore } from 'pinia';
import api from '../services/api';

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    summary: null,
  }),
  actions: {
    // Load all tasks for the current user from the backend API
    async loadTasks() {
      const response = await api.get('/tasks');
      this.tasks = response.data.tasks;
      return response;
    },
    // Load summary analytics data for the dashboard
    async loadSummary() {
      const response = await api.get('/tasks/summary');
      this.summary = response.data.summary;
      return response;
    },
    // Create a new logged task and add it to the top of the local list
    async createTask(payload) {
      const response = await api.post('/tasks/log', payload);
      this.tasks.unshift(response.data.task);
      return response;
    },
    // Mark a task complete, then update the local task list with the server result
    async completeTask(taskId) {
      const response = await api.patch(`/tasks/${taskId}/complete`);
      const updatedTask = response.data.task;
      const index = this.tasks.findIndex((task) => String(task.id) === String(updatedTask.id));
      if (index !== -1) {
        this.tasks.splice(index, 1, updatedTask);
      } else {
        this.tasks = this.tasks.map((task) =>
          String(task.id) === String(updatedTask.id) ? updatedTask : task
        );
      }
      return response;
    },
  },
});

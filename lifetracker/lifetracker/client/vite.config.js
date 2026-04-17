/*
  Vite configuration for the client app.
  - Enables Vue plugin support
  - Configures development server proxy for backend API
*/
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});

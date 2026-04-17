<template>
  <div class="app-shell">
    <header class="app-toolbar">
      <div class="toolbar-brand">{{ uiStore.translate('appName') }}</div>
      <div class="toolbar-actions">
        <button type="button" class="toolbar-button" @click="uiStore.toggleTheme()">
          {{ uiStore.isDarkTheme ? uiStore.translate('lightMode') : uiStore.translate('darkMode') }}
        </button>

        <label class="toolbar-select">
          {{ uiStore.translate('language') }}
          <select v-model="locale">
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </label>
      </div>
    </header>

    <router-view />
  </div>
</template>

<script setup>
/*
  Root application shell.
  - Displays the top toolbar for theme and language switching
  - Initializes UI preferences on app load
  - Renders the current route view
*/
import { computed, onMounted } from 'vue';
import { useUiStore } from './stores/ui';

const uiStore = useUiStore();

const locale = computed({
  get: () => uiStore.locale,
  set: (value) => uiStore.setLocale(value),
});

onMounted(() => {
  uiStore.initialize();
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
}

.app-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.toolbar-brand {
  font-weight: 700;
  font-size: 1.15rem;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-button,
.toolbar-select select {
  border: 1px solid var(--border);
  border-radius: 9999px;
  padding: 10px 14px;
  background: var(--surface);
  color: var(--text-primary);
}

.toolbar-button {
  cursor: pointer;
}

.toolbar-select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}
</style>

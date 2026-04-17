<template>
  <form class="task-form" @submit.prevent="submitTask">
    <label>{{ uiStore.translate('taskTitle') }}</label>
    <input v-model="title" type="text" required />

    <label>{{ uiStore.translate('description') }}</label>
    <textarea v-model="description" rows="3" />

    <label>{{ uiStore.translate('zone') }}</label>
    <select v-model="zone" required>
      <option disabled value="">{{ uiStore.translate('selectZone') }}</option>
      <option>{{ uiStore.translate('university') }}</option>
      <option>{{ uiStore.translate('itPark') }}</option>
      <option>{{ uiStore.translate('office') }}</option>
      <option>{{ uiStore.translate('home') }}</option>
      <option>{{ uiStore.translate('mall') }}</option>
    </select>

    <label>{{ uiStore.translate('durationMinutes') }}</label>
    <input v-model.number="durationMinutes" type="number" min="0" />

    <button type="submit">{{ uiStore.translate('logActivity') }}</button>

    <p v-if="message" class="success">{{ message }}</p>
  </form>
</template>

<script setup>
/*
  Task input component captures new task details.
  - Gathers zone, duration, location, and notes
  - Sends the payload to the task store
  - Emits task-created when saved successfully
*/
import { defineEmits, ref, onMounted } from 'vue';
import { useTaskStore } from '../stores/tasks';
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();
const emit = defineEmits(['task-created']);
const title = ref('');
const description = ref('');
const zone = ref('');
const durationMinutes = ref(30);
const message = ref('');
const latitude = ref(0);
const longitude = ref(0);
const taskStore = useTaskStore();

const loadLocation = () => {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    latitude.value = position.coords.latitude;
    longitude.value = position.coords.longitude;
  });
};

onMounted(() => {
  loadLocation();
});

const submitTask = async () => {
  const payload = {
    title: title.value,
    description: description.value,
    zone: zone.value,
    durationMinutes: durationMinutes.value,
    latitude: latitude.value,
    longitude: longitude.value,
  };

  try {
    await taskStore.createTask(payload);
    title.value = '';
    description.value = '';
    zone.value = '';
    durationMinutes.value = 30;
    message.value = uiStore.translate('activityLogged');
    setTimeout(() => (message.value = ''), 3000);
    await taskStore.loadSummary();
    emit('task-created');
  } catch (err) {
    message.value = uiStore.translate('unableLogActivity');
  }
};
</script>

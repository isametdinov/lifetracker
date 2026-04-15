<template>
  <form class="task-form" @submit.prevent="submitTask">
    <label>Task Title</label>
    <input v-model="title" type="text" required />

    <label>Description</label>
    <textarea v-model="description" rows="3" />

    <label>Zone</label>
    <select v-model="zone" required>
      <option disabled value="">Select zone</option>
      <option>University</option>
      <option>IT Park</option>
      <option>Office</option>
      <option>Home</option>
      <option>Mall</option>
    </select>

    <label>Duration (minutes)</label>
    <input v-model.number="durationMinutes" type="number" min="0" />

    <button type="submit">Log Activity</button>

    <p v-if="message" class="success">{{ message }}</p>
  </form>
</template>

<script setup>
import { defineEmits, ref, onMounted } from 'vue';
import { useTaskStore } from '../stores/tasks';

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
    message.value = 'Activity logged successfully.';
    setTimeout(() => (message.value = ''), 3000);
    await taskStore.loadSummary();
    emit('task-created');
  } catch (err) {
    message.value = 'Unable to log activity.';
  }
};
</script>

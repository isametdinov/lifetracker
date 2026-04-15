<template>
  <div class="map-card">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';

const mapContainer = ref(null);

onMounted(() => {
  const map = L.map(mapContainer.value).setView([41.3111, 69.2797], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.marker([41.3111, 69.2797]).addTo(map).bindPopup('Sample Productivity Zone');
});
</script>

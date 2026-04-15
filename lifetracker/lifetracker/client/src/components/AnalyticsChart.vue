<template>
  <div class="chart-card">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { watch, ref, onMounted } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({ totalTasks: 0, totalMinutes: 0, averageFocus: 0 }),
  },
});

const canvas = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (!canvas.value) return;
  const data = {
    labels: ['Tasks', 'Minutes', 'Focus'],
    datasets: [
      {
        label: 'Personal Productivity',
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        data: [props.summary.totalTasks, props.summary.totalMinutes, props.summary.averageFocus],
      },
    ],
  };

  if (chartInstance) {
    chartInstance.data = data;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvas.value, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

onMounted(() => renderChart());
watch(() => props.summary, renderChart, { deep: true });
</script>

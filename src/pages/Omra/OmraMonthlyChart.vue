<template>
  <div class="chart-card">
    <h3 class="chart-title">Statistiques des Omras par Mois</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  labels: Array,         // Mois : ["Jan", "Fev", "Mar"...]
  confort: Array,        // Valeurs omra confort par mois
  eco: Array             // Valeurs omra eco par mois
});

const chartCanvas = ref(null);
let chartInstance = null;

onMounted(() => {
  renderChart();
});

watch(() => props, () => {
  if (chartInstance) chartInstance.destroy();
  renderChart();
}, { deep: true });

function renderChart() {
  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels: props.labels,
      datasets: [
        {
          label: "Omra Confort",
          data: props.confort,
          backgroundColor: "#1e3a8a", // bleu foncé
          borderRadius: 6,
        },
        {
          label: "Omra Éco",
          data: props.eco,
          backgroundColor: "#93c5fd", // bleu clair
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: { enabled: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
</script>

<style>
.chart-card {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 900px;
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #1e3a8a;
}
</style>

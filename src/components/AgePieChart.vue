<template>
  <div class="chart-card">
    <h3 class="chart-title">Ciblage d’âge des pèlerins</h3>

    <canvas ref="chartCanvas"></canvas>

    <div class="legend">
      <div class="legend-item">
        <span class="color adult"></span> Adultes : {{ adultPercent }}%
      </div>
      <div class="legend-item">
        <span class="color child"></span> Enfants : {{ childPercent }}%
      </div>
      <div class="legend-item">
        <span class="color baby"></span> Bébés : {{ babyPercent }}%
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(PieController, ArcElement, Tooltip, Legend);

const props = defineProps({
  adults: Number,
  children: Number,
  babies: Number,
});

const chartCanvas = ref(null);
let chart = null;

// ✅ Calcule les pourcentages
const computePercent = () => {
  const total = props.adults + props.children + props.babies;
  if (total === 0) return [0, 0, 0];

  return [
    Math.round((props.adults / total) * 100),
    Math.round((props.children / total) * 100),
    Math.round((props.babies / total) * 100),
  ];
};

// ✅ Montre le graphique au montage
onMounted(() => {
  const [adult, child, baby] = computePercent();

  chart = new Chart(chartCanvas.value, {
    type: "pie",
    data: {
      labels: ["Adultes", "Enfants","Bébés"],
      datasets: [
        {
          data: [adult, child, baby],
          backgroundColor: ["#0006ff", "#fff900", "#10b981"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  });
});

// ✅ Met à jour automatiquement quand les valeurs changent
watch(
  () => [props.adults, props.children, props.babies],
  () => {
    if (!chart) return;

    const [adult, child, baby] = computePercent();
    chart.data.datasets[0].data = [adult, child, baby];
    chart.update();
  }
);

// ✅ Pour affichage texte
const adultPercent = computed(() => computePercent()[0]);
const childPercent = computed(() => computePercent()[1]);
const babyPercent  = computed(() => computePercent()[2]);
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  padding: 18px;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

  width: 100%;
  max-width: 300px;
  margin-left: auto !important;
  margin-right: 0 !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

canvas {
  width: 100% !important;
  height: 160px !important; /* compact et beau */
}

.chart-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
  text-align: center;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

 


.chart-title {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 10px;
}

 
 
.legend-item {
  font-size: 14px;
  margin-bottom: 6px;
  color: #475569;
  display: flex;
  align-items: center;     /* ✅ Aligne les textes parfaitement */
  height: 20px;            /* ✅ Corrige le décalage du 3e élément */
}

.color {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 6px;
}

.adult { background: #0006ff; }
.child { background: #fff900; }
.baby  { background: #10b981; }
</style>
 
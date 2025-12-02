<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="month-selector" ref="monthSelector">
        <i class="fas fa-calendar-alt calendar-icon"></i>
        <span class="month-label">{{ formattedMonth }}</span>
        <i class="fas fa-chevron-down arrow"></i>

        <!-- Champ invisible -->
        <input
          ref="monthInput"
          type="month"
          v-model="selectedMonth"
          class="hidden-month-input"
          @change="onMonthChange"
        />
      </div>

<button class="download-btn" @click="downloadReport">
  <i class="fas fa-download"></i> Télécharger le rapport
</button>

    </div>

    <h2 class="page-title">Tableau de Bord</h2>

    <div class="stats-grid">





      <div class="stat-card" @click="goToDevis">
        <div class="stat-icon reservations"><i class="fas fa-calendar-check"></i></div>
        <div class="stat-info">
          <h3>Réservations</h3>
          <p>{{ totalReservations }}</p>
        </div>
      </div>




  <div class="stat-card" @click="goToPelerins">
  <div class="stat-icon-pelerins">
    <span class="fas fa-kaaba"><i class="fas fa-user"></i></span>
  </div>
  <div class="stat-info">
    <h3>Pèlerins ayant réservé</h3>
    <p>{{ totalPelerins }}</p>
  </div>
</div>




   <div class="stat-card" @click="goToOmras">
        <div class="stat-icon omras"><i class="fas fa-kaaba"></i></div>
        <div class="stat-info">
          <h3>Omras</h3>
          <p>{{ totalOmras }}</p>
        </div>
      </div>


      <div class="stat-card" @click="goToClients">
        <div class="stat-icon clients"><i class="fas fa-user-group"></i></div>
        <div class="stat-info">
          <h3>Clients</h3>
          <p>{{ totalClients }}</p>
        </div>
      </div>

   



      <div class="stat-card" @click="goToHotels">
        <div class="stat-icon hotels"><i class="fas fa-building"></i></div>
        <div class="stat-info">
          <h3>Hôtels</h3>
          <p>{{ totalHotels }}</p>
        </div>
      </div>



    </div>
          <!-- ✅ Ajouter ton graphique ici -->
<!-- ✅ La carte est MAINTENANT en dehors de la grid -->
<div class="age-chart-container">
  <div class="age-chart-floating">
  <AgePieChart
    :adults="totalAdults"
    :children="totalChildren"
    :babies="totalBabies"
  />

</div>




  </div>
  <div class="chart-section">
  <div class="chart-card">
    <div class="chart-title">Statistiques des Omras par Mois</div>

    <OmraMonthlyChart 
      :labels="chartLabels"
      :confort="chartConfort"
      :eco="chartEco"
      class="chart-container"
    />
  </div>
</div>

</div>




</template>

<style scoped>
.dashboard-container {
  background: #f9fbff;
  min-height: 100vh;
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* ----------- STATS GRID ----------- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 25px;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 40px auto 0;
}

/* ----------- CARDS ----------- */
.stat-card {
  height: 100px;
  background: #fff;
  border-radius: 14px;
  padding: 20px 25px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: .3s;
  cursor: pointer;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(59,130,246,0.15);
}

/* ----------- ICONES ----------- */
.stat-icon,
.stat-icon-pelerins {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #f7f7f5;
  color: #000;
}
.stat-icon {
  width: 70px;
  height: 60px;
  font-size: 28px;
}
.stat-icon-pelerins {
  width: 110px;
  height: 60px;
  font-size: 28px;
}

.stat-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 4px;
}
.stat-info p {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* ----------- TITRE ----------- */
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
}

/* ----------- HEADER ----------- */
.dashboard-header {
  position: fixed;
  top: 40px;
  right: 40px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
}

/* Sélecteur mois */
.month-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  padding: 6px 12px;
  width: 170px;
  height: 34px;
  cursor: pointer;
  gap: 8px;
  transition: .2s;
}
.month-selector:hover { border-color: #d1d5db; }
.calendar-icon { font-size: 14px; color: #9ca3af; }
.month-label { font-size: 14px; font-weight: 500; color: #9ca3af; flex: 1; }
.arrow { font-size: 11px; color: #9ca3af; }

.hidden-month-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

/* ----------- Bouton téléchargement ----------- */
.download-btn {
  background: linear-gradient(90deg,#22c55e,#16a34a);
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 8px 18px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: .3s;
}
.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34,197,94,0.4);
}

/* ======================================================
      RESPONSIVE EXACT SANS MODIFIER TON DESIGN
====================================================== */

/* 1400px → 4 cartes */
@media (max-width: 1400px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

/* 1200px → 3 cartes */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
  .dashboard-container { padding: 30px; }
}

/* 900px → 2 cartes */
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-header { right: 20px; top: 20px; }
  .stat-card { height: 90px; padding: 18px; }
  .stat-info h3 { font-size: 14px; }
  .stat-info p { font-size: 20px; }
}

/* MOBILE 600px */
@media (max-width: 600px) {
  .dashboard-container { padding: 20px 15px; }
  .page-title { font-size: 20px; }

  .dashboard-header {
    position: relative;
    top: 0;
    right: 0;
    width: 100%;
    margin-bottom: 20px;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
    padding: 6px 14px;
    font-size: 12px;
  }

  .month-selector {
    width: 100%;
    height: 32px;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 18px;
  }

  .stat-card {
    height: auto;
    padding: 18px;
  }

  .stat-icon,
  .stat-icon-pelerins {
    width: 55px;
    height: 55px;
    font-size: 22px;
  }
}

/* 768px → header en colonne */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
    width: 100%;
    margin-left: 60px !important;
  }
  .download-btn { max-width: 100%; white-space: nowrap; }
  .month-selector { width: auto !important; }
}

/* AGE CHART */
.age-chart-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.age-chart-wrapper {
  display: flex;
  justify-content: flex-end;
}
.age-chart-floating {
  position: absolute;
  top: 280px;
  right: -50px;
  z-index: 10;
}

/* 991px → corrige espacement */
@media (max-width: 991px) {
  .dashboard-header { margin-left: 60px !important; }
}

/* -------- CHART SECTION -------- */
.chart-section {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-right: 258px;
}
.chart-card {
  width: 900px;
  padding: 25px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
.chart-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 15px;
}
.chart-container {
  width: 100% !important;
  height: 380px !important;
}



</style>




<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api";
import { useRouter, useRoute } from "vue-router";
import AgePieChart from "@/components/AgePieChart.vue";


import OmraMonthlyChart from "@/pages/Omra/OmraMonthlyChart.vue";




const router = useRouter();
const route = useRoute();

const totalClients = ref(0);
const totalOmras = ref(0);
const totalPelerins = ref(0);
const totalHotels = ref(0);
const totalReservations = ref(0);

// ✅ Nouveaux champs pour le graph d’âge
const totalAdults = ref(0);
const totalChildren = ref(0);
const totalBabies = ref(0);

const now = new Date();
const selectedMonth = ref(now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0"));const formattedMonth = ref("This Month");
const monthInput = ref(null);
const monthSelector = ref(null);

// ✅ Met à jour le label visible
const updateMonthLabel = () => {
  const [year, month] = selectedMonth.value.split("-");
  const date = new Date(year, month - 1);
  formattedMonth.value = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
};

// ✅ Recharge les stats quand le mois change
const onMonthChange = async () => {
  updateMonthLabel();
  await fetchDashboardStats();
};


// ✅ Charge les stats selon le mois choisi
// ✅ Charge les stats selon le mois choisi
const fetchDashboardStats = async () => {
  try {
    const [year, month] = selectedMonth.value.split("-");

    const response = await api.get(`/admin/stats`, {
      params: { year, month }
    });

    // ✅ Statistiques classiques
    totalClients.value = response.data.totalClients ?? 0;
    totalOmras.value = response.data.totalOmras ?? 0;
    totalPelerins.value = response.data.totalPelerins ?? 0;
    totalHotels.value = response.data.totalHotels ?? 0;
    totalReservations.value = response.data.totalReservations ?? 0;

    // ✅ Ciblage d'âge
    totalAdults.value = response.data.totalAdults ?? 0;
    totalChildren.value = response.data.totalChildren ?? 0;
    totalBabies.value = response.data.totalBabies ?? 0;

  } catch (error) {
    console.error("Erreur chargement stats :", error);
  }

  console.log("=== CIBLAGE D'ÂGE ===");
console.log("Adultes :", totalAdults.value);
console.log("Enfants :", totalChildren.value);
console.log("Bébés :", totalBabies.value);

};



// ✅ Navigation
const goToClients = () => router.push("/admin/clients");
const goToHotels = () => router.push("/admin/hotels");

const goToPelerins = () => {
  const [year, month] = selectedMonth.value.split("-");
  router.push(`/admin/devis?year=${year}&month=${month}&type=pelerins`);
};

const goToDevis = () => {
  const [year, month] = selectedMonth.value.split("-");
  router.push(`/admin/devis?year=${year}&month=${month}&type=reservations`);
};

const goToOmras = () => {
  const [year, month] = selectedMonth.value.split("-");
  router.push(`/admin/omras?year=${year}&month=${month}`);
};

// ✅ Ouvre le sélecteur de mois
onMounted(() => {
  const open = () =>
    monthInput.value?.showPicker?.() || monthInput.value?.focus();
  monthSelector.value?.addEventListener("click", open);

  updateMonthLabel();
  fetchDashboardStats();
    loadOmraChartData();   // NOUVELLE API

});







 








const chartLabels = ref([]);
const chartConfort = ref([]);
const chartEco = ref([]);

const loadOmraChartData = async () => {
  const res = await api.get("/admin/stats-omra-chart");

  chartLabels.value = res.data.chartLabels ?? [];
  chartConfort.value = res.data.chartConfort ?? [];
  chartEco.value = res.data.chartEco ?? [];
};

 


const downloadReport = async () => {
  const [year, month] = selectedMonth.value.split("-");

  try {
    const response = await api.get("/admin/report/monthly", {
      params: { year, month },
      responseType: "blob",   // 🔥 important pour recevoir un PDF
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport_${year}_${month}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("🔥 ERREUR DU BACKEND :", error);

    if (error.response) {
      console.log("📄 Réponse brute :", error.response.data);
      console.log("🔢 Code HTTP :", error.response.status);
    }

    alert("Impossible de télécharger le rapport.");
  }
};

</script>

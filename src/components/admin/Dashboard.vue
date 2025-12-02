<template>
  <div class="dashboard-wrapper">
    <h2 class="page-title">Tableau de Bord</h2>

    <div class="stats-grid">
      <div class="stat-card clickable" @click="goToClients">
        <h3>Total Clients</h3>
        <p>{{ totalClients }}</p>
      </div>

      <div class="stat-card">
        <h3>Total Réservations</h3>
        <p>{{ totalReservations }}</p>
      </div>

      <div class="stat-card">
        <h3>Total Omras</h3>
        <p>{{ totalAdmins }}</p>
      </div>
      
      <div class="stat-card">
        <h3>Total Hotels</h3>
        <p>{{ totalAdmins }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import { useRouter } from "vue-router";



const router = useRouter();
const totalClients = ref(0);
const totalReservations = ref(0);
const totalAdmins = ref(0);

const fetchDashboardStats = async () => {
  try {
    // 🔹 Appelle ton backend (à adapter selon tes routes Laravel)
    const response = await api.get("/admin/stats");

    totalClients.value = response.data.totalClients;
    totalReservations.value = response.data.totalReservations;
    totalAdmins.value = response.data.totalAdmins;
  } catch (error) {
    console.error("Erreur chargement stats :", error);
  }

  
};



const goToClients = () => {
  router.push("/admin/clients");
};

onMounted(fetchDashboardStats);
</script>
<style scoped>
/* === Structure de base === */
.page-content,
.dashboard-wrapper {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.dashboard-wrapper {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.page-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: bold;
  color: #1e3a8a;
}

/* === Grille principale === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}



/* ✅ Style pour rendre cliquable */

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background: #eef3ff;
}

.stat-card h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.stat-card p {
  font-size: 26px;
  font-weight: bold;
  color: #2c3e50;
}






/* === Carte statistique === */
.stat-card {
  background: #f9fbff;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.stat-card p {
  font-size: 26px;
  font-weight: bold;
  color: #2c3e50;
}

/* === 🌍 Responsive pour la Dashboard === */

/* Tablettes (≤ 992px) */
@media (max-width: 992px) {
  .dashboard-wrapper {
    padding: 15px;
  }

  .page-title {
    font-size: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .stat-card {
    padding: 18px;
  }

  .stat-card h3 {
    font-size: 15px;
  }

  .stat-card p {
    font-size: 22px;
  }
}

/* Smartphones (≤ 768px) */
@media (max-width: 768px) {
  .dashboard-wrapper {
    padding: 12px;
  }

  .page-title {
    font-size: 18px;
    margin-bottom: 15px;
  }

  /* ✅ Passe en affichage vertical */
  .stats-grid {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .stat-card {
    width: 100%;
    padding: 20px;
    border-radius: 8px;
  }

  .stat-card h3 {
    font-size: 14px;
  }

  .stat-card p {
    font-size: 20px;
  }
}

/* Petits mobiles (≤ 480px) */
@media (max-width: 480px) {
  .dashboard-wrapper {
    padding: 10px;
  }

  .page-title {
    font-size: 16px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-card h3 {
    font-size: 13px;
  }

  .stat-card p {
    font-size: 18px;
  }
}


</style>

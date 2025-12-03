<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">📋 Liste des Devis</h2>

    <!-- 🔍 Barre de recherche stylée -->
    <div style="position: relative; width: 100%; max-width: 350px;">
      <i
        class="fa fa-search"
        style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #888;"
      ></i>
      <input
        v-model="search"
        type="text"
        class="form-control"
        placeholder="    Rechercher par nom, email ou séjour..."
        style="
          border-radius: 50px;
          background-color: #f8f9fa;
          padding: 10px 15px 10px 38px;
          border: 1px solid #dee2e6;
          box-shadow: none;
        "
      />
    </div>

    <!-- 📊 Tableau des devis -->
<div class="table-responsive-mobile">
  <table class="table table-striped table-bordered">
      <thead class="table-dark">
        <tr>
          <th>Séjour</th>
          <th>Nom</th>
          <th>Email</th>
          <th>Téléphone</th>
          <th>Prix (€)</th>
          <th>Type chambre</th>
           <th>État</th>   <!-- ✅ AJOUT ICI -->

          <th>Créé le</th>
          <th>Devis</th>
           <th>Action </th>

        </tr>
      </thead>
     <tbody>
<tr
  v-for="item in filteredDevis"
  :key="item.id"
  @dblclick="ouvrirPopup(item)"    
  style="cursor: pointer;"
>

    <td>{{ item.omra_titre }}</td>
    <td>{{ item.nom_client }} {{ item.prenom_client }}</td>
    <td>{{ item.email_client }}</td>
    <td>{{ item.tel_client }}</td>
    <td>{{ item.montant_total }}</td>
    <td>{{ item.type_chambre }}</td>
    <td>
  <span 
  :class="[
    'etat-badge',
    item.reservation?.etat_reservation === 'en_attente' ? 'etat-pending' :
    item.reservation?.etat_reservation === 'acompte_paye' ? 'etat-acompte' :
    item.reservation?.etat_reservation === 'paye' ? 'etat-complete' :
    item.reservation?.etat_reservation === 'expire' ? 'etat-expire' :
item.reservation?.etat_reservation === 'annule' ? 'etat-annule' :

    'etat-canceled'
  ]"
>
  {{
    item.reservation?.etat_reservation === 'en_attente' ? 'En attente' :
    item.reservation?.etat_reservation === 'acompte_paye' ? 'Acompte payé' :
    item.reservation?.etat_reservation === 'paye' ? 'Payé' :
    item.reservation?.etat_reservation === 'expire' ? 'Expiré' :
item.reservation?.etat_reservation === 'annule' ? 'Annulé' :

    'Annulé'
  }}
</span>

    </td>
    <td>{{ formatDate(item.created_at) }}</td>
    <td>
      <button class="btn btn-sm btn-primary" @click="voirPdf(item)">
        Devis (voir)
      </button>

      
    </td>
<td>
<button 
  class="trash-icon-btn"
  @click.stop="ouvrirConfirmDevis(item)"
  title="Supprimer"
>
  <i class="fas fa-trash-alt"></i>
</button>

</td>


  </tr>
</tbody>

</table>
</div>
  </div>







<!-- 🌟 POPUP MODERNE DE MODIFICATION D'ÉTAT -->
<div v-if="showPopup" class="popup-overlay">
  <div class="popup-container animate-popup">
    <h4 class="popup-title">🛠️ Modifier l’état de la réservation</h4>

    <p class="popup-client">
      <strong>{{ selectedItem?.nom_client }} {{ selectedItem?.prenom_client }}</strong><br />
      <span class="popup-details">
        {{ selectedItem?.omra_titre }} — {{ selectedItem?.type_chambre }} — 
        {{ formatDate(selectedItem?.created_at) }}
      </span>
    </p>

    <!-- ✅ Boutons radio horizontaux -->
    <div class="etat-options-horizontal">
      <label v-for="option in etatsDisponibles" :key="option.value" class="radio-item">
        <input
          type="radio"
          :value="option.value"
          v-model="etatSelectionne"
          name="etat_reservation"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>

    <!-- ✅ Boutons d’action -->
    <div class="popup-actions">
      <button class="btn-modern-green" @click="sauvegarderEtat">✅ Modifier</button>
      <button class="btn-modern-cancel" @click="fermerPopup">✖ Annuler</button>
    </div>
  </div>
</div>
<!-- 🌟 TOAST CENTRÉ MODERNE -->
<div v-if="toast.show" class="toast-center" :class="toast.type">
  <div class="toast-center-content">
    <i v-if="toast.type === 'success'" class="fas fa-check-circle icon-success"></i>
    <i v-if="toast.type === 'error'" class="fas fa-times-circle icon-error"></i>

    <div>
      <h3>{{ toast.title }}</h3>
      <p>{{ toast.message }}</p>
    </div>
  </div>
</div>





 <ConfirmPopup
  v-model="showConfirmDelete"
  variant="warning"
  title="Confirmation"
  :message="`Confirmer la suppression du devis « ${confirmTarget?.omra_titre || ''} – ${confirmTarget?.nom_client || ''} ${confirmTarget?.prenom_client || ''} » ?`"
  ok-text="Supprimer"
  cancel-text="Annuler"
  @confirm="validerSuppressionDevis"
  @cancel="showConfirmDelete = false"
/>



</template>




<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "@/services/api";
import Swal from "sweetalert2";
import ConfirmPopup from "@/components/popups/ConfirmPopup.vue"




const devis = ref([]);
const search = ref("");
const route = useRoute(); // pour lire year, month, type depuis l’URL

// ✅ Charge les devis avec les bons filtres
const fetchDevis = async () => {
  try {
    const { year, month, type } = route.query;

    console.log("📡 Envoi des paramètres :", { year, month, type });

    const res = await axios.get("/admin/devis", {
      params: { year, month, type },
    });

    devis.value = res.data;
  } catch (error) {
    console.error("Erreur lors du chargement des devis:", error);
  }
};

// ✅ Recharge automatiquement si l’URL change
watch(
  () => route.query,
  () => {
    fetchDevis();
  },
  { deep: true, immediate: true }
);

// ✅ Filtrage texte côté front
const filteredDevis = computed(() =>
  devis.value.filter((d) =>
    `${d.nom_client} ${d.prenom_client} ${d.email_client} ${d.omra_titre}`
      .toLowerCase()
      .includes(search.value.toLowerCase())
  )
);

// ✅ Voir le PDF
const voirPdf = (item) => {
  if (!item?.pdf_path) {
    alert("Aucun fichier PDF trouvé pour ce devis.");
    return;
  }

  const envBase = import.meta.env.VITE_API_URL;
  const base = (envBase && envBase.trim()) || "http://127.0.0.1:8000";

  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = String(item.pdf_path).replace(/^\/+/, "");
  const url = `${normalizedBase}/${normalizedPath}`;
  window.open(url, "_blank", "noopener");
};

// ✅ Formater la date
const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

onMounted(fetchDevis);






const showPopup = ref(false);
const selectedItem = ref(null);
const etatSelectionne = ref("pending");

const etatsDisponibles = [
  { value: "en_attente", label: "En attente" },
  { value: "acompte_paye", label: "Acompte payé" },
  { value: "paye", label: "Payé" },
  { value: "expire", label: "Expiré" },
   { value: "annule", label: "Annulé" },
 ];



 
const ouvrirPopup = (item) => {
 
  selectedItem.value = item;
  etatSelectionne.value = item.reservation?.etat_reservation || "pending";
  showPopup.value = true;
};

const fermerPopup = () => {
  showPopup.value = false;
  selectedItem.value = null;
};







 

// ============================================
//  Sauvegarder l'état (DEMANDE)
// ============================================
const sauvegarderEtat = async () => {
  if (!selectedItem.value) return;

  try {
    // 🔥 Appel API (identique à Postman)
    const res = await axios.put(
      `/admin/devis/${selectedItem.value.id}/update-etat`,
      {
        etat: String(etatSelectionne.value), // 🔥 OBLIGATOIRE
      }
    );

    if (res.data.success) {
      // 🔄 Met à jour dans la table sans recharger
      const index = devis.value.findIndex(
        (d) => d.id === selectedItem.value.id
      );

     if (index !== -1) {
    const newEtat = res.data.etat ?? etatSelectionne.value;

    // ➤ Mise à jour du devis
    devis.value[index].statut = newEtat;

    // ➤ Mise à jour de la réservation liée
    if (devis.value[index].reservation) {
        devis.value[index].reservation.etat_reservation = newEtat;
    }

    // ➤ Mise à jour du texte affiché dans la colonne (badge)
    devis.value[index].reservation_status_label =
        newEtat === "en_attente" ? "En attente" :
        newEtat === "acompte_paye" ? "Acompte payé" :
        newEtat === "paye" ? "Payé" :
        newEtat === "expire" ? "Expiré" :
          newEtat === "annule" ? "Annulé" :

        "Annulé";
}


      showPopup.value = false;

      // 🟢 Toast moderne
showToast(
  "État mis à jour",
  "La réservation a été modifiée avec succès.",
  "success"
);
    } else {
      showToast("⚠️ " + (res.data.message || "Erreur lors de la mise à jour."), "error");
    }
  } catch (err) {
    console.error("Erreur :", err);
showToast(
  "Erreur",
  "Une erreur est survenue lors de la mise à jour.",
  "error"
);
  }
};

// ============================================







//  Système Toast moderne
// ============================================
const toast = ref({
  show: false,
  title: "",
  message: "",
  type: "success",
});

const showToast = (title, message, type = "success") => {
  toast.value = {
    show: true,
    title,
    message,
    type,
  };
  setTimeout(() => {
    toast.value.show = false;
  }, 2500);
};





const showConfirmDelete = ref(false)
const confirmTarget = ref(null)


const ouvrirConfirmDevis = (item) => {
  confirmTarget.value = item
  showConfirmDelete.value = true
}

const validerSuppressionDevis = async () => {
  const id = confirmTarget.value?.id
  if (!id) return
  
  try {
    await axios.delete(`/admin/devis/${id}`)
    
    // Supprime dans la liste
    devis.value = devis.value.filter((d) => d.id !== id)

    // Ferme popup
    showConfirmDelete.value = false

    // Notification
    showToast("Supprimé", "Le devis a été supprimé avec succès.", "success")

  } catch (error) {
    showToast("Erreur", "Impossible de supprimer le devis.", "error")
  }
}




</script>






<style scoped>




/* 🌿 Conteneur général */
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 25px;
  background-color: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 🧭 Titre */
h2.text-center {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 25px;
}

/* 🔍 Barre de recherche */
.form-control {
  border-radius: 10px;
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  outline: none;
}

/* 🧾 Tableau principal */
.table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  background-color: #ffffff;
}

.table thead {
  background: linear-gradient(90deg, #e0e7ff, #dbeafe);
  color: #1e3a8a;
}

.table th {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
  font-weight: 600;
  padding: 12px;
  text-align: left;
}

.table td {
  padding: 14px 12px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
}

/* 🌈 Ligne survolée */
.table tr:hover {
  background-color: #ffffff;
  transition: background 0.3s ease;
}

/* 💰 Prix */
.table td:nth-child(5) {
  font-weight: 600;
  color: #b38b00;
}

/* 🏨 Type chambre */
.table td:nth-child(6) {
  font-weight: 500;
  color: #2563eb;
}

/* 🧩 Bouton "Voir PDF" */
.btn.btn-primary {
  background: #dcdcdd;
  color: #fc1717;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;



  font-size: 13px;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn.btn-primary:hover {
  background: #1e40af;
  transform: scale(1.05);
}

/* 🧩 Icône PDF */
.btn.btn-primary::before {
  content: "📄";
  font-size: 15px;
}



/* ✅ ADAPTATION MOBILE */
@media (max-width: 768px) {

  /* ✅ Le conteneur prend toute la largeur */
  .container {
    max-width: 100% !important;
    margin: 10px auto !important;
    padding: 15px !important;
    border-radius: 10px !important;
  }

  /* ✅ Le titre se rétrécit un peu */
  h2.text-center {
    font-size: 20px !important;
    margin-bottom: 15px !important;
  }

  /* ✅ Barre de recherche full width */
  .form-control {
    width: 100% !important;
    font-size: 14px !important;
    padding: 8px 12px 8px 35px !important;
  }

  /* ✅ Tableau scrollable horizontalement (indispensable sur mobile) */
  .table {
    display: block;
    width: 100% !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    border-radius: 10px !important;
  }

  /* ✅ En-tête du tableau */
  .table th {
    font-size: 11px !important;
    padding: 10px 8px !important;
  }

  /* ✅ Cellules du tableau */
  .table td {
    font-size: 12px !important;
    padding: 10px 8px !important;
  }

  /* ✅ Bouton "Voir" adapté au mobile */
  .btn.btn-primary {
    font-size: 11px !important;
    padding: 5px 10px !important;
    border-radius: 6px !important;
  }

  /* ✅ Icône PDF plus petite */
  .btn.btn-primary::before {
    font-size: 13px !important;
  }
}


.etat-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: white !important;
  display: inline-block;
  text-align: center;
  min-width: 110px;
}

/* 🟧 En attente */
.etat-pending {
  background-color:#b38b00;
}

/* 🟦 Acompte payé */
.etat-acompte {
  background-color: #0275d8;
}

/* 🟩 Paiement complet */
.etat-complete {
  background-color: #28a745;
}

/* 🔴 Annulé */
.etat-canceled {
  background-color: #d9534f;
}




 





/* 🌙 Arrière-plan flouté */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 20, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* 🌟 Conteneur principal */
.popup-container {
  background: #ffffff;
  border-radius: 18px;
  padding: 30px 35px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12);
  text-align: center;
  animation: fadeIn 0.3s ease-in-out;
}

/* ✨ Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.popup-client {
  font-size: 15px;
  color: #374151;
  margin-bottom: 15px;
}

.popup-details {
  font-size: 13px;
  color: #6b7280;
}

.etat-options-horizontal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}


.radio-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  width: 80px;              /* même largeur pour tous */
  height: 85px;              /* même hauteur pour tous */  text-align: center;
  border: 1px solid #ddd;
  transition: 0.2s;
}

.radio-item:hover {
  transform: scale(1.03);
}

.radio-item input {
  margin-right: 6px;
  accent-color: #2563eb;
}

/* 🟩 Boutons d’action */
.popup-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

/* ✅ Bouton "Modifier" */
.btn-modern-green {
  background: linear-gradient(90deg, #16a34a, #22c55e);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);
  transition: all 0.25s ease;
  cursor: pointer;
}

.btn-modern-green:hover {
  background: linear-gradient(90deg, #15803d, #16a34a);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.4);
}

/* ❌ Bouton Annuler */
.btn-modern-cancel {
  background: #f3f4f6;
  color: #374151;
  padding: 10px 20px;
  

  font-weight: 500;
  font-size: 14px;
  transition: all 0.25s ease;
    cursor: pointer;

}

.btn-modern-cancel:hover {
  background: #e5e7eb;
  color: #111827;
  transform: translateY(-2px);
}

/* 🟥 Expiré */
.etat-expire {
  background-color: #FF7043;
}


/* 🟥 Expiré */
.etat-annule {
  background-color: #d9534f;
}
/* ✅ Format tablette (768 - 1024px) */
@media (max-width: 1024px) {
  .container {
    max-width: 95% !important;
    padding: 20px !important;
  }
}


.toast-container {
  position: fixed;
  bottom: 25px;
  right: 25px;
  background: #333;
  padding: 14px 22px;
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  opacity: 0.95;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: fadeSlide 0.3s ease-out;
}

.toast-success {
  background-color: #2ecc71;
}

.toast-error {
  background-color: #e74c3c;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🌟 Toast Centré Ultra Moderne */
.toast-center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  background: #ffffff;
  width: 420px;
  max-width: 90%;
  padding: 25px 30px;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  animation: toastZoom 0.35s ease-out;
  z-index: 9999;
  text-align: left;
  font-family: "Poppins", sans-serif;
}

@keyframes toastZoom {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.toast-center.success {
  border-left: 8px solid #22c55e;
}

.toast-center.error {
  border-left: 8px solid #ef4444;
}

.toast-center-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.toast-center-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.toast-center-content p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.icon-success {
  font-size: 45px;
  color: #22c55e;
}

.icon-error {
  font-size: 45px;
  color: #ef4444;
}









/* ============================
   POPUP SUPPRESSION — STYLE PRO
   ============================ */

/* Cercle blanc + icône rouge */
.delete-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #ffffff;
  border-radius: 50%;
  margin: -65px auto 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
}

/* Icône poubelle rouge */
.delete-icon {
  font-size: 34px;
  color: #e63946; /* rouge moderne */
}


/* Conteneur popup SweetAlert */
.swal-popup-delete {
  border-radius: 22px !important;
  padding: 40px 30px 32px !important;
  width: 430px !important;
  box-shadow: 0 10px 35px rgba(0,0,0,0.12) !important;
}

/* Titre */
.swal-title-delete {
  font-size: 22px !important;
  font-weight: 700 !important;
  margin-top: 10px !important;
  margin-bottom: 8px !important;
}

/* Gros bouton SUPPRIMER */
.swal-btn-delete-big {
  background: #e63946 !important;
  color: #fff !important;
  width: 100% !important;
  border-radius: 30px !important;
  padding: 12px 25px !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  border: none !important;
  cursor: pointer;
  margin-top: 18px !important;
  margin-bottom: 10px !important;
}

.swal-btn-delete-big:hover {
  background: #d32f3f !important;
}

/* Bouton ANNULER */
.swal-btn-cancel-small {
  background: transparent !important;
  color: #e63946 !important;
  font-size: 15px !important;
  text-decoration: underline !important;
  border: none !important;
  cursor: pointer;
  padding: 5px 10px !important;
}

/* Icône poubelle du tableau */
.trash-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #888;
  transition: all 0.3s ease;
}

.trash-icon-btn:hover i {
  color: #dc2626;
  transform: scale(1.2);
}
 






</style>

<template>
  <div class="clients-container">
    <h2 class="page-title">👥 Gestion des Clients</h2>

    <div class="clients-content">
      <!-- 📋 Tableau -->
      <div class="clients-table-container">
        <div class="clients-header">
          <h3>Liste des Clients</h3>

          <div class="search-wrapper">
<i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher..."
              class="search-modern-input"
            />
          </div>
        </div>

        <div class="table-wrapper">
          <table class="clients-table">
            <thead>
              
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th class="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="client in clients"
                :key="client.id"
                @click="selectClient(client)"
                class="client-row"
              >
                <td>{{ client.nom }}</td>
                <td>{{ client.prenom }}</td>
                <td>{{ client.email }}</td>

                <td class="actions-cell" @click.stop>
                  <!-- ✏️ Bouton Modifier -->
                  <button
                    @click="openEditPopup(client)"
                    class="edit-btn"
                    aria-label="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>

                  <!-- 🗑️ Bouton Supprimer -->
               <button
  class="delete-btn"
  @click.stop="openDeletePopup(client)"
  title="Supprimer"
>
  <i class="fas fa-trash-alt"></i>
</button>

                </td>
              </tr>

              <!-- Si aucun client -->
              <tr v-if="clients.length === 0">
                <td colspan="4" style="text-align:center; color:#666;">
                  Aucun client trouvé.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 🧾 Détails du client -->
      <div v-if="selectedClient" class="client-details">
        <img
          v-if="selectedClient.photo_url"
          :src="selectedClient.photo_url"
          alt="photo"
          class="client-photo"
        />
        <h3>
          {{ selectedClient.civilite }}
          {{ selectedClient.nom }} {{ selectedClient.prenom }}
        </h3>

        <div class="details-grid">
          <p><strong>Email:</strong> {{ selectedClient.email }}</p>
          <p><strong>Téléphone:</strong> {{ selectedClient.tel }}</p>
          <p><strong>Adresse:</strong> {{ selectedClient.adresse }}</p>
          <p><strong>Code postal:</strong> {{ selectedClient.code_postal }}</p>
          <p><strong>Ville:</strong> {{ selectedClient.ville }}</p>
          <p><strong>Pays:</strong> {{ selectedClient.pays }}</p>
          <p><strong>Région:</strong> {{ selectedClient.etat_region }}</p>
          <p><strong>Date création:</strong> {{ formatDate(selectedClient.created_at) }}</p>
          <p v-if="selectedClient.updated_at">
            <strong>Dernière modification:</strong> {{ formatDate(selectedClient.updated_at) }}
          </p>
        </div>
      </div>
    </div>
  </div>


  <ConfirmPopup
  v-model="showConfirm"
  variant="danger"
  :title="confirmTitle"
  :message="confirmMessage"
  ok-text="Supprimer"
  cancel-text="Annuler"
  @confirm="confirmDelete"
  @cancel="cancelDelete"
/>

</template>
<script>
import api from "@/services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import ConfirmPopup from "@/components/popups/ConfirmPopup.vue";

export default {
  name: "Clients",

  components: {
    ConfirmPopup,
  },

  data() {
    return {
      // 📌 Liste & affichage
      clients: [],
      selectedClient: null,

      // 📌 Recherche
      searchQuery: "",
      searchTimeout: null,

      // 📌 Popup suppression
      showConfirm: false,
      confirmTarget: null,
      confirmTitle: "Confirmation de suppression",
      confirmMessage: "",
    };
  },

  async mounted() {
    this.fetchClients();
  },

  watch: {
    searchQuery(newQuery) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchClients(newQuery);
      }, 400);
    },
  },

  methods: {
    /** 🔹 Charger les clients */
    async fetchClients(search = "") {
      try {
        const response = await api.get("/admin/clients", { params: { search } });
        this.clients = response.data;
      } catch (error) {
        console.error("Erreur chargement clients:", error);
      }
    },

    /** 🔹 Sélectionner un client */
    selectClient(client) {
      this.selectedClient = client;
    },

    /** 🔹 Formater date */
    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    // ----------------------------------------------------
    // 🔥🔥 SUPPRESSION AVEC POPUP CONFIRMPOPUP 🔥🔥
    // ----------------------------------------------------

    /** 🔥 Ouvrir popup modernisée */
openDeletePopup(client) {
  this.confirmTarget = client;

  this.confirmTitle = "Supprimer ce client ?";
  this.confirmMessage =
    `Voulez-vous vraiment supprimer le client : ${client.nom} ${client.prenom} ?`;

  this.showConfirm = true;
}
,
    /** ❌ Annuler */
    cancelDelete() {
      this.showConfirm = false;
      this.confirmTarget = null;
    },

    /** 🗑 Confirmer suppression */
    async confirmDelete() {
      if (!this.confirmTarget) return;

      const id = this.confirmTarget.id;

      try {
        await api.delete(`/admin/clients/${id}`);

        // Supprimer de la liste
        this.clients = this.clients.filter((c) => c.id !== id);

        // Retirer de la colonne droite si affiché
        if (this.selectedClient?.id === id) {
          this.selectedClient = null;
        }

        Swal.fire({
          icon: "success",
          title: "Supprimé",
          text: "Le client a été supprimé avec succès.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer ce client.",
        });
      }

      this.showConfirm = false;
    },

    // ----------------------------------------------------
    // ✏️ MODIFICATION CLIENT (popup existante)
    // ----------------------------------------------------
    async openEditPopup(client) {
      const { value: formValues } = await Swal.fire({
        title: "✏️ Modifier les informations du client",
        html: `
          <div class="compact-form">
            ${[
              { id: "prenom", label: "Prénom", value: client.prenom },
              { id: "nom", label: "Nom", value: client.nom },
              { id: "email", label: "Email", value: client.email, readonly: true },
              { id: "tel", label: "Téléphone", value: client.tel },
              { id: "adresse", label: "Adresse", value: client.adresse },
              { id: "code_postal", label: "Code postal", value: client.code_postal },
              { id: "ville", label: "Ville", value: client.ville },
              { id: "pays", label: "Pays", value: client.pays },
              { id: "etat_region", label: "Région / État", value: client.etat_region },
            ]
              .map(
                (field) => `
                  <div class="form-row">
                    <label for="${field.id}">${field.label}</label>
                    <input 
                      id="${field.id}" 
                      class="compact-input"
                      value="${field.value || ""}"
                      ${field.readonly ? "readonly style='background:#e5e7eb; color:#6b7280; cursor:not-allowed;'" : ""}
                    >
                  </div>`
              )
              .join("")}
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "💾 Enregistrer",
        cancelButtonText: "❌ Annuler",
        width: "520px",
        backdrop: "rgba(0, 0, 0, 0.5)",
        customClass: {
          popup: "client-popup",
          confirmButton: "btn-save",
          cancelButton: "btn-cancel",
        },
        preConfirm: () => {
          const fields = [
            "nom",
            "prenom",
            "email",
            "tel",
            "adresse",
            "code_postal",
            "ville",
            "pays",
            "etat_region",
          ];
          return fields.reduce((acc, id) => {
            acc[id] = document.getElementById(id).value;
            return acc;
          }, {});
        },
      });

      if (formValues) {
        try {
          const fd = new FormData();
          Object.entries(formValues).forEach(([key, value]) => fd.append(key, value));

          const response = await api.post(`/admin/clients/${client.id}?_method=PUT`, fd);
          const updated = response.data.client ?? response.data;

          const index = this.clients.findIndex((c) => c.id === updated.id);
          if (index !== -1) this.clients.splice(index, 1, updated);

          Swal.fire({
            icon: "success",
            title: "✅ Client mis à jour",
            text: "Les informations ont été enregistrées avec succès.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "❌ Erreur",
            text: "Impossible d’enregistrer les modifications.",
          });
        }
      }
    },
  },
};
</script>

<style>

/* === CONTAINER GLOBAL === */
.clients-container {
  padding: 20px;
  background: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* === TITRE === */
.page-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 2rem; /* ✅ inchangé pour PC */
}

/* === STRUCTURE FLEXIBLE === */
.clients-content {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  justify-content: center;
  align-items: flex-start;
}

/* === TABLEAU === */
.clients-table-container {
  flex: 1 1 600px;
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  overflow-x: auto;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 400px;
}

.clients-table th {
  background: #e0e7ff;
  color: #1e3a8a;
  text-align: left;
  padding: 10px;
  white-space: nowrap;
}

.clients-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
  white-space: nowrap;
}

.client-row {
  cursor: pointer;
  transition: background 0.3s ease;
}

.client-row:hover {
  background: #f3f4f6;
}

/* === BOUTON SUPPR === */
.actions-cell {
  text-align: center;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #888;
  transition: all 0.3s ease;
  
}

.delete-btn:hover {
  color: #dc2626;
  transform: scale(1.2);
}

/* === DÉTAILS === */
.client-details {
  flex: 1 1 320px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  max-width: 100%;
}

.client-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto 10px;
}

.client-details h3 {
  text-align: center;
  color: #1e3a8a;
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

/* === DÉTAILS EN GRILLE === */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 15px;
}

.details-grid p {
  margin: 5px 0;
  color: #374151;
  font-size: 1rem;
}

/* === ✅ RESPONSIVE — TABLETTE === */
@media (max-width: 992px) {
.clients-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 25px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}


.clients-table-container {
  flex: 1 1 600px;
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  overflow-x: auto; /* ✅ permet le scroll horizontal uniquement à l’intérieur */
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 400px;
  table-layout: auto;
}

  .client-details {
    width: 100%;
    margin-bottom: 20px;
  }

  .clients-table th,
  .clients-table td {
    padding: 8px;
    font-size: 14px;
  }

  .client-details h3 {
    font-size: 1.1rem;
  }

  .details-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* === ✅ RESPONSIVE — MOBILE === */
@media (max-width: 600px) {
  .clients-container {
    padding: 10px;
  }

  .clients-table-container,
  .client-details {
    box-shadow: none;
    border-radius: 8px;
    padding: 12px;
  }

  .clients-table {
    display: block;
    overflow-x: auto;
    font-size: 13px;
  }

  .clients-table th,
  .clients-table td {
    padding: 6px;
    font-size: 13px;
  }

  .client-photo {
    width: 70px;
    height: 70px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .details-grid p {
    font-size: 13px;
  }

  .page-title {
    font-size: 1.3rem;
  }
}


/* === 🌍 VERSION FINALE RESPONSIVE === */

/* === TABLETTES (jusqu'à 992px) === */
@media (max-width: 992px) {
  .clients-container {
    padding: 15px;
  }

  .page-title {
    font-size: 1.6rem;
    text-align: center;
  }

  .clients-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .clients-table-container,
  .client-details {
    width: 100%;
    max-width: 750px;
  }

  .clients-table th,
  .clients-table td {
    font-size: 14px;
    padding: 10px;
  }

  .client-details h3 {
    font-size: 1.1rem;
  }

  .details-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* === SMARTPHONES (jusqu'à 768px) === */
@media (max-width: 768px) {
  .clients-container {
    padding: 10px;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }

  .clients-content {
    flex-direction: column;
    gap: 15px;
  }

  .clients-table-container,
  .client-details {
    padding: 12px;
    border-radius: 8px;
    box-shadow: none;
  }

  .clients-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    font-size: 13px;
  }

  .clients-table th,
  .clients-table td {
    padding: 8px;
  }

  .client-photo {
    width: 80px;
    height: 80px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .details-grid p {
    font-size: 13px;
  }
}


/* === Barre de recherche alignée avec le titre === */
.clients-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* ✅ titre à gauche, recherche à droite */
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.clients-header h3 {
  color: #1e3a8a;
  font-size: 18px;
  font-weight: 600;
}

/* === Barre moderne avec icône === */
.search-wrapper {
  position: relative;
  width: 280px;
}
.search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}


.search-modern-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-modern-input:focus {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* ✅ Responsive : barre centrée sur mobile */
@media (max-width: 768px) {
  .clients-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
  }
}


/* === PETITS MOBILES (jusqu'à 480px) === */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }

  .clients-table th,
  .clients-table td {
    font-size: 12px;
    padding: 6px;
  }

  .client-photo {
    width: 65px;
    height: 65px;
  }

  .client-details {
    padding: 10px;
  }

  .details-grid p {
    font-size: 12px;
  }
}

/* === GRAND ÉCRANS (à partir de 1200px) === */
@media (min-width: 1200px) {
  .clients-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}





/* 🔵 Icône "Modifier" ajoutée — style minimal cohérent avec ton tableau */
.edit-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #2563eb;
  margin-right: 8px;
  transition: all 0.2s ease;
}
.edit-btn:hover {
  color: #1d4ed8;
  transform: scale(1.2);
}

/* 🗑 Bouton Supprimer (inchangé) */
.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #888;
  transition: all 0.3s ease;
}
.delete-btn:hover {
  color: #dc2626;
  transform: scale(1.2);
}


/* === Effet général SweetAlert2 conservé === */
/* === Effet SweetAlert2 conservé === */
/* === Effet SweetAlert2 conservé === */
.swal2-popup.client-popup {
  border-radius: 14px !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25) !important;
  padding: 25px !important;
  font-family: "Poppins", sans-serif !important;
  backdrop-filter: blur(6px);
  transition: all 0.3s ease-in-out;
}

/* === Formulaire compact et aligné === */
.compact-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.form-row label {
  flex: 0 0 35%;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  text-align: right;
}

.compact-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  padding: 6px 10px;
  font-size: 13px;
  transition: all 0.25s;
}

.compact-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  background: #fafaff;
}

/* === Boutons === */
.swal2-actions {
  display: flex !important;
  justify-content: center !important;
  gap: 12px !important;
  margin-top: 15px !important;
}

.btn-save {
  background-color: #4f46e5 !important;
  color: white !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 8px 22px !important;
  font-size: 14px !important;
  transition: 0.2s;
}

.btn-save:hover {
  background-color: #4338ca !important;
}

.btn-cancel {
  background-color: #6b7280 !important;
  color: white !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  padding: 8px 22px !important;
  font-size: 14px !important;
}

.btn-cancel:hover {
  background-color: #4b5563 !important;
}

</style>

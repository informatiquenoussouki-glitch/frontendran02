<template>
  <div class="clients-container">
    <h2 class="page-title"><i class="fa fa-users"></i> Gestion des Clients</h2>

    <!--<div class="clients-content">-->
    <div class="clients-content" :class="{ 'single-col': !selectedClient }">
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
                <th style="text-align:center;">Nom</th>
                <th style="text-align:center;">Prénom</th>
                <th style="text-align:center;">Email</th>
                <th style="text-align:center;" class="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
  <tr
    v-for="client in clients"
    :key="client.id"
    @click="selectClient(client)"
    class="client-row"
  >
    <td data-label="Nom" style="text-align:center;">{{ client.nom }}</td>
    <td data-label="Prénom" style="text-align:center;">{{ client.prenom }}</td>
    <td data-label="Email" style="text-align:center;">{{ client.email }}</td>

    <td data-label="Actions" class="actions-cell" @click.stop>
      <button
        @click="openEditPopup(client)"
        class="edit-btn"
        aria-label="Modifier"
      >
        <i class="fas fa-edit"></i>
      </button>
      <button
        @click="deleteClient(client.id)"
        class="delete-btn"
        aria-label="Supprimer"
      >
        <i class="fas fa-trash-alt"></i>
      </button>
    </td>
  </tr>

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
</template>

<script>
import api from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default {
  name: "Clients",

  data() {
    return {
      clients: [],          // liste des clients
      selectedClient: null, // client affiché à droite
      searchQuery: "",      // texte dans la barre de recherche
      searchTimeout: null,  // évite de spammer l'API
    };
  },

  async mounted() {
    this.fetchClients();
  },

  watch: {
    // Recherche côté serveur avec délai
    searchQuery(newQuery) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchClients(newQuery);
      }, 400);
    },
  },

  methods: {
    /** 🔹 Charger les clients depuis l’API Laravel */
    async fetchClients(search = "") {
      try {
        const response = await api.get("/admin/clients", { params: { search } });
        this.clients = response.data;
      } catch (error) {
        console.error("Erreur chargement clients:", error);
      }
    },

    /** 🔹 Sélectionner un client (pour afficher ses détails) */
    selectClient(client) {
      this.selectedClient = client;
    },

    /** 🔹 Formater la date lisiblement */
    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    /** 🔹 Supprimer un client avec confirmation */
    async deleteClient(id) {
      const { isConfirmed } = await Swal.fire({
        title: "Supprimer ce client ?",
        html: "Cette action est <b>irréversible</b>.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "🗑 Supprimer",
        cancelButtonText: "✖ Annuler",
        reverseButtons: true,
      });

      if (!isConfirmed) return;

      try {
        await api.delete(`/admin/clients/${id}`);
        this.clients = this.clients.filter((c) => c.id !== id);
        if (this.selectedClient?.id === id) this.selectedClient = null;
        Swal.fire("✅ Supprimé", "Le client a été supprimé avec succès.", "success");
      } catch (error) {
        Swal.fire("Erreur", "Impossible de supprimer ce client.", "error");
      }
    },

   /** ✨ Popup de modification ultra moderne sans GIF */
/** ✏️ Modifier un client via une popup */
/** ✏️ Modifier un client via une popup */
async openEditPopup(client) {
  const { value: formValues } = await Swal.fire({
    title: "✏️ Modifier les informations du client",
    html: `
      <div class="compact-form">
        ${[
          { id: "prenom", label: "Prénom", value: client.prenom },
          { id: "nom", label: "Nom", value: client.nom },
          // ✅ Email : champ grisé et non modifiable
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
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "💾 Enregistrer",
    cancelButtonText: "❌ Annuler",
    background: "#f3f3f3",
    color: "#111",
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
        background: "#f3f3f3",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "❌ Erreur",
        text: "Impossible d’enregistrer les modifications.",
        background: "#f3f3f3",
      });
    }
  }

}

}}


</script>

<style src="@/assets/styles/clients.css"></style>


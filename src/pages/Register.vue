<template>
  <div class="register-page">
    <h1 class="title-page">Créer un compte</h1>

    <form @submit.prevent="register" class="register-form" enctype="multipart/form-data">
      <!-- ===================== COLONNE GAUCHE ===================== -->
      <div class="form-column">
        <h3>Informations personnelles</h3>

        <div class="form-group">
          <label>Civilité *</label>
          <div class="radio-group">
            <label><input type="radio" value="Monsieur" v-model="civilite" required /> Monsieur</label>
            <label><input type="radio" value="Madame" v-model="civilite" /> Madame</label>
            <label><input type="radio" value="Mademoiselle" v-model="civilite" /> Mademoiselle</label>
          </div>
        </div>

        <label>Prénom *</label>
        <input type="text" v-model="prenom" required placeholder="Prénom" />

        <label>Nom *</label>
        <input type="text" v-model="nom" required placeholder="Nom de famille" />

        <label>Adresse mail *</label>
        <input type="email" v-model="email" required placeholder="Adresse e-mail" />

        <label>Confirmez votre adresse e-mail *</label>
        <input type="email" v-model="email_confirmation" required placeholder="Confirmation e-mail" />

        <label>Téléphone *</label>
        <input type="text" v-model="telephone" required placeholder="Numéro de téléphone" />

        <label>Photo de profil</label>
        <input type="file" @change="handleFileUpload" accept="image/*" />
      </div>

      <!-- ===================== COLONNE DROITE ===================== -->
      <div class="form-column">
        <h3>Votre adresse</h3>

        <label>Adresse *</label>
        <input type="text" v-model="adresse" required placeholder="Adresse" />

        <label>Code postal *</label>
        <input type="text" v-model="code_postal" required placeholder="Code postal" />

        <label>Ville *</label>
        <input type="text" v-model="ville" required placeholder="Ville" />

        <label>Pays *</label>
        <select v-model="pays" required>
          <option>France métropolitaine</option>
          <option>Canada</option>
          <option>Belgique</option>
          <option>Tunisie</option>
        </select>

        <label>État / Région *</label>
        <input type="text" v-model="etat_region" required placeholder="État / Région" />
      </div>

      <!-- ===================== SECTION BAS DU FORMULAIRE ===================== -->
      <div class="form-full">
        <h3>Informations de connexion</h3>

        <!-- ✅ Ajout de name et autocomplete -->
        <label>Mot de passe *</label>
        <input
          type="password"
          name="password"
          v-model="password"
          required
          placeholder="Mot de passe"
          autocomplete="new-password"
        />

        <label>Confirmation du mot de passe *</label>
        <input
          type="password"
          name="password_confirmation"
          v-model="password_confirmation"
          required
          placeholder="Confirmez le mot de passe"
          autocomplete="new-password"
        />

        <button type="submit" class="btn-submit">S'inscrire</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

// === Données réactives ===
const civilite = ref("");
const prenom = ref("");
const nom = ref("");
const email = ref("");
const email_confirmation = ref("");
const telephone = ref("");
const adresse = ref("");
const code_postal = ref("");
const ville = ref("");
const pays = ref("France métropolitaine");
const etat_region = ref("");
const password = ref("");
const password_confirmation = ref("");
const newsletter = ref(false);
const photo = ref(null);

const router = useRouter();

// === Gérer l’upload photo ===
const handleFileUpload = (event) => {
  photo.value = event.target.files[0];
};

// === Envoi du formulaire ===
const register = async () => {
  try {
    const formData = new FormData();
    formData.append("civilite", civilite.value);
    formData.append("prenom", prenom.value);
    formData.append("nom", nom.value);
    formData.append("email", email.value);
    formData.append("email_confirmation", email_confirmation.value);
    formData.append("tel", telephone.value);
    formData.append("adresse", adresse.value);
    formData.append("code_postal", code_postal.value);
    formData.append("ville", ville.value);
    formData.append("pays", pays.value);
    formData.append("etat_region", etat_region.value);
    formData.append("password", password.value);
    formData.append("password_confirmation", password_confirmation.value);
    formData.append("newsletter", newsletter.value ? 1 : 0);
    if (photo.value) formData.append("photo", photo.value);

    const res = await api.post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Réponse backend :", res.data);

    // 🎨 Affichage d'une alerte stylée au centre
    await Swal.fire({
      icon: "success",
      title: "Inscription réussie 🎉",
      text: "Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.",
      confirmButtonText: "Aller à la connexion",
      confirmButtonColor: "#3085d6",
      background: "#fff",
      color: "#333",
      timer: 3500,
      timerProgressBar: true,
      position: "center",
      showConfirmButton: true,
    });

    // 🟢 Redirection après confirmation
    router.push("/login");
  } catch (error) {
    console.error("❌ Erreur backend :", error.response?.data || error.message);

    // ❌ Erreur stylée
    Swal.fire({
      icon: "error",
      title: "Erreur d'inscription",
      text:
        error.response?.data?.message ||
        "Une erreur est survenue lors de la création du compte.",
      confirmButtonColor: "#d33",
      position: "center",
    });
  }
};
</script>



<style src="../assets/styles/register.css"></style>

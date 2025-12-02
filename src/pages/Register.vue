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
 
 <div class="field">
        <label>Date de naissance *</label>
        <input v-model="naissance" type="date" required />
      </div>

      <!-- ✅ Champ téléphone avec drapeau -->
      <div class="field">
        <label>Téléphone <span class="required">*</span></label>
        <input
          ref="phoneInput"
          id="phone"
          type="tel"
          class="form-control"
          placeholder="Ex : +216 20 000 000"
          required
        />
      </div>
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import Swal from "sweetalert2";
import intlTelInput from "intl-tel-input";




const civilite = ref("");
const prenom = ref("");
const nom = ref("");
const email = ref("");
const email_confirmation = ref("");
const naissance = ref("");
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
const route = useRoute();




/* ✅ Quand on clique sur le champ, on ouvre le calendrier automatiquement */
onMounted(() => {
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    dateInput.addEventListener("click", () => {
      dateInput.showPicker?.(); // ✅ Méthode moderne pour ouvrir le calendrier
    });
  }
});

/* ✅ Initialisation du champ téléphone avec drapeau */
onMounted(() => {
  const phoneInput = document.querySelector("#phone");

  if (phoneInput) {
    const iti = intlTelInput(phoneInput, {
      initialCountry: "tn", // 🇹🇳 Tunisie par défaut
      preferredCountries: ["tn", "fr", "sa", "ca", "ma"],
      separateDialCode: true, // affiche +216 séparé
      nationalMode: false, // ✅ enregistre le numéro complet (+216...)
      formatOnDisplay: true,
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
    });

    // 🧩 Quand l’utilisateur quitte le champ, on met à jour "telephone"
    phoneInput.addEventListener("blur", () => {
      const completeNumber = iti.getNumber();
      telephone.value = completeNumber || phoneInput.value;
      console.log("📞 Numéro complet :", telephone.value);
    });
  }
});

// ✅ Si la page register est ouverte depuis la réservation,
// préremplir l’e-mail automatiquement
onMounted(() => {
  const emailQuery = route.query.email;
  if (emailQuery) {
    email.value = emailQuery;
    email_confirmation.value = emailQuery;
  }
});

const handleFileUpload = (event) => {
  photo.value = event.target.files[0];
};

const register = async () => {
  try {
    const redirectAfter = route.query.redirectAfter; // ✅ réservation d’origine

    // ✅ Préparer les données du formulaire
    const formData = new FormData();
    formData.append("civilite", civilite.value);
    formData.append("prenom", prenom.value);
    formData.append("nom", nom.value);
    formData.append("email", email.value);
    formData.append("email_confirmation", email_confirmation.value);
    formData.append("naissance", naissance.value);
    formData.append("tel", telephone.value); // ✅ clé backend correcte
    formData.append("adresse", adresse.value);
    formData.append("code_postal", code_postal.value);
    formData.append("ville", ville.value);
    formData.append("pays", pays.value);
    formData.append("etat_region", etat_region.value);
    formData.append("password", password.value);
    formData.append("password_confirmation", password_confirmation.value);
    formData.append("newsletter", newsletter.value ? 1 : 0);
    if (photo.value) formData.append("photo", photo.value);

    // ✅ Envoi vers le backend
    const res = await api.post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Réponse backend :", res.data);

    // ✅ Message rapide de succès
    await Swal.fire({
      icon: "success",
      title: "Inscription réussie 🎉",
      text: redirectAfter
        ? "Votre compte a été créé. Redirection vers votre réservation..."
        : "Votre compte a été créé. Redirection vers la connexion...",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    // ✅ Redirection automatique sans confirmation
    if (redirectAfter) {
      router.push({
        path: redirectAfter,
        query: { email: email.value },
      });
    } else {
      router.push("/login");
    }
  } catch (error) {
    console.error("❌ Erreur backend :", error.response?.data || error.message);

    Swal.fire({
      icon: "error",
      title: "Erreur d'inscription",
      text:
        error.response?.data?.message ||
        "Une erreur est survenue lors de la création du compte.",
      confirmButtonColor: "#d33",
    });
  }
};
</script>




<style src="../assets/styles/register.css"></style>

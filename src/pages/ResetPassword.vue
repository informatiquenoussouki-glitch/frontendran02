<template>
  <div class="reset-container">
    <div class="reset-box">
      <!-- Colonne gauche avec illustration -->
      <div class="reset-left">
        <img src="/reset-illustrationn.jpg" alt="Illustration" />
      </div>

      <!-- Colonne droite avec formulaire -->
      <div class="reset-right">
        <h2>Réinitialisation du mot de passe</h2>
        <p class="subtitle">Choisissez un nouveau mot de passe sécurisé.</p>

        <form @submit.prevent="handleReset">
          <!-- Champ Email -->
          <div class="input-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Votre email"
              required
            />
          </div>

          <!-- Nouveau mot de passe -->
          <div class="input-group">
            <label for="password">Nouveau mot de passe <span class="required">*</span></label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Entrez un nouveau mot de passe"
              required
            />
          </div>

          <!-- Confirmation -->
          <div class="input-group">
            <label for="password_confirmation">Confirmer le mot de passe <span class="required">*</span></label>
            <input
              type="password"
              id="password_confirmation"
              v-model="passwordConfirmation"
              placeholder="Confirmez le mot de passe"
              required
            />
          </div>

          <!-- Bouton -->
          <button type="submit" class="btn-reset" :disabled="loading">
            <span v-if="loading">⏳ Réinitialisation...</span>
            <span v-else>Réinitialiser</span>
          </button>

          <!-- Messages -->
          <p v-if="message" :class="{ success: success, error: !success }">
            {{ message }}
          </p>

          <!-- Lien retour -->
          <p class="link-login">
            <router-link to="/login">Retour à la connexion</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();

const email = ref(route.query.email || ""); // ✅ récupéré depuis l’URL
const password = ref("");
const passwordConfirmation = ref("");
const loading = ref(false);
const message = ref("");
const success = ref(false);

const token = route.params.token; // ✅ récupéré depuis /reset-password/:token

// 🔑 Fonction reset
const handleReset = async () => {
  message.value = "";
  success.value = false;
  loading.value = true;

  try {
    const res = await api.post("/reset-password", {
      token,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    success.value = true;
    message.value = res.data.status || "Mot de passe réinitialisé ✅";

    // ✅ Redirection auto après succès
    setTimeout(() => router.push("/login"), 2000);
  } catch (error) {
    success.value = false;
    message.value = error.response?.data?.message || "Erreur ❌";
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped src="../assets/styles/resetpassword.css"></style>

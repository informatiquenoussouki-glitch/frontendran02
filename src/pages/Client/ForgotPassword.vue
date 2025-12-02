<template>
  <div class="auth-wrapper">
    <!-- Boîte centrale -->
    <div class="forgot-card">
      <!-- Colonne gauche avec illustration -->
      <div class="forgot-left">
        <img src="/forgot-illustrationn.jpg" alt="Illustration" />
      </div>

      <!-- Colonne droite avec formulaire -->
      <div class="forgot-right">
        <h2>Mot de passe oublié</h2>
        <p class="subtitle">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        <form @submit.prevent="handleForgot">
          <!-- Champ Email -->
          <div class="input-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Entrez votre email"
              required
            />
          </div>

          <!-- Bouton réinitialisation -->
          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading">⏳ Envoi...</span>
            <span v-else>Envoyer le lien de réinitialisation</span>
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
import api from "../../services/api";

const email = ref("");
const loading = ref(false);
const message = ref("");
const success = ref(false);

// 🔑 Envoi requête backend
const handleForgot = async () => {
  message.value = "";
  success.value = false;
  loading.value = true;

  try {
    const response = await api.post("/forgot-password", {
      email: email.value,
    });

    success.value = true;
    message.value = response.data.status || "Lien envoyé ✅ Vérifiez vos emails";
    email.value = "";
  } catch (error) {
    success.value = false;
    message.value = error.response?.data?.message || "Erreur inconnue ❌";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped src="@/assets/styles/forgotpassword.css"></style>

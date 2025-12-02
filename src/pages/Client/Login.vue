<template>
  <div class="auth-container">
    <!-- Colonne gauche : image -->
    <div class="auth-left">
    
      <img src="/login-illustrationn.jpg" alt="Illustration connexion" />
    </div>

    <!-- Colonne droite : formulaire -->
    <div class="auth-right">
      <h2>Se connecter</h2>
      <p>Accédez à votre espace  ✨</p>

      <form @submit.prevent="login">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="Entrez votre email" required />

        <label>Mot de passe</label>
        <input type="password" v-model="password" placeholder="Votre mot de passe" required />

         <!-- Mot de passe oublié -->
        <div class="forgot-password">
          <router-link to="/forgot-password">Mot de passe oublié ?</router-link>
        </div>

        <button type="submit" class="btn-primary">Connexion</button>
      </form>

     <div class="create-account">
  <router-link to="/register">Pas encore de compte ? S’inscrire</router-link>
</div>
    </div>
  </div>
</template>
<script setup>

import { ref } from "vue";
import { useRouter } from "vue-router";
import api from '@/services/api';
import Swal from "sweetalert2"; // ✅ pour les erreurs stylées

const email = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    console.log("✅ Réponse backend :", res.data);

    // ✅ Sauvegarde des données utilisateur pour le header
    localStorage.setItem("auth_token", res.data.token);
    localStorage.setItem(
      "user_name",
      res.data.user.prenom + " " + res.data.user.nom || res.data.user.email
    );
    localStorage.setItem("user_role", res.data.user.role);

    // ✅ Redirection automatique sans popup
    if (res.data.user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  } catch (err) {
    console.error("❌ Erreur login:", err.response?.data || err.message);

    // ❌ Alerte stylée uniquement si erreur
    Swal.fire({
      icon: "error",
      title: "Échec de la connexion",
      text:
        err.response?.data?.message ||
        "Email ou mot de passe incorrect. Veuillez réessayer.",
      confirmButtonColor: "#d33",
      position: "center",
    });
  }
};
</script>





<style src="@/assets/styles/login.css"></style>

<script setup>
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const logout = async () => {
  try {
    await api.post("/logout"); // Appel backend Laravel pour supprimer le token

    // Supprimer le token du navigateur
    localStorage.removeItem("token");

    alert("Déconnexion réussie ✅");

    // Redirection vers la page de login
    router.push({ name: "Login" });

  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Erreur lors de la déconnexion ❌");
  }
};
</script>

<template>
  <nav class="flex items-center justify-between bg-gray-900 text-white px-6 py-3 shadow-md">
    <!-- Logo + Nom du site -->
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push({ name: 'Home' })">
      <img src="/logo.jpg" alt="Logo" class="h-8 w-8 rounded" />
      <span class="text-lg font-bold">MonSiteOmra</span>
    </div>

    <!-- Boutons navigation -->
    <div class="flex items-center gap-4">
      <router-link to="/" class="hover:text-gray-300">Accueil</router-link>
      <router-link to="/login" v-if="!localStorage.getItem('token')" class="hover:text-gray-300">Connexion</router-link>
      <router-link to="/register" v-if="!localStorage.getItem('token')" class="hover:text-gray-300">Inscription</router-link>

      <!-- Bouton déconnexion visible seulement si connecté -->
      <button 
        v-if="localStorage.getItem('token')" 
        @click="logout" 
        class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
        Déconnexion
      </button>
    </div>
  </nav>
</template>

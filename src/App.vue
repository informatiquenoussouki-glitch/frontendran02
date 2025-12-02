<template>
  <div id="app">

    <!-- ✅ Bouton hamburger (mobile only) -->
    <button
      class="hamburger-btn"
      v-if="showSidebar"
      @click="toggleSidebar"
    >
      <i class="fas fa-bars"></i>
    </button>

    <!-- ✅ Sidebar affichée sur /dashboard et /admin/... -->
    <Sidebar
      v-if="showSidebar"
      :class="{ open: sidebarOpen }"
    />

    <!-- ✅ Header public affiché uniquement si NON admin -->
    <PublicHeader v-if="showHeader" />

    <main class="page-content" :class="{ 'with-sidebar': showSidebar }">
      <RouterView /> <!-- contenu dynamique -->
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import PublicHeader from "@/components/publicheader.vue";
import Sidebar from "@/components/Sidebar.vue";

/* ✅ Mobile : état ouverture sidebar */
const sidebarOpen = ref(false);
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value);

/* --- Routes où on cache le header public --- */
const hiddenHeaderRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
];

/* --- Route actuelle --- */
const route = useRoute();

/* ✅ Affiche le header public */
const showHeader = computed(() => {
  return (
    !hiddenHeaderRoutes.includes(route.path) &&
    !route.path.startsWith("/admin")
  );
});

/* ✅ Affiche la sidebar admin */
const showSidebar = computed(() => {
  return route.path === "/dashboard" || route.path.startsWith("/admin");
});
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background: #f8fafc;
}

/* ✅ Zone principale */
.page-content {
  margin-top: 50px; /* espace sous le header public */
  width: 100%;
  max-width: 1300px;
  padding: 0 20px;
  box-sizing: border-box;
  transition: margin-left 0.3s ease;
}

/* ✅ Quand la sidebar est visible (desktop) */
.page-content.with-sidebar {
  margin-left: 230px;
  margin-top: 0;
  max-width: calc(1300px - 230px);
}

/* ============================================================
   ✅ SIDEBAR RESPONSIVE (slide mobile)
   ============================================================ */
@media (max-width: 991px) {

  /* ✅ Sidebar cachée par défaut sur mobile */
  .sidebar {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 240px;
    height: 100vh;
    background: #ffffff;
    box-shadow: 3px 0 12px rgba(0, 0, 0, 0.08);
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    z-index: 3000;
    padding-top: 70px; /* laisse un espace pour le hamburger */
  }

  /* ✅ Sidebar ouverte */
  .sidebar.open {
    transform: translateX(0);
  }

  /* ✅ Contenu reste normal */
  .page-content.with-sidebar {
    margin-left: 0 !important;
    padding: 0 15px;
  }

  /* ✅ BOUTON HAMBURGER moderne gris clair */
  .hamburger-btn {
    display: flex !important;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 4000;

    width: 45px;
    height: 45px;
    border: none;
    border-radius: 10px;

    background: #e5e7eb; /* ✅ gris clair */
    color: #374151; /* gris foncé */
    font-size: 22px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
}

/* ✅ Desktop : pas de hamburger */
@media (min-width: 992px) {
  .hamburger-btn {
    display: none !important;
  }
}
</style>

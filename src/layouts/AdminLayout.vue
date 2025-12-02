<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />

    <!-- Contenu -->
    <div class="main-content">
      <Header @toggle-sidebar="toggleSidebar" />
      <main class="page-content">
        <router-view />
      </main>
    </div>

    <!-- Overlay (mobile) -->
    <div v-if="isSidebarOpen" class="overlay" @click="toggleSidebar"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";
import Header from "@/components/Header.vue";

const isSidebarOpen = ref(false);
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };
</script>

<style scoped>
.admin-layout { display: flex; height: 100vh; overflow: hidden; }
.main-content { flex: 1; display: flex; flex-direction: column; transition: margin-left .3s ease; }
.page-content { flex: 1; padding: 20px; margin-top: 60px; background: #f8f9fb; overflow-y: auto; }

/* Desktop: laisse la place à la sidebar */
@media (min-width: 992px) { .main-content { margin-left: 230px; } }
/* Mobile: pas d’espace gauche */
@media (max-width: 991px) { .main-content { margin-left: 0; } }

.overlay{
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  z-index: 1050; /* entre header (1000) et sidebar (1100) */
}
</style>

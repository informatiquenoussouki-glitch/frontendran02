<template>
  <div id="app">
    <!-- Sidebar admin -->
    <Sidebar v-if="showSidebar" />

    <!-- Header public -->
    <PublicHeader v-if="showHeader" />

    <!-- Contenu des pages -->
    <main class="page-content" :class="{ 'with-sidebar': showSidebar }">
      <RouterView />
    </main>

    <!-- ✅ Footer public EN DEHORS de .page-content -->
    <PublicFooter v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import PublicHeader from "@/components/PublicHeader.vue";
import PublicFooter from "@/components/PublicFooter.vue";
import Sidebar from "@/components/Sidebar.vue";

const route = useRoute();

const hiddenHeaderRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
];

const showHeader = computed(() => {
  return (
    !hiddenHeaderRoutes.includes(route.path) &&
    !route.path.startsWith("/admin")
  );
});

// Footer sur les mêmes pages que le header public
const showFooter = computed(() => showHeader.value);

const showSidebar = computed(() => {
  return route.path === "/dashboard" || route.path.startsWith("/admin");
});
</script>

<style>
/* Layout général */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
}

/* zone centrale */
.page-content {
  flex: 1 0 auto;
  margin-top: 50px;
  width: 100%;
  max-width: 1300px;
  padding: 0 20px;
  box-sizing: border-box;
  transition: margin-left 0.3s ease;
}

/* pages admin avec sidebar */
.page-content.with-sidebar {
  margin-left: 230px;
  margin-top: 0;
  max-width: calc(1300px - 230px);
}

/* responsive */
@media (max-width: 991px) {
  .page-content.with-sidebar {
    margin-left: 0;
    padding: 0 15px;
  }
}
</style>

<template>
  <header class="header">
    <!-- === Bouton hamburger (mobile) === -->
    <button class="menu-toggle" @click="$emit('toggle-sidebar')" aria-label="Ouvrir le menu">
      <span></span><span></span><span></span>
    </button>

    <!-- === Logo + nom du site === -->
    <div class="brand">
      <img src="/logo.jpg" alt="Logo" class="logo-img" />
      <span class="brand-name">MonSiteOmra</span>
    </div>

    <!-- === Nom admin + menu déroulant === -->
    <div class="user-menu" ref="userMenu">
      <button class="user-btn" @click="toggleDropdown">
        <i class="fas fa-user-circle"></i>
        <span>{{ adminName }}</span>
        <i class="fas fa-chevron-down small-arrow" :class="{ open: showDropdown }"></i>
      </button>

      <!-- === Liste déroulante === -->
      <transition name="fade">
        <div v-if="showDropdown" class="dropdown">
          <router-link to="/admin/profile">👤 Profil</router-link>
          <a href="#" @click.prevent="logout">🚪 Déconnexion</a>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";


const router = useRouter();
const adminName = ref("Administrateur");
const showDropdown = ref(false);
const userMenu = ref(null);

// ✅ Toggle du menu (ouvre/ferme)
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// ✅ Ferme le menu si clic à l’extérieur
const handleClickOutside = (event) => {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

// ✅ Déconnexion
const logout = async () => {
  try {
    await api.post("/logout");
  } catch (e) {
    console.error(e);
  }
  localStorage.clear();
  router.push("/login");
};

// ✅ Vérifie le rôle et récupère le nom de l’admin
onMounted(() => {
  const role = localStorage.getItem("user_role");
  const name = localStorage.getItem("user_name");

  if (role !== "admin") {
    alert("Accès refusé à l’espace administrateur ❌");
    router.push("/login");
  }
  if (name) adminName.value = name;

  // Ajoute un écouteur global de clic pour fermer le menu
  document.addEventListener("click", handleClickOutside);
});

// Nettoie l’écouteur au démontage
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* ===== HEADER GLOBAL ===== */

/* ===== LOGO ===== */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.brand-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* ===== USER MENU ===== */
.user-menu {
  position: relative;
}

.user-btn {
  background: transparent;
  border: none;
  font-weight: 600;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-btn i {
  color: #555;
}

.small-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}
.small-arrow.open {
  transform: rotate(180deg);
}

/* ===== DROPDOWN ===== */
.dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 160px;
  text-align: left;
  z-index: 1001;
}

.dropdown a,
.dropdown router-link {
  display: block;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.dropdown a:hover,
.dropdown router-link:hover {
  background: #f0f0f0;
}

/* ===== TRANSITION DOUCE ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== MENU HAMBURGER ===== */
.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: #333;
  margin: 5px 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .header {
    left: 0;
    right: 0;
    width: 100%;
    padding: 0 15px;
  }

  .menu-toggle {
    display: block;
  }

  .brand-name {
    font-size: 16px;
  }
}
.header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}


</style>

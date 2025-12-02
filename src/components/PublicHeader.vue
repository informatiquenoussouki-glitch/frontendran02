<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, onBeforeRouteUpdate } from "vue-router";

const router = useRouter();
const scrolled = ref(false);
const open = ref(false);
const isLoggedIn = ref(false);
const userName = ref("");
const showDropdown = ref(false);

/* === Menu principal === */
const menuItems = [
  { label: "ACCUEIL", to: "/" },
  { label: "OMRA", to: "/omras" },
  { label: "OMRA ÉCONOMIQUE", to: "/omra-eco" },
  { label: "OMRA CONFORT", to: "/omra-confort" },
  { label: "OMRA RAMADAN", to: "/omra-ramadan" },
  { label: "À PROPOS", to: "/about" }, // ✅ ajouté ici
  { label: "CONTACT", to: "/contact" },
];

/* === Effet scroll === */
const handleScroll = () => {
  scrolled.value = window.scrollY > 40;
};

/* === Menu mobile === */
const toggleMenu = () => (open.value = !open.value);
const closeMenu = () => (open.value = false);

/* === Vérification connexion === */
const checkLogin = () => {
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("user_name");
  isLoggedIn.value = !!token;
  userName.value = user || "";
};

/* === Gestion du menu Mon Compte === */
const toggleAccountMenu = () => {
  if (!isLoggedIn.value) {
    router.push("/login");
  } else {
    showDropdown.value = !showDropdown.value;
  }
};

/* === Déconnexion === */
const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_role");
  isLoggedIn.value = false;
  showDropdown.value = false;
  router.push("/login");
};

/* === Montage / démontage === */
onMounted(() => {
  checkLogin();
  window.addEventListener("scroll", handleScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

/* === Vérifie à chaque changement de route === */
onBeforeRouteUpdate(() => {
  checkLogin();
});

/* === Bloque le scroll quand menu mobile ouvert === */
watch(open, (v) => {
  document.body.style.overflow = v ? "hidden" : "";
});
</script>

<template>
  <header class="topbar" :class="{ scrolled }">
    <div class="inner">
      <!-- ✅ Logo -->
      <div class="brand">
        <img src="/logo.jpg" class="logo" alt="Logo" />
        <span class="brand-name">MonSite<span class="accent">Omra</span></span>
      </div>

      <!-- ✅ Menu Desktop -->
      <ul class="menu">
        <li v-for="(it, i) in menuItems" :key="i">
          <router-link :to="it.to" class="item">{{ it.label }}</router-link>
        </li>
      </ul>

      <!-- ✅ Mon compte -->
      <div class="account-menu">
        <button class="account-btn" @click="toggleAccountMenu">
          <i class="fas fa-user-circle"></i>
          <span v-if="!isLoggedIn">Mon compte</span>
          <span v-else>{{ userName }}</span>
          <i
            v-if="isLoggedIn"
            class="fas fa-chevron-down small-arrow"
            :class="{ open: showDropdown }"
          ></i>
        </button>

        <div v-if="isLoggedIn && showDropdown" class="dropdown">
          <a href="#" @click.prevent="logout">🚪 Déconnexion</a>
        </div>
      </div>

      <!-- ✅ Burger mobile -->
      <button class="burger" :class="{ open: open }" @click="toggleMenu">
  <span></span><span></span><span></span>
</button>

    </div>

    <!-- ✅ Menu mobile -->
    <transition name="fade">
      <div v-if="open" class="mobile-overlay" @click.self="closeMenu">
        <nav class="mobile-nav">
          <router-link
            v-for="(it, i) in menuItems"
            :key="'m' + i"
            :to="it.to"
            class="m-item"
            @click="closeMenu"
            >{{ it.label }}</router-link
          >
          <hr class="m-sep" />
          <router-link v-if="!isLoggedIn" to="/login" class="m-item"
            >MON COMPTE</router-link
          >
          <button
            v-else
            @click="logout"
            class="m-item"
            style="background:none;border:none;color:#fff;"
          >
            🚪 DÉCONNEXION
          </button>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
:root {
  --accent: #c9a227; /* couleur or principale */
  --ink: #0f172a;
  --bg: #ffffff;
  --line: #e8eaee;
}

/* ===== Header principal ===== */
.topbar {
  width: 100%;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
  position: fixed;
  top: 0;
  z-index: 9999;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.topbar.scrolled {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ===== Contenu ===== */
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ===== Logo ===== */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--accent);
}
.brand-name {
  font-weight: 700;
  color: #444;
  font-size: 1.1rem;
}
.accent {
  color: var(--accent);
}

/* ===== Menu Desktop ===== */
.menu {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
}
.item {
  color: #555;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}
.item:hover {
  color: var(--accent);
}

/* ===== Compte ===== */
.account-menu {
  position: relative;
}

.account-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #444;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.account-btn i {
  color: var(--accent);
}
.small-arrow {
  transition: transform 0.3s ease;
}
.small-arrow.open {
  transform: rotate(180deg);
}

/* ===== Dropdown ===== */
.dropdown {
  position: absolute;
  right: 0;
  top: 110%;
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  z-index: 9999;
}
.dropdown a {
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}
.dropdown a:hover {
  background: #f5f5f5;
  color: var(--accent);
}

/* ===== Burger ===== */
.burger {
  position: relative;
  width: 36px;
  height: 36px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
  display: none; /* 🚫 caché par défaut (donc sur desktop) */
}

.burger span {
  width: 22px;
  height: 2px;
  background: #111;
  margin: 3px 0;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* ===== Menu Mobile ===== */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 9998;
}
/* ✅ Forcer le fond du menu mobile à être transparent et flouté */
/* 🌙 Menu mobile avec fond très transparent et effet verre flou */
.mobile-nav {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(241, 241, 241, 0.192) !important; /* 🔹 seulement 35% d’opacité */
  backdrop-filter: blur(10px) !important;     /* 🔹 flou plus doux et large */
  -webkit-backdrop-filter: blur(10px) !important;
  color: white !important;
  padding: 80px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 22px !important;
  transition: all 0.4s ease !important;
  z-index: 9999 !important;
}


.mobile-close {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fff;
  color: #000;
  font-size: 28px;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  border: none;
  cursor: pointer;
  z-index: 10001; /* ✅ bouton au-dessus du reste */
}
.m-item {
  color: white;
  text-decoration: none;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.m-item:hover {
  color: var(--accent);
}
.m-sep {
  width: 60%;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* ===== Responsive ===== */
@media (max-width: 950px) {
  .menu {
    display: none !important; /* ✅ cache bien le menu desktop */
  }
  .account-menu {
    display: none !important;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .logo {
    width: 34px;
    height: 34px;
    object-fit: contain; /* ✅ évite le rognage */
    border: 2px solid var(--accent);
  }
  .brand-name {
    font-size: 1rem;
    line-height: 1;
    display: flex;
    align-items: center;
  }
  .topbar {
    height: auto;
    padding: 10px 12px;
  }
  .inner {
    padding: 12px 16px;
  }

/* === Bouton burger / croix sans cadre === */
  .burger {
    display: flex;
  }
}

/* --- État "ouvert" (croix bien centrée) --- */
.burger.open span:nth-child(1) {
  transform: rotate(45deg);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  background: #fff;
  transform-origin: center;
  translate: -50% -50%;
}

.burger.open span:nth-child(2) {
  opacity: 0;
}

.burger.open span:nth-child(3) {
  transform: rotate(-45deg);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  background: #fff;
  transform-origin: center;
  translate: -50% -50%;
}



.topbar {
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e8eaee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  position: fixed;
  top: 0;
  z-index: 9999;
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ===== Logo ===== */
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo {
  width: 38px;
  height: 38px;
}
.brand-name {
  font-weight: 700;
  color: #1e3a8a;
  font-size: 1.1rem;
}
.accent {
  color: #02897a; /* Vert d’accent (comme sur ta capture) */
}

/* ===== Menu principal ===== */
.menu {
  display: flex;
  list-style: none;
  gap: 28px;
  margin: 0;
  padding: 0;
}

.menu-item {
  color: #1e293b; /* Gris bleu foncé */
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  position: relative;
  transition: color 0.3s ease;
}

/* 🔹 Lien survolé */
.menu-item:hover {
  background: #f1f5f9 !important;  /* gris clair (Slate-100) */
  color: #1e293b; 
}

/* 🔸 Lien actif */
.router-link-exact-active {
  color: #02897a;
  background: rgba(2, 137, 122, 0.08); /* fond vert clair */
  padding: 5px 10px;
  border-radius: 6px;
  position: relative;
}

/* 🔸 Trait dessous actif */
.router-link-exact-active::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #02897a;
  border-radius: 2px;
}

/* ===== Responsive ===== */
@media (max-width: 950px) {
  .menu {
    display: none;
  }
}



</style>


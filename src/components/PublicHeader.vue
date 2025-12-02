<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useRouter, onBeforeRouteUpdate } from "vue-router";
import api from "@/services/api"; // pour /me

const router = useRouter();

const openMain = ref(null)   // quel onglet de menu est ouvert (ACCUEIL, OMRA, etc.)


/* ====== State global ====== */
const scrolled     = ref(false);
const open         = ref(false);
const isLoggedIn   = ref(false);
const userName     = ref("");
const userPhotoRaw = ref("");
const photoOk      = ref(true);
const showDropdown = ref(false);

const userRole = ref("");
const isAdmin  = ref(false);

/* ✅ permission d’afficher le menu détaillé (profil/réservations/…) */
const canSeeMenu = ref(true); // ON par défaut

/* ====== Menu principal ====== */
const menuItems = [
  { label: "ACCUEIL", 
    to: "/" ,
    open: false,                 // 👈 important pour le dropdown
    children: [
      { label: "À PROPOS", to: "/about",   icon: "fas fa-info-circle"  },
      { label: "Contact",  to: "/contact", icon: "fas fa-envelope" },   
    ],
  },
  { label: "OMRA", to: "/omras" },
  { label: "OMRA ÉCONOMIQUE", to: "/omra-eco" },
  { label: "OMRA CONFORT", to: "/omra-confort" },
  { label: "OMRA RAMADAN", to: "/omra-ramadan" },
  { label: "BLOG", to: "/blog" },
 
];

/* ====== Effet header collé ====== */
const handleScroll = () => { scrolled.value = window.scrollY > 40; };

/* ====== Avatar helpers ====== */
const normalizeUrl = (raw) => {
  if (!raw) return "";
  if (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("/")) return raw;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "") || window.location.origin;
  return `${base}/${raw.replace(/^\/+/, "")}`;
};
const avatarSrc = computed(() => normalizeUrl(userPhotoRaw.value));

/* ====== Récupération avatar depuis localStorage ====== */
const pullFromLocalStorage = () => {
  const byKey =
    localStorage.getItem("user_photo") ||
    localStorage.getItem("avatar_url") ||
    localStorage.getItem("photo") ||
    "";

  let byUserObj = "";
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    byUserObj = u?.avatar_url || u?.photo || "";
  } catch (_) {}

  return byKey || byUserObj || "";
};

/* ====== Charge permission depuis LS si dispo ====== */
function loadPermissionFallback() {
  const raw = localStorage.getItem("can_see_menu");
  if (raw === "0" || raw === "1") canSeeMenu.value = raw === "1";
  try {
    const perms = JSON.parse(localStorage.getItem("user_perms") || "null");
    if (perms && typeof perms.canSeeMenu === "boolean") canSeeMenu.value = perms.canSeeMenu;
  } catch (_) {}
}

/* ====== /me : avatar + permissions éventuelles ====== */
const fetchFromMe = async () => {
  try {
    const { data } =
      (await api.get("/api/me").catch(() => api.get("/me"))) || {};

    const found = data?.avatar_url || data?.photo || "";
    if (found) {
      userPhotoRaw.value = found;
      localStorage.setItem("user_photo", found);
    }

    // si ton backend renvoie des permissions/scopes
    if (data?.permissions) {
      canSeeMenu.value = !!data.permissions.includes("see_account_menu");
    }
  } catch (_) {
    // silencieux
  }
};

/* ====== Session / rôle / photo ====== */
const checkLogin = async () => {
  const token = localStorage.getItem("auth_token");
  const name  = localStorage.getItem("user_name");
  const role  = (localStorage.getItem("user_role") || "").toLowerCase();

  isLoggedIn.value = !!token;
  userName.value   = name || "";
  userRole.value   = role;
  isAdmin.value    = role === "admin";

  userPhotoRaw.value = pullFromLocalStorage();
  photoOk.value = true;

  loadPermissionFallback();

  if (isLoggedIn.value && !userPhotoRaw.value) {
    await fetchFromMe();
  }
};

/* ====== Entrées du menu (desktop dropdown & mobile) ====== */
const dropdownEntries = computed(() => {
  if (!isLoggedIn.value) return [];

  // ADMIN
  if (isAdmin.value) {
    if (canSeeMenu.value) {
      return [
        { icon: "user",         label: "Mon profil",            to: "/profile" },
        { icon: "tools",        label: "Accès admin",           to: "/admin/dashboard" },
        { icon: "sign-out-alt", label: "Déconnexion",           action: "logout" },
      ];
    }
    return [
      { title: userName.value },
      { icon: "sign-out-alt", label: "Déconnexion", action: "logout" },
    ];
  }

  // CLIENT
  if (canSeeMenu.value) {
    return [
      { icon: "user",         label: "Mon profil",             to: "/profile" },
      { icon: "file-alt",     label: "Mes réservations",       to: "/mes-reservations" },
      { icon: "star",         label: "Laisser un témoignage",  to: "/temoignages" },
      { icon: "sign-out-alt", label: "Déconnexion",            action: "logout" },
    ];
  }
  return [
    { title: userName.value },
    { icon: "sign-out-alt", label: "Déconnexion", action: "logout" },
  ];
});

/* ====== Actions compte ====== */
const toggleAccountMenu = () => {
  if (!isLoggedIn.value) router.push("/login");
  else showDropdown.value = !showDropdown.value;
};

const logout = () => {
  [
    "auth_token","user_name","user_role",
    "user_photo","avatar_url","photo","user",
    "user_perms","can_see_menu"
  ].forEach(k => localStorage.removeItem(k));

  isLoggedIn.value = false;
  showDropdown.value = false;
  router.push("/login");
};

/* ====== Lifecycle ====== */
onMounted(() => {
  checkLogin();
  window.addEventListener("scroll", handleScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
onBeforeRouteUpdate(async () => { await checkLogin(); });

/* bloque le scroll de la page quand le menu mobile est ouvert */
watch(open, (v) => { document.body.style.overflow = v ? "hidden" : ""; });




// ⬇️ ajoute ces lignes à ton script setup
const mobileAccOpen = ref(false);
const toggleMobileAcc = () => (mobileAccOpen.value = !mobileAccOpen.value);

// ferme le sous-menu quand on ferme le burger
watch(open, (v) => {
  document.body.style.overflow = v ? "hidden" : "";
  if (!v) mobileAccOpen.value = false;
});

/* ✅ état d’ouverture du sous-menu mobile */
const showMobileAccount = ref(false)

/* ferme automatiquement le sous-menu quand on navigue */
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    showMobileAccount.value = false
    open.value = false
  }
)



</script>


<template>
  <header class="topbar" :class="{ scrolled }">
    <div class="inner">
      <!-- Logo -->
      <div class="brand">
        <img src="/logo.jpg" class="logo" alt="Logo" />
        <span class="brand-name">MonSite<span class="accent">Omra</span></span>
      </div>

      <!-- Menu Desktop -->
      <ul class="menu">
        <li
          v-for="(it, i) in menuItems"
          :key="i"
          class="menu-item"
          :class="{ 'has-children': it.children }"
        >
          <router-link :to="it.to" class="item">
            {{ it.label }}
            <i v-if="it.children" class="fas fa-chevron-down small-arrow"></i>
          </router-link>

          <!-- Sous-menu en petite carte -->
          <div v-if="it.children" class="submenu-card">
            <router-link
              v-for="(sub, j) in it.children"
              :key="j"
              :to="sub.to"
              class="submenu-item"
              @click="open = false"
            >
              <i :class="sub.icon"></i>
              {{ sub.label }}
            </router-link>
          </div>
        </li>
      </ul>

      <!-- Mon compte -->
      <div class="account-menu">
        <button
          class="account-btn"
          @click="toggleAccountMenu"
          aria-haspopup="menu"
          :aria-expanded="showDropdown"
        >
          <img
            v-if="isLoggedIn && avatarSrc && photoOk"
            :src="avatarSrc"
            alt="avatar"
            class="avatar"
            @error="photoOk = false"
          />
          <i v-else class="fas fa-user-circle"></i>

          <span v-if="!isLoggedIn">Mon compte</span>
          <span v-else>{{ userName }}</span>
          <i v-if="isLoggedIn" class="fas fa-chevron-down small-arrow" :class="{ open: showDropdown }"></i>
        </button>

        <!-- Menu déroulant -->
        <div v-if="isLoggedIn && showDropdown" class="dropdown" role="menu">
          <!-- Profil -->
          <RouterLink
            to="/profile"
            class="dropdown-link"
            @click="showDropdown = false"
          >
            <img
              v-if="isLoggedIn && avatarSrc && photoOk"
              :src="avatarSrc"
              alt="avatar"
              class="avatar avatar--sm"
              @error="photoOk = false"
            />
            <i v-else class="fas fa-user"></i>
            <span>Mon profil</span>
          </RouterLink>

          <!-- Admin -->
          <RouterLink
            v-if="isAdmin"
            to="/admin/dashboard"
            class="dropdown-link"
            @click="showDropdown = false"
          >
            <i class="fas fa-tools"></i>
            <span>Accès admin</span>
          </RouterLink>

          <!-- Client -->
          <template v-else>
            <RouterLink
              to="/mes-reservations"
              class="dropdown-link"
              @click="showDropdown = false"
            >
              <i class="fas fa-file-alt"></i>
              <span>Mes réservations</span>
            </RouterLink>

            <RouterLink
              to="/temoignages"
              class="dropdown-link"
              @click="showDropdown = false"
            >
              <i class="fas fa-star"></i>
              <span>Laisser un témoignage</span>
            </RouterLink>
          </template>

          <!-- Déconnexion -->
          <button class="dropdown-link logout-btn" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <!-- Burger -->
      <button class="burger" :class="{ open: open }" @click="open = !open" aria-controls="mobile-menu" :aria-expanded="open">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Menu mobile -->
    <!-- Menu mobile -->
    <transition name="fade">
      <div v-if="open" id="mobile-menu" class="mobile-overlay" @click.self="open = false">
        <nav class="mobile-nav">
      <!-- liens principaux -->
      <router-link
        v-for="(it, i) in menuItems"
        :key="'m' + i"
        :to="it.to"
        class="m-item"
        @click="open = false"
      >
        {{ it.label }}
      </router-link>

      <hr class="m-sep" />

      <!-- 🔒 pas connecté -->
      <router-link
        v-if="!isLoggedIn"
        to="/login"
        class="m-item"
        @click="open = false"
      >
        <i class="fas fa-user-circle"></i>&nbsp; MON COMPTE
      </router-link>

      <!-- ✅ connecté : en-tête compte centré + flèche -->
      <template v-else>
        <!-- 🧍 Bloc compte utilisateur mobile -->
    <div v-if="isLoggedIn" class="m-account">
      <button class="m-account-btn" @click="showMobileAccount = !showMobileAccount">
        <img
          v-if="avatarSrc && photoOk"
          :src="avatarSrc"
          alt="avatar"
          class="avatar"
          @error="photoOk = false"
        />
        <span class="m-account-name">{{ userName.toUpperCase() }}</span>
        <i
          class="fas fa-chevron-down arrow"
          :class="{ open: showMobileAccount }"
        ></i>
      </button>

      <!-- sous-menu -->
      <transition name="fade">
        <div v-if="showMobileAccount" class="m-acc-panel">
          <!-- 👑 admin -->
          <template v-if="isAdmin">
            <RouterLink to="/profile" class="m-item" @click="open = false">
              <i class="fas fa-user"></i> MON PROFIL
            </RouterLink>
            <RouterLink to="/admin/dashboard" class="m-item" @click="open = false">
              <i class="fas fa-tools"></i> ACCÈS ADMIN
            </RouterLink>
            <button class="m-item logout" @click="logout">
              <i class="fas fa-sign-out-alt"></i> DÉCONNEXION
            </button>
          </template>

          <!-- 👤 client -->
          <template v-else>
            <RouterLink to="/profile" class="m-item" @click="open = false">
              <i class="fas fa-user"></i> MON PROFIL
            </RouterLink>
            <RouterLink to="/mes-reservations" class="m-item" @click="open = false">
              <i class="fas fa-file-alt"></i> MES RÉSERVATIONS
            </RouterLink>
            <RouterLink to="/temoignages" class="m-item" @click="open = false">
              <i class="fas fa-star"></i> LAISSER UN TÉMOIGNAGE
            </RouterLink>
            <button class="m-item logout" @click="logout">
              <i class="fas fa-sign-out-alt"></i> DÉCONNEXION
            </button>
          </template>
        </div>
      </transition>
    </div>

      </template>
    </nav>


      </div>
    </transition>

  </header>
</template>

<style scoped src="@/assets/styles/PublicHeader.css"></style>
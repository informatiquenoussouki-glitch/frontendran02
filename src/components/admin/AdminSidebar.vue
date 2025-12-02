<template>
  <!-- 🌐 Bouton hamburger visible uniquement sur mobile -->
<header class="admin-topbar full-width">
  <button
    type="button"
    class="hamburger-btn"
    aria-label="Ouvrir le menu"
    @click="openSidebar"
  >
    <span></span><span></span><span></span>
  </button>
  <span class="topbar-title">Administration</span>
</header>


  
  <!-- Overlay (mobile only) -->
  <div
    class="sidebar-overlay"
    v-if="mobileOpen && isMobile"
    @click="closeSidebar"
  ></div>

  <!-- ⬇️ 1 SEUL ASIDE -->
  <aside
    v-if="shouldShowSidebar"
    class="sidebar"
    :class="{ 'is-mobile': isMobile, open: mobileOpen }"
    role="navigation"
    aria-label="Menu d’administration"
  >
    <button
      v-if="isMobile"
      type="button"
      class="sidebar-close"
      aria-label="Fermer le menu"
      @click="closeSidebar"
    >×</button>


    

  <!-- === Logo + Nom du site (ouvre la Home publique) === -->
<RouterLink to="/" class="sidebar-header" title="Aller au site">
  <img class="logo-img" src="../assets/images/site_omra.png"  />
  <span class="sidebar-title">
    Mon<span class="blue">Site</span><span class="green">Omra</span>
  </span>
</RouterLink>

<nav class="menu">
  <!-- 🏠 Dashboard -->
  <router-link
    to="/admin/dashboard"
    class="menu-item h2"
    active-class="active"
  >
    <i class="fa fa-home"></i> Dashboard
  </router-link>

  <!-- 🕋 OMRA -->
  <div class="menu-section clickable h1" @click="toggleOmra">
    <span>🕋 OMRA</span>
    <span class="arrow" :class="{ open: showOmra }">▾</span>
  </div>

  <transition name="fade">
    <div v-if="showOmra" class="submenu">

      <router-link
        to="/admin/omra/create"
        class="menu-item h2"
        active-class="active"
      >
        <i class="fa fa-plus-circle"></i> Ajouter une Omra
      </router-link>

      <button
        type="button"
        class="menu-item ghost h2"
        :class="{ disabled: !canEditOmra, active: route.path.startsWith('/admin/omra/edit') }"
        :disabled="!canEditOmra"
        @click="goEditOmra"
      >
        <i class="fa fa-pencil"></i> Modifier une Omra
      </button>

      <!-- ✅ Liste des Omras -->
      <div
        class="menu-item clickable h2"
        :class="{ active: isOmraListRoot }"
        @click.stop="toggleOmraListAndGo"
      >
        <span><i class="fa fa-list-ul"></i> Liste des Omras</span>
        <span class="arrow" :class="{ open: showOmraList }">▾</span>
      </div>

      <transition name="fade">
        <div v-if="showOmraList" class="submenu">
          <router-link
            class="menu-item sub h3"
            :class="{ active: currentType === 'economique' }"
            :to="{ path: '/admin/omras', query: { type: 'economique' } }"
          >
            <i class="fa fa-tag"></i> Omra économique
          </router-link>

          <router-link
            class="menu-item sub h3"
            :class="{ active: currentType === 'confort' }"
            :to="{ path: '/admin/omras', query: { type: 'confort' } }"
          >
            <i class="fa fa-tag"></i> Omra confort
          </router-link>

          <router-link
            class="menu-item sub h3"
            :class="{ active: currentType === 'ramadan' }"
            :to="{ path: '/admin/omras', query: { type: 'ramadan' } }"
          >
            <i class="fa fa-tag"></i> Omra Ramadan
          </router-link>
        </div>
      </transition>
    </div>
  </transition>

  <!-- 🏨 HÔTELS -->
  <div class="menu-section clickable h1" @click="toggleHotels">
    <span>🏨 HÔTELS</span>
    <span class="arrow" :class="{ open: showHotels }">▾</span>
  </div>

  <transition name="fade">
    <div v-if="showHotels" class="submenu">
      <router-link
        to="/admin/hotel/create"
        class="menu-item h2"
        active-class="active"
      >
        <i class="fa fa-plus-circle"></i> Ajouter un Hôtel
      </router-link>

      <button
        type="button"
        class="menu-item ghost h2"
        :class="{ disabled: !canEditHotel, active: route.path.startsWith('/admin/hotel/edit') }"
        :disabled="!canEditHotel"
        @click="goEditHotel"
      >
        <i class="fa fa-pencil"></i> Modifier un Hôtel
      </button>

      <router-link
        to="/admin/hotels"
        class="menu-item h2"
        active-class="active"
        :class="{ active: isHotelsList }"
      >
        <i class="fa fa-list-ul"></i> Liste des Hôtels
      </router-link>
    </div>
  </transition>

  <!-- 👥 Clients -->
  <router-link
    to="/admin/clients"
    class="menu-item h2"
    active-class="active"
  >
    <i class="fa fa-users"></i> Clients
  </router-link>

  <!-- 📅 Réservations -->
  <router-link
    to="/admin/reservation"
    class="menu-item h2"
    active-class="active"
  >
    <i class="fa fa-calendar"></i> Réservations
  </router-link>

  <!-- 💬 Témoignages -->
  <RouterLink to="/admin/testimonials"
    class="menu-item h2"
    active-class="active">
    <i class="fa fa-comments"></i> Témoignages
  </RouterLink>


    <!-- 📰 BLOG -->
<!-- 📰 BLOG -->
<div class="menu-section clickable h1" @click="toggleBlog">
  <span>📰 BLOG</span>
  <span class="arrow" :class="{ open: showBlog }">▾</span>
</div>

<transition name="fade">
  <div v-if="showBlog" class="submenu">

    <!-- ➕ Ajouter un article -->
    <router-link
      to="/admin/blog/posts/create"
      class="menu-item h2"
      active-class="active"
    >
      <i class="fa fa-plus-circle"></i> Ajouter un article
    </router-link>

    <!-- ✏️ Modifier un article -->
    <button
      type="button"
      class="menu-item ghost h2"
      :class="{ disabled: !isEditingPost, active: isEditingPost }"
      :disabled="!isEditingPost"
      @click="goEditPost"
    >
      <i class="fa fa-pencil"></i> Modifier un article
    </button>

    <!-- 📜 Liste des articles -->
    <div
      class="menu-item clickable h2"
      :class="{ active: isBlogListRoot }"
      @click.stop="toggleBlogListAndGo"
    >
      <span><i class="fa fa-list-ul"></i> Liste des articles</span>
      <span class="arrow" :class="{ open: showBlogList }">▾</span>
    </div>

    <!-- 🏷️ Sous-catégories -->
    <transition name="fade">
      <div v-if="showBlogList" class="submenu">
        <router-link
          class="menu-item sub h3"
          :class="{ active: blogCategory === 'omra' && isBlogListRoot }"
          :to="{ path: '/admin/blog/posts', query: { category: 'omra' } }"
        >
          <i class="fa fa-tag"></i> Omra
        </router-link>

        <router-link
          class="menu-item sub h3"
          :class="{ active: blogCategory === 'economique' && isBlogListRoot }"
          :to="{ path: '/admin/blog/posts', query: { category: 'economique' } }"
        >
          <i class="fa fa-tag"></i> Omra économique
        </router-link>

        <router-link
          class="menu-item sub h3"
          :class="{ active: blogCategory === 'confort' && isBlogListRoot }"
          :to="{ path: '/admin/blog/posts', query: { category: 'confort' } }"
        >
          <i class="fa fa-tag"></i> Omra confort
        </router-link>

        <router-link
          class="menu-item sub h3"
          :class="{ active: blogCategory === 'ramadan' && isBlogListRoot }"
          :to="{ path: '/admin/blog/posts', query: { category: 'ramadan' } }"
        >
          <i class="fa fa-tag"></i> Omra Ramadan
        </router-link>
      </div>
    </transition>
  </div>
</transition>


</nav>

  </aside>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";

const route = useRoute();
const router = useRouter();

const mobileOpen = ref(false);
const isMobile = ref(false);

function computeIsMobile() {
  // breakpoint = 992px (≈ tablets & phones)
  isMobile.value = window.matchMedia("(max-width: 992px)").matches;
  // auto-close drawer if we leave mobile
  if (!isMobile.value) mobileOpen.value = false;
}

function openSidebar() {
  if (!isMobile.value) return;
  mobileOpen.value = true;
  document.documentElement.style.overflow = "hidden"; // lock scroll
}
function closeSidebar() {
  mobileOpen.value = false;
  document.documentElement.style.overflow = "";
}

// close on route change (mobile)
watch(() => route.fullPath, () => { if (isMobile.value) closeSidebar() });

onMounted(() => {
  computeIsMobile();
  window.addEventListener("resize", computeIsMobile);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", computeIsMobile);
  document.documentElement.style.overflow = "";
});


const adminNom = ref("");
const adminPrenom = ref("");

// ✅ Affiche la sidebar si on est sur /dashboard ou une page /admin
const shouldShowSidebar = computed(() =>
  route.path === "/admin/dashboard" || route.path.startsWith("/admin")
);

onMounted(() => {
  const user = localStorage.getItem("user");
  if (user) {
    const data = JSON.parse(user);
    adminNom.value = data.nom || "";
    adminPrenom.value = data.prenom || "";
  }
});



/* === États déroulants === */
const showOmra = ref(true)
const showOmraList = ref(true)
const showHotels = ref(true)
function toggleOmra() { showOmra.value = !showOmra.value }
function toggleOmraList() { showOmraList.value = !showOmraList.value }
function toggleHotels() { showHotels.value = !showHotels.value }

/* === Infos utilisateur === */

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const data = JSON.parse(user)
    adminNom.value = data.nom || ''
    adminPrenom.value = data.prenom || ''
  }
})



/* === États actifs pour sous-listes === */
const isOmraList = computed(() => route.path.startsWith('/admin/omras'))
const isHotelsList = computed(() => route.path.startsWith('/admin/hotels'))

const isOmraListAll = computed(() => isOmraList.value && !route.query.type)
const isOmraListEco = computed(() => isOmraList.value && route.query.type === 'economique')
const isOmraListConfort = computed(() => isOmraList.value && route.query.type === 'confort')
const isOmraListRamadan = computed(() => isOmraList.value && route.query.type === 'ramadan')

// Parent "Liste des Omras" actif uniquement si /admin/omras SANS ?type=
const isOmraListRoot = computed(() =>
  route.path.startsWith('/admin/omras') && !route.query.type
)

const currentType = computed(() => String(route.query.type || ''))



function toggleOmraListAndGo() {
  showOmraList.value = !showOmraList.value;
  router.push({ path: '/admin/omras' }); // ✅ affiche toutes les Omras
}



/* === BLOG: états déroulants === */
const showBlog = ref(true);
const showBlogList = ref(true);
function toggleBlog() { showBlog.value = !showBlog.value }
function toggleBlogList() { showBlogList.value = !showBlogList.value }

/* === BLOG: états actifs === */
const isBlogListRoot = computed(() => {
  const path = route.path.replace(/\/+$/, ""); // enlève éventuel slash final
  return path === "/admin/blog/posts";         // ✅ uniquement la vraie page liste
});

const blogCategory = computed(() => String(route.query.category || ""));

/* === BLOG: bouton "Modifier un article" actif uniquement sur /:id/edit === */
const isEditingPost = computed(() => /^\/admin\/blog\/posts\/\d+\/edit$/.test(route.path));

function goEditPost() {
  if (!isEditingPost.value) return;
  router.push(route.fullPath); // reste sur la page d'édition actuelle
}

/* === Naviguer vers la liste générale === */
function toggleBlogListAndGo() {
  showBlogList.value = !showBlogList.value;
  router.push({ path: "/admin/blog/posts" });
}



</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  font-weight: 500;
  z-index: 1100;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* APRÈS : ne cible que les liens de 1er niveau */
.menu > .router-link-exact-active {
  background: #eef6fd;
  border: 1px solid #bfdbfe;
  color: #0b5cab;
  font-weight: 600;
  border-radius: 6px;
}

/* === Niveaux de texte === */
.h1 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e3a8a;
}

.h2 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #152a63;
}

.h3 {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

/* === Sections et flèches === */
.menu-section.clickable {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item.clickable {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}
.arrow.open {
  transform: rotate(180deg);
}

/* === Sous-menu === */
.submenu {
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 4px;
}

/* === Animation === */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* === Liens === */
.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
  
}

.menu-item.active {
  background: #eef6fd;
  border: 1px solid #bfdbfe;
  color: #0b5cab;
}

.menu-item:hover {
  background: #f8fafc;
  transform: translateX(3px);
}

.menu-item.ghost.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}


/* Aligner OMRA, HÔTELS et AUTRES exactement comme Dashboard */
.menu-section,
.menu-item.h2,
.menu-item.h3 {
  margin-left: 0 !important;
  padding-left: 0 !important;
}

/* Garder une petite indentation uniquement pour les sous-menus */
.submenu .menu-item {
  padding-left: 22px !important; /* petit retrait pour les sous-liens */
}

/* Ajuster les flèches ▾ à la même position que le texte */
.menu-section.clickable {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
}

/* === LOGO + TITRE (style identique au menu) === */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 6px;
   padding: 8px 0;
          /* même padding que .menu-item */
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.9rem;             /* même taille */
  font-weight: 700;              /* même poids */
  color: #152a63;                /* même couleur */
  margin-left: 0;                /* aligne avec menu */
  margin-bottom: 8px;
}

/* ✅ effet hover identique */
.sidebar-header:hover {
  background: #f8fafc;
  transform: translateX(3px);
}

/* ✅ même taille que les icônes des menus */
.logo-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* ✅ style du texte comme les .menu-item */
.sidebar-title {
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.2px;
  line-height: 1;
  color: #152a63;
  font-size: 20px;
}

/* ✅ couleurs cohérentes */
.sidebar-title .blue {
  color: #1e3a8a;
  font-weight: 600;
}

.sidebar-title .green {
  color: #059669;
  font-weight: 600;
}

/* Dans le sous-menu, on n'utilise PAS les classes auto de Vue Router */
.submenu .router-link-exact-active,
.submenu .router-link-active {
  background: transparent !important;
  border-color: transparent !important;
  color: inherit !important;
  font-weight: inherit !important;
}


/* ✅ Force la couleur du sous-lien actif dans le sous-menu */
.submenu .menu-item.active {
  background: #eef6fd !important;
  border: 1px solid #bfdbfe !important;
  color: #0b5cab !important;
  font-weight: 600 !important;
  border-radius: 6px;
}

/* Overlay (mobile) */
.sidebar-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(1px);
  z-index: 1099;
}

/* Drawer state on mobile */
.sidebar.is-mobile {
  width: 86vw;               /* comfortable width on phones */
  max-width: 360px;
  transform: translateX(-100%);
  transition: transform .28s ease;
  border-radius: 0 10px 10px 0;  /* look like a drawer */
}
.sidebar.is-mobile.open {
  transform: translateX(0);
}

/* Close button (mobile) */
.sidebar-close {
  position: absolute;
  top: 10px; right: 10px;
  width: 34px; height: 34px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  font-size: 20px; line-height: 1;
  cursor: pointer;
}

/* Slightly tighter spacing on small screens */
@media (max-width: 992px) {
  .menu { gap: 4px; }
  .menu-item { padding: 10px 12px; }
  .h1 { font-size: .95rem; }
  .h2 { font-size: .9rem; }
  .h3 { font-size: .85rem; }
}

/* Safe bottom padding for devices with gesture bars */
@supports (padding: max(0px)) {
  .sidebar { padding-bottom: max(18px, env(safe-area-inset-bottom)); }
}




/* ===== BARRE BLEUE PLEINE LARGEUR ===== */
.admin-topbar.full-width {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0b5cab;           /* ton bleu */
  padding: 14px 20px;
  border-radius: 0;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  justify-content: flex-start;
}

/* ===== BOUTON HAMBURGER ===== */
.hamburger-btn {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.hamburger-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}
.hamburger-btn span + span {
  margin-top: 4px;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 6px;
}

/* ===== TITRE ===== */
.topbar-title {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

/* ===== AFFICHAGE RESPONSIVE ===== */
@media (min-width: 993px) {
  /* Cache complètement la barre bleue sur écran PC/tablette */
  .admin-topbar.full-width {
    display: none !important;
  }
}



/* Alignement et taille cohérente des icônes FA */
.menu-item i,
.menu-section i {
  width: 18px;          /* réserve l'espace */
  min-width: 18px;
  text-align: center;
  font-size: 16px;
  line-height: 1;
  margin-right: 6px;
  
}



.menu-item.ghost { background:#f9fafb; border:1px solid #e5e7eb; color:#0f172a; }
.menu-item.ghost.active { background:#eef6fd; border-color:#bfdbfe; color:#0b5cab; font-weight:600; }
.menu-item.ghost.disabled { opacity:.5; pointer-events:none; cursor:not-allowed; }


</style>
<template>
<aside v-if="shouldShowSidebar" class="sidebar">
<router-link to="/" class="sidebar-header-link">
  <div class="sidebar-header">
    <img src="/logo.jpg" alt="Logo" class="logo-img" />
    <span class="sidebar-title">
      <span class="blue">MonSite</span><span class="green">Omra</span>
    </span>
  </div>
</router-link>




    <!-- 🔷 Logo + Nom du site -->
    
    <nav class="menu">
      <!-- 🏠 Section principale -->
      <router-link to="/admin/dashboard" class="menu-item h2" active-class="active">🏠 Dashboard</router-link>

      <!-- 🕋 Section Omras -->
      <div class="menu-section clickable h1" @click="toggleOmra">
         🕋 OMRA
        <span class="arrow" :class="{ open: showOmra }">▾</span>
      </div>

      <transition name="fade">
        <div v-if="showOmra" class="submenu">
          <router-link to="/admin/omra/create" class="menu-item h2" active-class="active">
            ➕ Ajouter une Omra
          </router-link>

          <button
            type="button"
            class="menu-item ghost h2"
            :class="{ disabled: !canEditOmra, active: isEditingOmra }"
            :disabled="!canEditOmra"
            @click="goEditOmra">
            ✏️ Modifier une Omra
          </button>

          <!-- ✅ Liste des Omras déroulante -->
          <div
            class="menu-item clickable h2"
            @click.stop="toggleOmraListAndGo"
            >
            🗂️ Liste des Omras
            <span class="arrow" :class="{ open: showOmraList }">▾</span>
          </div>

          <transition name="fade">
            <div v-if="showOmraList" class="submenu">
              <router-link
                class="menu-item sub h3"
                :class="{ active: isOmraListEco }"
                :to="{ path: '/admin/omras', query: { type: 'economique' } }"
                >Omra économique
              </router-link>

              <router-link
                class="menu-item sub h3"
                :class="{ active: isOmraListConfort }"
                :to="{ path: '/admin/omras', query: { type: 'confort' } }"
                >Omra confort
              </router-link>

              <router-link
                class="menu-item sub h3"
                :class="{ active: isOmraListRamadan }"
                :to="{ path: '/admin/omras', query: { type: 'ramadan' } }"
                >Omra Ramadan
              </router-link>
            </div>
          </transition>
        </div>
      </transition>

      <!-- 🏨 Section Hôtels -->
      <div class="menu-section clickable h1" @click="toggleHotels">
          🏨 HÔTELS
        <span class="arrow" :class="{ open: showHotels }">▾</span>
      </div>

      <transition name="fade">
        <div v-if="showHotels" class="submenu">
          <router-link to="/admin/hotel/create" class="menu-item h2" active-class="active">
            ➕ Ajouter un Hôtel
          </router-link>

          <button
            type="button"
            class="menu-item ghost h2"
            :class="{ disabled: !canEditHotel, active: isEditingHotel }"
            :disabled="!canEditHotel"
            @click="goEditHotel">
            ✏️ Modifier un Hôtel
          </button>

          <router-link to="/admin/hotels" class="menu-item h2"
            :class="{ active: route.path.startsWith('/admin/hotels/list') }">
            🗂️ Liste des Hôtels
          </router-link>
        </div>
      </transition>

      <!-- 👥 Autres sections -->
       <router-link to="/admin/clients" class="menu-item h2" active-class="active">👥 Clients</router-link>
      <router-link to="/admin/devis" class="menu-item h2" active-class="active">📅 Réservations</router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref, onMounted } from "vue";

const route = useRoute();
const router = useRouter();
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
const showOmra = ref(false)
const showOmraList = ref(false)
const showHotels = ref(false)
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
const isOmraList = computed(() => route.path.startsWith('/admin/omras/list'))
const isOmraListAll = computed(() => isOmraList.value && !route.query.type)
const isOmraListEco = computed(() => isOmraList.value && route.query.type === 'economique')
const isOmraListConfort = computed(() => isOmraList.value && route.query.type === 'confort')
const isOmraListRamadan = computed(() => isOmraList.value && route.query.type === 'ramadan')


function toggleOmraListAndGo() {
  showOmraList.value = !showOmraList.value;
  router.push({ path: '/admin/omras' }); // ✅ affiche toutes les Omras
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




</style>
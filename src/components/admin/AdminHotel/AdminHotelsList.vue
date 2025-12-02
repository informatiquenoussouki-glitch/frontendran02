<!-- src/pages/admin/AdminHotelsList.vue -->
<script setup>
/* =========================================================
   Imports : Vue, API, UI partagée
   ========================================================= */
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'      
import AlertPopup from '@/components/popups/AlertPopup.vue'
import { useFlash } from '@/composables/useFlash'
import ConfirmPopup from '@/components/popups/ConfirmPopup.vue'


/* =========================================================
   Flash utils (optionnels si tu utilises déjà FlashBanner)
   ========================================================= */
const { error: flashError } = useFlash()

/* =========================================================
   ÉTAT : données, chargement, erreur
   ========================================================= */
const list    = ref([])      // liste brute renvoyée par l'API
const loading = ref(false)   // indicateur de chargement
const error   = ref('')      // message d'erreur réseau/API (si besoin)

/* =========================================================
   Chargement de la liste depuis l'API
   ========================================================= */
async function load () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/admin/hotels')

    list.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Erreur de chargement.'
    // en option, tu peux aussi afficher un flash
    flashError(error.value)
  } finally {
    loading.value = false
  }
}
onMounted(load)

/* =========================================================
   Recherche + Tri
   - norm() : normalise pour recherche (sans accents, minuscules)
   - sortedById : tri DESC par id
   - filteredHotels : trié puis filtré par le terme saisi
   ========================================================= */
const q = ref('') // terme de recherche (nom/ville)

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// Tri par id décroissant (les plus récents en haut)
const sortedById = computed(() => [...list.value].sort((a, b) => b.id - a.id))

// On filtre sur la liste TRIÉE
const filteredHotels = computed(() => {
  const term = norm(q.value)
  if (!term) return sortedById.value
  return sortedById.value.filter(h =>
    norm(h.name).includes(term) || norm(h.city).includes(term)
  )
})

/* =========================================================
   Pagination : 10 hôtels par page
   ========================================================= */
const pageSize    = 10
const currentPage = ref(1)

const totalPages = computed(() => {
  const total = filteredHotels.value.length
  return total > 0 ? Math.ceil(total / pageSize) : 1
})

const paginatedHotels = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end   = start + pageSize
  return filteredHotels.value.slice(start, end)
})



// Boutons précédent / suivant
function goPrevPage () {
  if (currentPage.value > 1) currentPage.value--
}

function goNextPage () {
  if (currentPage.value < totalPages.value) currentPage.value++
}


/* =========================================================
   ConfirmPopup + AlertPopup
   - askDelete : ouvre la popup de confirmation
   - doDelete  : supprime puis recharge la liste
   - openSuccess/openError : helper pour l'AlertPopup
   ========================================================= */
const confirmOpen  = ref(false)
const confirmMsg   = ref('')
const toDeleteId   = ref(null)
const toDeleteName = ref('')

function askDelete (hotel) {
  toDeleteId.value   = hotel?.id ?? null
  toDeleteName.value = hotel?.name || ''
  confirmMsg.value   = `Voulez-vous vraiment Supprimer cet hôtel « ${toDeleteName.value} » ?`
  confirmOpen.value  = true
}

async function confirmDeletion () {
  if (!toDeleteId.value) {
    confirmOpen.value = false
    return
  }

  // 📌 mémoriser la page AVANT la suppression
  const previousPage = currentPage.value

  await removeHotel(toDeleteId.value, previousPage)
  confirmOpen.value = false
}

async function removeHotel (id, previousPage) {
  try {
    await api.delete(`/admin/hotels/${id}`)

    // on enlève l’hôtel de la liste
    list.value = list.value.filter(h => h.id !== id)

    // 🔁 recalcul de la page max après suppression
    const total   = filteredHotels.value.length
    const maxPage = Math.max(1, Math.ceil(total / pageSize))

    // ✅ rester sur la même page si elle existe encore
    currentPage.value = Math.min(previousPage, maxPage)

    openSuccess(`L’hôtel « ${toDeleteName.value || id} » a été supprimé.`)
  } catch (e) {
    const status = e?.response?.status
    const msg = e?.response?.data?.message || e?.message || 'Suppression impossible.'
    if (status === 409) { // bloqué par une Omra publiée
      openError(msg)
      return
    }
    openError(msg)
  } finally {
    toDeleteId.value   = null
    toDeleteName.value = ''
  }
}

// 🔎 Quand la recherche change → retour à la page 1
watch(q, () => {
  currentPage.value = 1
})

// 📄 Quand la liste filtrée change (après suppression / ajout) → ajuster la page si besoin
watch(filteredHotels, (newList) => {
  const maxPage = Math.max(
    1,
    Math.ceil(newList.length / pageSize)
  )
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})



// AlertPopup (succès/erreur)
const showAlert = ref(false)
const alertData = ref({
  variant: 'success',
  title: 'Succès',
  message: '',
  primaryText: 'OK',
})
function openSuccess (msg) {
  alertData.value = { variant: 'success', title: 'Succès', message: msg || 'Opération effectuée.', primaryText: 'OK' }
  showAlert.value = true
}
function openError (msg) {
  alertData.value = { variant: 'error', title: 'Erreur', message: msg || 'Une erreur est survenue.', primaryText: 'Fermer' }
  showAlert.value = true
}

</script>

<template>
  <main class="content hotels-container">
    <h2 class="page-title"><i class="fa fa-hotel"></i> Gestion des Hôtels</h2>
    <div class="card table-card" v-if="!loading">
    <!-- Header aligné comme Clients : titre à gauche, recherche à droite, bouton à droite -->
    <!-- Header -->
<div class="hotels-header">
  <h3>Liste des Hôtels</h3>

  <div class="header-right">
    <!-- Bouton Ajouter (inchangé) -->
    <RouterLink :to="{ path: '/admin/hotel/create' }" class="btn-add-hotel">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span>Ajouter un Hôtel</span>
    </RouterLink>
  </div>
</div>

<!-- 🔽 Barre de recherche sous le bouton (alignée à droite) -->
<div class="searchbar-row">
  <div class="search-wrapper">
    <i class="fa-solid fa-magnifying-glass search-icon"></i>
    <input
      v-model="q"
      type="search"
      placeholder="Rechercher (nom ou ville)…"
      aria-label="Rechercher un hôtel"
      class="search-modern-input"
    />
  </div>
</div>


    <!-- Tableau dans une carte blanche ombrée comme Clients -->
    
      <div class="table-wrapper">
        <table class="hotels-table">
          <thead>
            <tr>
              <th style="text-align:center;">Nom</th>
              <th style="text-align:center;">Ville</th>
              <th style="text-align:center;">★</th>
              <th style="text-align:center;" class="actions-header">Actions</th>
            </tr>
          </thead>

          <tbody v-if="filteredHotels.length">
            <tr v-for="h in paginatedHotels" :key="h.id" class="hotel-row">
              <td data-label="Nom"   style="text-align:center">{{ h.name }}</td>
              <td data-label="Ville" style="text-align:center">{{ h.city }}</td>
              <td data-label="★"     style="text-align:center">{{ h.stars }}</td>

              <td data-label="Actions" class="actions-cell">
                <div class="actions-inline">
                 
                  <!-- Modifier -->
                  <RouterLink
                    :to="{ name: 'admin-hotels-edit', params: { id: h.id } }"
                    class="icon-btn"
                    title="Modifier"
                    aria-label="Modifier">
                    <i class="fas fa-edit"></i>
                  </RouterLink>


                  <!-- Supprimer -->
                  <button class="icon-btn danger" @click="askDelete(h)" title="Supprimer" aria-label="Supprimer">
                    <i class="fas fa-trash-alt"></i>
                  </button>

                  <!-- Détails (route publique) -->
                  <RouterLink
                    :to="{ name:'hotel-view', params:{ id: h.id } }"
                    class="icon-btn icon-btn--view"
                    title="Détails"
                    aria-label="Détails">
                    <i class="fas fa-eye"></i>
                  </RouterLink>


                </div>
              </td>
            </tr>
          </tbody>

          <!-- État vide (après filtre) -->
          <tbody v-else>
            <tr>
              <td colspan="4" class="empty">Aucun hôtel ne correspond à « {{ q }} ».</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination simple (comme articles du blog) -->
      <div class="pagination-simple" v-if="filteredHotels.length">
        <button
          type="button"
          class="pager-link"
          @click="goPrevPage"
          :disabled="currentPage === 1"
        >
          Préc.
        </button>

        <span class="pager-info">
          Page {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          type="button"
          class="pager-link"
          @click="goNextPage"
          :disabled="currentPage === totalPages"
        >
          Suiv.
        </button>
      </div>

      <!-- État vide (liste globale) -->
      <p v-if="!list.length" class="empty global-empty">Aucun hôtel pour le moment.</p>
    </div>

    <!-- État chargement -->
    <div v-else class="muted">Chargement…</div>

    <!-- Popups existants (inchangés) -->
    <ConfirmPopup
      v-model="confirmOpen"
      variant="warning"
      title="Confirmation"
      :message="confirmMsg"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      @confirm="confirmDeletion"
    />
    <AlertPopup
      v-model="showAlert"
      :variant="alertData.variant"
      :title="alertData.title"
      :message="alertData.message"
      :primary-text="alertData.primaryText"
    />
  </main>
</template>



<style src="@/assets/styles/hotels.css"></style>



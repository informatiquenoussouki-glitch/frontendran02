<!-- src/pages/admin/AdminHotelsList.vue -->
<script setup>
/* =========================================================
   Imports : Vue, API, UI partagée
   ========================================================= */
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'       // ✅ CORRECT
 import FlashBanner from '@/components/ui/FlashBanner.vue'
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
  confirmMsg.value   = `Supprimer cet hôtel « ${toDeleteName.value} » ?`
  confirmOpen.value  = true
}

async function confirmDeletion () {
  if (!toDeleteId.value) { confirmOpen.value = false; return }
  await removeHotel(toDeleteId.value)
  confirmOpen.value = false
}

async function removeHotel (id) {
  try {
    await api.delete(`/admin/hotels/${id}`)
    list.value = list.value.filter(h => h.id !== id)
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
    toDeleteId.value = null
    toDeleteName.value = ''
  }
}
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
  <main class="content">
    <!-- Bandeau (si tu utilises des flashs globaux) -->
    <FlashBanner />

    <!-- En-tête : titre + recherche + bouton d’ajout -->
    <div class="page-head">
      <h2>Liste des Hôtels</h2>

      <!-- Lien vers la page de création -->
      <RouterLink :to="{ path: '/admin/hotel/create' }" class="btn-add-hotel">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Ajouter un Hôtel</span>
      </RouterLink>
    </div>

     <!-- Barre de recherche (filtre nom/ville) -->
    <div class="searchbar">
        
      <i class="fa-solid fa-magnifying-glass search-icon"></i>

        <input
          v-model="q"
          type="search"
          placeholder="Rechercher (nom ou ville)…"
          aria-label="Rechercher un hôtel"
        />
       
    </div>

    <!-- Tableau -->
    <div class="list-wrap" v-if="!loading">
      <table class="tbl rwd">
       

        <thead>
          <tr>
            <th style="text-align:center">Nom</th>
            <th>Ville</th>
            <th>★</th>
            <th class="action">Actions</th>
          </tr>
        </thead>

        <!-- Lignes de données triées & filtrées -->
        <tbody v-if="filteredHotels.length">
          <tr v-for="h in filteredHotels" :key="h.id">
            <td data-label="Nom"  style="text-align:center">{{ h.name }}</td>
            <td data-label="Ville" style="text-align:center">{{ h.city }}</td>
            <td data-label="★"    style="text-align:center">{{ h.stars }}</td>

            <td data-label="Actions" class="action">
              <div class="actions-inline">
                <!-- Modifier -->
                <RouterLink
                  :to="{ name: 'admin-hotels-edit', params: { id: h.id } }"
                  class="icon-btn"
                  title="Modifier"
                  aria-label="Modifier">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </RouterLink>



  

                <!-- Supprimer -->
                <button class="icon-btn danger" @click="askDelete(h)" title="Supprimer" aria-label="Supprimer">
                                      <i class="fas fa-trash-alt"></i>

                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                 </button>

                <!-- Détails (route publique) -->
                 <!-- Détails (route publique) -->
                <RouterLink
                  :to="{ name:'hotel-view', params:{ id: h.id } }"
                  class="icon-btn info"
                  title="Détails"
                  aria-label="Détails">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </RouterLink>
                
              </div>
            </td>
          </tr>
        </tbody>

        <!-- État vide (après filtre) -->
        <tbody v-else>
          <tr>
            <td colspan="5" class="empty">Aucun hôtel ne correspond à « {{ q }} ».</td>
          </tr>
        </tbody>
      </table>

      <!-- État vide (liste globale) -->
      <p v-if="!list.length" class="empty">Aucun hôtel pour le moment.</p>
    </div>

    <!-- État chargement (facultatif) -->
    <div v-else class="muted">Chargement…</div>
  </main>

  <!-- Pop-up de confirmation -->
  <ConfirmPopup
    v-model="confirmOpen"
    variant="warning"
    title="Confirmation"
    :message="confirmMsg"
    confirm-text="Supprimer"
    cancel-text="Annuler"
    @confirm="confirmDeletion"
  />

  <!-- Pop-up d’alerte (succès/erreur) -->
  <AlertPopup
    v-model="showAlert"
    :variant="alertData.variant"
    :title="alertData.title"
    :message="alertData.message"
    :primary-text="alertData.primaryText"
  />
</template>

<style scoped src="@/assets/styles/AdminOmras.css"></style>

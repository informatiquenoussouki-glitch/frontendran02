<!-- src/pages/admin/AdminOmrasList.vue -->
<script setup>
/* =========================================================================
   Imports & setup
   ========================================================================= */
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import api from '@/services/api'       // ✅ CORRECT
import AlertPopup from '@/components/popups/AlertPopup.vue'
import ConfirmPopup from '@/components/popups/ConfirmPopup.vue'

/* Router */
const router = useRouter()
const route  = useRoute()

/* =========================================================================
   State
   ========================================================================= */
const list    = ref([])      // données brutes renvoyées par l'API
const loading = ref(false)
const error   = ref('')

/* Confirm (suppression) */
const showConfirm   = ref(false)
const confirmTarget = ref({ id: null, title: '' })

/* Alert (succès/erreur) */
const showAlert = ref(false)
const alertData = ref({
  variant: 'success', // 'success' | 'error' | 'warning'…
  title: 'Succès',
  message: '',
  primaryText: 'OK',
})
function openSuccess(msg){
  alertData.value = { variant:'success', title:'Succès', message: msg || 'Opération effectuée.', primaryText:'OK' }
  showAlert.value = true
}
function openError(msg){
  alertData.value = { variant:'error', title:'Erreur', message: msg || 'Une erreur est survenue.', primaryText:'Fermer' }
  showAlert.value = true
}

/* =========================================================================
   Helpers d’affichage (labels, normalisation, formats)
   ========================================================================= */
const MONTHS_FR = ['', 'Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const monthLabel = (m) => {
  if (m == null || m === '') return '—'
  if (typeof m === 'string' && !/^\d+$/.test(m.trim())) return m
  const n = Number(m)
  return (n >= 1 && n <= 12) ? MONTHS_FR[n] : String(m)
}

const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
const TYPE_LABELS = { economique:'Économique', confort:'Confort', ramadan:'Ramadan' }
const typeLabel = t => TYPE_LABELS[norm(t)] || '—'
const typeClass = t => `type-badge--${norm(t)}`

const normalizeStatus = (s) => {
  const t = norm(s)
  if (t.startsWith('pub'))  return 'Publier'
  if (t.startsWith('arch')) return 'Archiver'
  return 'Brouillon'
}
const statusLabel = s => normalizeStatus(s)
const statusClass = s => 'status-badge status--' + normalizeStatus(s).toLowerCase()

// Certaines APIs renvoient le type autrement
const TYPE_MAP = { '1':'economique', '2':'confort', '3':'ramadan' }
const unifyType = (o) => norm(o.type) || norm(o.omra_type) || TYPE_MAP[String(o.type_id || '')] || ''

// Date ISO → jj/mm/aaaa (tolère YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
const formatISOToFR = (iso) => {
  if (!iso) return '—'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/* =========================================================================
   Chargement API
   ========================================================================= */
async function load () {
  loading.value = true; error.value = ''
  try {
    const { data } = await api.get('/admin/omras')
    list.value = (Array.isArray(data) ? data : []).map(o => ({
      ...o,
      type: unifyType(o),
      _dateStartFR: formatISOToFR(o.date_start),
      _dateEndFR:   formatISOToFR(o.date_end),
    }))

    /*const { data } = await api.get("/admin/omras");
    list.value = data;*/
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Erreur chargement'
    openError(error.value)
  } finally {
    loading.value = false
  }
}
onMounted(load)

/* =========================================================================
   Filtres & recherche
   ========================================================================= */
const q            = ref('')
const yearFilter   = ref('')
const statusFilter = ref('')

const yearOptions = computed(() => {
  const s = new Set()
  ;(list.value || []).forEach(o => { const y = Number(o.year); if (Number.isFinite(y)) s.add(y) })
  return [...s].sort((a,b)=>a-b)
})

// ?type=economique|confort|ramadan
const routeType = computed(() => {
  const t = norm(route.query?.type)
  return ['economique','confort','ramadan'].includes(t) ? t : ''
})

const filteredOmras = computed(() => {
  const term = norm(q.value)
  const y    = String(yearFilter.value || '')
  const st   = String(statusFilter.value || '')

  return (list.value || [])
    .filter(o => {
      if (routeType.value && norm(o.type) !== routeType.value) return false
      if (term) {
        const hit = norm(o.title).includes(term)
               ||  norm(o.type).includes(term)
               ||  norm(monthLabel(o.month)).includes(term)
        if (!hit) return false
      }
      if (y && String(o.year) !== y) return false
      if (st && normalizeStatus(o.status) !== st) return false
      return true
    })
    .sort((a,b)=> new Date(a?.date_start||0) - new Date(b?.date_start||0))
})

function clearFilters(){ q.value=''; yearFilter.value=''; statusFilter.value='' }

/* =========================================================================
   Actions
   ========================================================================= */
function goEdit(o){ if (o?.id) router.push({ name:'admin-omras-edit', params:{ id:o.id } }) }

/* Ouverture popup confirmation */
function askRemove(o){
  confirmTarget.value = { id: o?.id ?? null, title: o?.title ?? '' }
  showConfirm.value = true
}

async function confirmRemove() {
  const omra = confirmTarget.value // 👉 On garde l'objet complet
  const id   = omra?.id
  if (!id) { cancelRemove(); return }

  // 📌 On mémorise la page actuelle AVANT la suppression
  const previousPage = currentPage.value

  try {
    await api.delete(`/admin/omras/${id}`)

    // On enlève l'omra de la liste
    list.value = list.value.filter(o => o.id !== id)

    // 🔁 On recalcule la page max après suppression
    const maxPage = Math.max(
      1,
      Math.ceil(filteredOmras.value.length / pageSize)
    )

    // ✅ On reste sur la même page si elle existe encore
    currentPage.value = Math.min(previousPage, maxPage)

    // 🔥 Message avec le titre de l’Omra supprimée
    openSuccess(`L’Omra « ${omra.title} » a été supprimée avec succès.`)
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Suppression impossible.'
    openError(msg)
  } finally {
    cancelRemove()
  }
}




function cancelRemove(){
  showConfirm.value = false
  confirmTarget.value = { id:null, title:'' }
}

/* =========================================================================
   Pagination (10 omras / page)
   ========================================================================= */
const pageSize     = 10
const currentPage  = ref(1)

const totalPages = computed(() => {
  const total = filteredOmras.value.length
  return total > 0 ? Math.ceil(total / pageSize) : 1
})

const paginatedOmras = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end   = start + pageSize
  return filteredOmras.value.slice(start, end)
})

// 1) Si les filtres ou la recherche changent → retour page 1
watch([q, yearFilter, statusFilter, routeType], () => {
  currentPage.value = 1
})

// 2) Si le nombre total change (suppression, ajout…) → on ajuste la page si nécessaire
watch(filteredOmras, (newList) => {
  const maxPage = Math.max(
    1,
    Math.ceil(newList.length / pageSize)
  )
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})


// Actions pagination
function goPrevPage () {
  if (currentPage.value > 1) currentPage.value--
}

function goNextPage () {
  if (currentPage.value < totalPages.value) currentPage.value++
}

</script>

<template>
  
  <main class="content omras-container">
    <h2 class="page-title"><i class="fas fa-kaaba"></i> Gestion des Omras</h2>
    <div class="card table-card" v-if="!loading">
      
      <!-- Header identique à Hôtels -->
      <div class="omras-header">
        <h3>Liste des Omras</h3>

        <div class="header-right">
          <RouterLink :to="{ path: '/admin/omra/create' }" class="btn-add-omra">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Ajouter une Omra</span>
          </RouterLink>
        </div>
      </div>

      <!-- Barre de recherche SOUS le bouton (comme Hôtels) -->
      <div class="searchbar-row">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="q"
            type="search"
            placeholder="Rechercher (titre, type, mois)…"
            aria-label="Rechercher une omra"
            class="search-modern-input"
          />
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-line">
        <select v-model="yearFilter" class="flt">
          <option value="">Toutes années</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>

        <select v-model="statusFilter" class="flt">
          <option value="">Tous états</option>
          <option value="Publier">Publier</option>
          <option value="Brouillon">Brouillon</option>
          <option value="Archiver">Archiver</option>
        </select>

        <button v-if="q || yearFilter || statusFilter" class="btn ghost small" @click="clearFilters">
          Réinitialiser
        </button>
      </div>

      <!-- Tableau identique au look Hôtels -->
      <div class="table-wrapper">
        <table class="omras-table">
          <thead>
            <tr>
              <th style="text-align:center;">Titre</th>
              <th style="text-align:center;">Type</th>
              <th style="text-align:center;">Mois</th>
              <th style="text-align:center;">Année</th>
              <th style="text-align:center;" class="th-2lines"> <span>Date de</span><span>départ</span> </th>
              <th style="text-align:center;"class="th-2lines"> <span>Date de</span><span>fin</span>     </th>
              <th style="text-align:center;">Statut</th>
              <th style="text-align:center;">Prix dès</th>
              <th style="text-align:center;" class="actions-header">Actions</th>
            </tr>
          </thead>

          <tbody v-if="filteredOmras.length">
            <tr v-for="o in paginatedOmras" :key="o.id">
              <td data-label="Titre"><strong>{{ o.title }}</strong></td>

              <td data-label="Type">
                <span v-if="o.type" class="type-badge" :class="typeClass(o.type)">
                  {{ typeLabel(o.type) }}
                </span>
                <span v-else>—</span>
              </td>

              <td data-label="Mois">{{ monthLabel(o.month) }}</td>
              <td data-label="Année">{{ o.year ?? '—' }}</td>

              <td data-label="Date de départ" style="white-space:nowrap; text-align:center">
                {{ o._dateStartFR }}
              </td>
              <td data-label="Date de fin" style="white-space:nowrap; text-align:center">
                {{ o._dateEndFR }}
              </td>

              <td data-label="Statut">
                <span class="status-badge" :class="statusClass(o.status)">
                  {{ statusLabel(o.status) }}
                </span>
              </td>

              <td data-label="Prix dès" style="text-align:center">
                {{ o.price_from ?? '—' }}
              </td>

              <td class="actions-cell">
                <div class="actions-inline">
                  <!-- Modifier -->
                  <RouterLink
                    class="icon-btn"
                    :to="{ name:'admin-omras-edit', params:{ id: o.id } }"
                    title="Modifier" aria-label="Modifier">
                    <i class="fas fa-edit"></i>
                  </RouterLink>

                  <!-- Supprimer -->
                  <button
                    @click="askRemove(o)"
                    class="icon-btn icon-btn--delete"
                    aria-label="Supprimer"
                    title="Supprimer">
                    <i class="fas fa-trash-alt"></i>
                  </button>

                  <!-- Voir -->
                  <RouterLink
                    class="icon-btn icon-btn--view"
                    :to="{ name:'omra-detail', params:{ id: o.id } }"
                    title="Voir" aria-label="Voir">
                    <i class="fas fa-eye"></i>
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="9" class="empty">Aucun résultat pour ces critères.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination simple -->
<div class="pagination-simple">
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


      <p v-if="!list.length" class="empty global-empty">Aucune Omra pour le moment.</p>
      <p v-if="error" class="err">{{ error }}</p>
    </div>

    <!-- État chargement -->
    <div v-else class="muted">Chargement…</div>

    <!-- Popups (inchangés) -->
    <ConfirmPopup
      v-model="showConfirm"
      variant="warning"
      title="Confirmation"
      :message="`Voulez-vous vraiment Supprimer cet Omra « ${confirmTarget.title || '—'} » ?`"
      ok-text="Supprimer"
      cancel-text="Annuler"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
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

<style scoped src="@/assets/styles/omras.css"></style>

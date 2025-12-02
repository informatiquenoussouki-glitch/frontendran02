<!-- src/pages/admin/AdminOmrasList.vue -->
<script setup>
/* =========================================================================
   Imports & setup
   ========================================================================= */
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import api from '@/services/api'
import FlashBanner from '@/components/ui/FlashBanner.vue'
import AlertPopup from '@/components/popups/AlertPopup.vue'
import ConfirmPopup from '@/components/popups/ConfirmPopup.vue'

/* Router */
const router = useRouter()
const route  = useRoute()

/* =========================================================================
   State
   ========================================================================= */
const list    = ref([])
const loading = ref(false)
const error   = ref('')

/* Confirm (suppression) */
const showConfirm   = ref(false)
const confirmTarget = ref({ id: null, title: '' })

/* Alert (succès/erreur) */
const showAlert = ref(false)
const alertData = ref({
  variant: 'success',
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
   🔍 Gestion du filtre par mois / année depuis le dashboard
   ========================================================================= */
async function fetchOmras() {
  try {
    loading.value = true
    error.value = ""

    const year = route.query.year
    const month = route.query.month

    console.log("📡 Envoi des paramètres à l’API :", { year, month })

    const res = await api.get("/admin/omras/filter", {
      params: { year, month },
    })

    console.log("✅ Omras reçues :", res.data?.length)
    list.value = (res.data || []).map(o => ({
      ...o,
      type: unifyType(o),
      _dateStartFR: formatISOToFR(o.date_start),
      _dateEndFR:   formatISOToFR(o.date_end),
    }))
  } catch (err) {
    console.error("❌ Erreur chargement Omras :", err)
    error.value = "Erreur lors du chargement des Omras."
  } finally {
    loading.value = false
  }
}

/* =========================================================================
   Chargement API — version corrigée
   ========================================================================= */
async function loadAllOmras() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/admin/omras')
    list.value = (Array.isArray(data) ? data : []).map(o => ({
      ...o,
      type: unifyType(o),
      _dateStartFR: formatISOToFR(o.date_start),
      _dateEndFR:   formatISOToFR(o.date_end),
    }))
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Erreur chargement'
    openError(error.value)
  } finally {
    loading.value = false
  }
}

/* ✅ Chargement initial : si un filtre est présent → fetchOmras, sinon → loadAllOmras */
onMounted(() => {
  const { year, month } = route.query
  if (year && month) {
    fetchOmras()
  } else {
    loadAllOmras()
  }
})

/* ✅ Recharge automatique si on change le mois/année dans l’URL */
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.year && newQuery.month) {
      fetchOmras()
    } else {
      loadAllOmras()
    }
  },
  { deep: true }
)

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

const TYPE_MAP = { '1':'economique', '2':'confort', '3':'ramadan' }
const unifyType = (o) => norm(o.type) || norm(o.omra_type) || TYPE_MAP[String(o.type_id || '')] || ''

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

function askRemove(o){
  confirmTarget.value = { id: o?.id ?? null, title: o?.title ?? '' }
  showConfirm.value = true
}

async function confirmRemove(){
  const id = confirmTarget.value.id
  if (!id) { cancelRemove(); return }
  try {
    await api.delete(`/admin/omras/${id}`)
    list.value = list.value.filter(o => o.id !== id)
    openSuccess('Omra supprimée.')
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
</script>


<template>
  <main class="content">
    <FlashBanner/>

    <div class="page-head">
      <h2>Liste des Omras</h2>

      <RouterLink :to="{ path: '/admin/omra/create' }" class="btn-add-hotel">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Ajouter une Omra</span>
      </RouterLink>
    </div>

    <!-- Filtres -->
   <div class="filters">
      <div class="searchbar">
      <i class="fa-solid fa-magnifying-glass search-icon"></i>

        <input
          v-model="q"
          type="search"
          placeholder="Rechercher (titre, type, mois)…"
          aria-label="Rechercher une omra"
        />
        <button v-if="q" class="clear" @click="q='' " aria-label="Effacer la recherche">×</button>
      </div>

        
       
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

    <!-- Liste -->
    <div class="list-wrap" v-if="!loading">
      <table class="tbl rwd" v-if="list.length">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Mois</th>
            <th>Année</th>
            <th>Date de départ</th>
            <th>Date de fin</th>
            <th>Statut</th>
            <th>Prix dès</th>
            <th class="action">Actions</th>
          </tr>
        </thead>

        <tbody v-if="filteredOmras.length">
          <tr v-for="o in filteredOmras" :key="o.id">
            <td data-label="Titre"><strong>{{ o.title }}</strong></td>

            <td data-label="Type">
              <span v-if="o.type" class="type-badge" :class="typeClass(o.type)">
                {{ typeLabel(o.type) }}
              </span>
              <span v-else>—</span>
            </td>

            <td data-label="Mois">{{ monthLabel(o.month) }}</td>
            <td data-label="Année">{{ o.year ?? '—' }}</td>

            <!-- Dates en jj/mm/aaaa -->
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

            <td class="action">
              <div class="actions-inline">

                <!-- Éditer -->
                <RouterLink
                  class="icon-btn"
                  :to="{ name:'admin-omras-edit', params:{ id: o.id } }"
                  title="Modifier" aria-label="Modifier">
                                    <i class="fas fa-edit"></i>

                </RouterLink>



  <button
  
                    @click="askRemove(o)"
                    class="delete-btn"
                    aria-label="Supprimer"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>

                <!-- Supprimer (ConfirmPopup) -->
             
                <!-- Voir (public) -->
                <RouterLink
                  class="icon-btn info"
                  :to="{ name:'omra-detail', params:{ id: o.id } }"
                  title="Voir" aria-label="Voir">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
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

      <p v-else class="empty">Aucune Omra pour le moment.</p>
      <p v-if="error" class="err">{{ error }}</p>
    </div>

    <!-- Popup confirmation suppression -->
    <ConfirmPopup
      v-model="showConfirm"
      variant="warning"
      title="Confirmation"
      :message="`Confirmer la suppression de « ${confirmTarget.title || '—'} » ?`"
      ok-text="Supprimer"
      cancel-text="Annuler"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />

    <!-- AlertPopup (succès / erreur) -->
    <AlertPopup
      v-model="showAlert"
      :variant="alertData.variant"
      :title="alertData.title"
      :message="alertData.message"
      :primary-text="alertData.primaryText"
    />
  </main>
</template>

<!-- Styles partagés -->
<style scoped src="@/assets/styles/AdminOmras.css"></style>

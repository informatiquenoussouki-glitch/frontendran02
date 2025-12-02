<template>
  <div class="hotels-container">
    <h1 class="page-title"><i class="fa fa-comments"></i> Gestion des témoignages</h1>

    <div class="card table-card" v-if="!loading">
      <div class="clients-header">
        <h3>Liste des Témoignages</h3>




        <div class="right">
          <!-- Recherche -->
          <div class="search">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              v-model="filters.q"
              @input="onSearchInput"
              class="search-input"
              type="text"
              placeholder="Rechercher…"
            />
          </div>

          <!-- Filtre statut -->
          <div class="select-wrap">
            <select v-model="filters.status" @change="onStatusChange">
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Validés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-wrap">
        <table class="clients-table nice-table">
          <!-- Largeurs stables -->
          <colgroup>
            <col style="width:15%">
            <col style="width:6%">
            <col style="width:15%">
            <col style="width:30%">
            <col style="width:10%">
            <col style="width:12%">
            <col style="width:12%">
          </colgroup>

          <thead>
            <tr>
              <th>Nom</th>
              <th>Note</th>
              <th>Titre</th>
              <th>Contenu</th>
              <th>Statut</th>
              <th>Date</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>

          <!-- ✅ Liste paginée en FRONT, comme les hôtels -->
          <tbody v-if="filteredTestimonials.length">
            <tr
              v-for="t in paginatedTestimonials"
              :key="t.id"
              class="row-click"
              @click="openDetails(t)"
            >
              <td class="text-cap cell-name">
                {{ t.name }}

                <!-- 👇 Affiché UNIQUEMENT sur mobile ; caché sur desktop -->
                <div class="mobile-extra">
                  <div class="m-title" v-if="t.title">{{ t.title }}</div>
                  <div class="m-content">{{ t.content }}</div>
                </div>
              </td>

              <td>{{ t.rating }}/5</td>

              <!-- Titre wrap -->
              <td class="td-title wrap">{{ t.title || '—' }}</td>

              <!-- Contenu : clamp 3 lignes + ellipsis -->
              <td class="td-content">
                <div class="line-clamp clamp-3" :title="t.content">
                  {{ t.content }}
                </div>
              </td>

              <td>
                <span :class="['status-badge', 'status-' + (t.status || 'pending')]">
                  {{ statusLabel(t.status) }}
                </span>
              </td>

              <td>{{ formatDate(t.created_at) }}</td>

              <td class="text-center actions">
                <button
                  class="icon-btn icon-btn--approve"
                  @click.stop="askStatusChange(t,'approved')"
                  title="Valider"
                 >

                  <i class="fa-solid fa-check"></i>
                </button>
                <button
                  class="icon-btn icon-btn--reject"
                  @click.stop="askStatusChange(t,'rejected')"
                  title="Rejeter"
                 >
                  <i class="fa-solid fa-xmark"></i>
                </button>
                <button
                  class="icon-btn icon-btn--delete"
                  @click.stop="askStatusChange(t, 'delete')"
                  title="Supprimer"
                 >
                  <i class="fa-solid fa-trash-alt"></i>
                </button>

              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr><td colspan="7" class="empty">Aucun résultat</td></tr>
          </tbody>
        </table>

        <!-- Modal Détails -->
        <div v-if="modalOpen" class="modal-backdrop" @click="closeModal">
          <div class="modal" @click.stop>
            <button class="modal-close" @click="closeModal" aria-label="Fermer">×</button>

            <div class="modal-header">
              <div class="avatar-wrapper">
                <template v-if="selected?.avatar_url || selected?.user?.photo">
                  <img class="avatar" :src="selected?.avatar_url || selected?.user?.photo" alt="avatar" />
                </template>
                <template v-else>
                  <div class="avatar-fallback">
                    {{ initials(selected?.user?.prenom || selected?.name, selected?.user?.nom) }}
                  </div>
                </template>
              </div>

              <div>
                <h3 class="modal-title">
                  {{ selected?.name || (selected?.user ? (selected.user.prenom+' '+selected.user.nom) : '—') }}
                </h3>
                <div class="muted">
                  {{ selected?.location || [selected?.user?.ville, selected?.user?.pays].filter(Boolean).join(', ') }}
                </div>
              </div>

              <span class="status-badge" :class="'status-' + (selected?.status || 'pending')">
                {{ statusLabel(selected?.status) }}
              </span>
            </div>

            <div class="modal-body">
              <div class="grid">
                <div>
                  <div class="label">Note</div>
                  <div class="value">
                    <template v-if="Number(selected?.rating) > 0">
                      <span
                        v-for="i in 5"
                        :key="i"
                        class="star"
                        :class="{ on: i <= Number(selected.rating) }"
                      >★</span>
                      <span class="note-num">{{ Number(selected.rating) }}/5</span>
                    </template>
                    <span v-else>—</span>
                  </div>
                </div>
                <div>
                  <div class="label">Date</div>
                  <div class="value">{{ formatDate(selected?.created_at) }}</div>
                </div>
                <div>
                  <div class="label">Email</div>
                  <div class="value">{{ selected?.user?.email || '—' }}</div>
                </div>
                <div>
                  <div class="label">Téléphone</div>
                  <div class="value">{{ selected?.user?.tel || '—' }}</div>
                </div>
              </div>

              <div class="block">
                <div class="label">Titre</div>
                <div class="value">{{ selected?.title || '—' }}</div>
              </div>

              <div class="block">
                <div class="label">Contenu</div>
                <div class="value prewrap">{{ selected?.content }}</div>
              </div>

              <!-- Photos -->
              <div v-if="photos.length">
                <div class="photos-label">Photos</div>

                <div class="photos-grid">
                  <img
                    v-for="(photo, index) in photos"
                    :key="index"
                    class="testimonial-photo"
                    :src="buildPhotoUrl(photo)"
                    alt="Photo du voyage"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <!-- 🟥 Actions Admin placées à gauche -->
              <button class="btn btn-success" @click="askStatusChange(selected,'approved')">Valider</button>
              <button class="btn btn-warn"    @click="askStatusChange(selected,'rejected')">Rejeter</button>
              <button class="btn btn-danger" @click="askStatusChange(selected,'delete')">Supprimer</button>

              <div class="spacer"></div>

              <!-- 🟦 Bouton fermer complètement à droite -->
              <button class="btn btn-light" @click="closeModal">Fermer</button>
            </div>

          </div>
        </div>
      </div>
      <!-- 🔁 Pagination simple comme les Hôtels -->
      <div class="pagination-simple" v-if="filteredTestimonials.length">
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


      <ConfirmPopup
        v-model="confirmOpen"
        :mode="confirmConfig.mode"
        :title="confirmConfig.title"
        :message="confirmConfig.message"
        :ok-text="confirmConfig.okText"
        cancel-text="Annuler"
        @confirm="confirmStatusChange"
      />

      <AlertPopup
        v-model="showAlert"
        :variant="alertData.variant"
        :title="alertData.title"
        :message="alertData.message"
        :primary-text="alertData.primaryText"
      />


    </div>

    <div v-else>Chargement…</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/services/api'
import ConfirmPopup from '@/components/popups/ConfirmPopup.vue' // ✅ AJOUT
import AlertPopup from '@/components/popups/AlertPopup.vue'


const confirmOpen   = ref(false)
const confirmConfig = ref({
  mode: 'delete',
  title: '',
  message: '',
  okText: ''
})
const pendingItem   = ref(null)
const pendingStatus = ref(null)

function askStatusChange (t, action) {
  if (!t) return

  pendingItem.value = t
  pendingStatus.value = action   // 'approved' | 'rejected' | 'delete'

  let mode, verb
  if (action === 'approved') {
    mode = 'approve'
    verb = 'valider'
  } else if (action === 'rejected') {
    mode = 'reject'
    verb = 'rejeter'
  } else {
    mode = 'delete'
    verb = 'supprimer'
  }

  confirmConfig.value = {
    mode,
    
    message: `Voulez-vous vraiment ${verb} ce témoignage ?`,
    okText: `Oui, ${verb}`,
  }

  confirmOpen.value = true
}

// Popup de succès
const showAlert = ref(false)
const alertData = ref({
  variant: 'success',
  title: 'Succès',
  message: '',
  primaryText: 'OK',
})

function openSuccess (msg) {
  alertData.value = {
    variant: 'success',
    title: 'Succès',
    message: msg || 'Action réalisée avec succès.',
    primaryText: 'OK',
  }
  showAlert.value = true
}


async function confirmStatusChange () {
  if (!pendingItem.value || !pendingStatus.value) return

  if (pendingStatus.value === 'delete') {
    await remove(pendingItem.value.id)
  } else {
    await setStatus(pendingItem.value, pendingStatus.value)
  }

  pendingItem.value   = null
  pendingStatus.value = null
}






/* ==== Utils ==== */
const initials = (prenom, nom = '') => {
  if (!prenom && !nom) return '??'
  const p = prenom?.trim().charAt(0).toUpperCase() || ''
  const n = nom?.trim().charAt(0).toUpperCase() || ''
  return p + n
}
const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—')

const statusLabel = (s) => {
  switch (s) {
    case 'approved': return 'Validé'
    case 'rejected': return 'Rejeté'
    case 'pending':
    default:         return 'En attente'
  }
}

// normalisation pour la recherche
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/* ==== State ==== */
const list      = ref([])        // liste brute (tous les témoignages)
const loading   = ref(false)
const modalOpen = ref(false)
const selected  = ref(null)

const filters = ref({
  status: '',
  q: '',
})

/* ===== Chargement initial (tout, comme hôtels) ===== */
const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/testimonials', {
      params: { per_page: 500 }, // on récupère large
    })

    list.value = Array.isArray(data) ? data : (data.data || [])
  } finally {
    loading.value = false
  }
}
onMounted(load)

/* ===== Filtre en front ===== */
const filteredTestimonials = computed(() => {
  const term   = norm(filters.value.q)
  const status = filters.value.status

  return list.value.filter((t) => {
    if (status && t.status !== status) return false

    if (!term) return true

    const ratingStr = t.rating != null ? String(t.rating) : ''

    const haystack = norm(`
      ${t.name || ''}
      ${t.title || ''}
      ${t.content || ''}
      ${ratingStr}
      ${ratingStr ? ratingStr + '/5' : ''}
      ${t.status || ''}
      ${statusLabel(t.status)}
      ${t.created_at || ''}
      ${formatDate(t.created_at)}
    `)

    return haystack.includes(term)
  })
})

/* ===== Pagination FRONT comme hôtels ===== */
const pageSize    = 10
const currentPage = ref(1)

const totalPages = computed(() => {
  const total = filteredTestimonials.value.length
  return total > 0 ? Math.ceil(total / pageSize) : 1
})

const paginatedTestimonials = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end   = start + pageSize
  return filteredTestimonials.value.slice(start, end)
})

function goPrevPage () {
  if (currentPage.value > 1) currentPage.value--
}
function goNextPage () {
  if (currentPage.value < totalPages.value) currentPage.value++
}

/* Quand filtre texte/statut change → retour page 1 */
const onSearchInput = () => {
  currentPage.value = 1
}
const onStatusChange = () => {
  currentPage.value = 1
}

/* Si la liste filtrée rapetisse (suppression) → ajuster la page */
watch(filteredTestimonials, (newList) => {
  const maxPage = Math.max(1, Math.ceil(newList.length / pageSize))
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

/* ==== Modal ==== */
const openDetails = async (t) => {
  selected.value = t
  modalOpen.value = true

  try {
    const { data } = await api.get(`/admin/testimonials/${t.id}`)
    Object.assign(selected.value, data)
    console.log('selected from API =', selected.value)
  } catch (e) {
    console.error('adminShow failed', e)
  }
}
const closeModal = () => { modalOpen.value = false }

/* ==== Actions ==== */
const setStatus = async (t, status) => {
  if (!t || t.status === status) return
  try {
    await api.put(`/admin/testimonials/${t.id}`, { status })

    // MAJ dans list
    const idx = list.value.findIndex(x => x.id === t.id)
    if (idx !== -1) list.value[idx].status = status

    // MAJ de la modale
    if (selected.value && selected.value.id === t.id) {
      selected.value.status = status
    }

    // ✅ Popup succès selon l'action
    if (status === 'approved') {
      openSuccess('Le témoignage a été validé avec succès.')
    } else if (status === 'rejected') {
      openSuccess('Le témoignage a été rejeté avec succès.')
    } else {
      openSuccess('Le statut du témoignage a été mis à jour.')
    }

  } catch (e) {
    console.error(e)
  }
}


const remove = async (id) => {
  try {
    await api.delete(`/admin/testimonials/${id}`)
    list.value = list.value.filter((x) => x.id !== id)

    if (selected.value?.id === id) {
      closeModal()
    }

    // ✅ Popup succès suppression
    openSuccess('Le témoignage a été supprimé avec succès.')
  } catch (e) {
    console.error(e)
  }
}



// 🔗 Base URL de ton API (à adapter si besoin)
const API_BASE = 'http://localhost:8000'

function buildPhotoUrl (photo) {
  if (!photo) return ''

  if (photo.startsWith('http')) return photo
  if (photo.startsWith('/'))    return API_BASE + photo

  return `${API_BASE}/${photo}`
}

/* ✅ Normaliser selected.photos (string JSON ou tableau) */
const photos = computed(() => {
  const raw = selected.value?.photos || selected.value?.images
  if (!raw) return []

  if (Array.isArray(raw)) return raw

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.warn('Impossible de parser selected.photos =', raw)
      return []
    }
  }

  return []
})


</script>

<style scoped>
/* --- Select --- */
.select-wrap select {
  height: 36px;
  border: 1px solid #e7e5eb;
  border-radius: 10px;
  padding: 0 10px;
  background: #fff;
}

/* --- Recherche --- */
.search { position: relative; width: 250px; }
.search-icon {
  position: absolute; left: 10px; top: 50%;
  transform: translateY(-50%); opacity: .6;
}
.search-input {
  width: 100%; height: 36px; border: 1px solid #e5e7eb;
  border-radius: 18px; padding: 0 14px 0 32px; outline: none;
}

/* --- Boutons --- */
.btn {
  height: 34px; padding: 0 12px; border-radius: 10px;
  border: 1px solid #e5e7eb; background: #fff; cursor: pointer;
}
.btn[disabled] { opacity: .5; cursor: not-allowed; }

/* --- Table --- */
.table-wrap { width: 100%; background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,.05); border: 1px solid #e5e7eb; }
.nice-table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
.nice-table thead th {
  background: #e6edff; color: #1e3a8a; font-weight: 700; padding: 10px 12px;
  border-top: 1px solid #dfe7ff; border-bottom: 1px solid #e5e7eb; text-align: center;
}
.nice-table tbody td {
  padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;
  word-break: break-word; text-align: center;
}
.nice-table tbody tr:hover { background: #f3f4f6; }

.text-center { text-align: center; }
.text-cap { text-transform: capitalize; }

/* Titre = wrap complet */
.td-title.wrap {
  white-space: normal; word-break: break-word; overflow-wrap: anywhere;
}

/* Contenu : 3 lignes + ellipsis */
.td-content {
  white-space: normal; word-break: break-word; overflow-wrap: anywhere;
  font-size: 14px; line-height: 1.55; color: #1f2937;
}
.clamp-3{
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
@supports not (-webkit-line-clamp: 3) {
  .clamp-3{
    max-height: calc(1.55em * 3);
    position: relative;
  }
  .clamp-3::after{
    content: "…";
    position: absolute; right: 0; bottom: 0; padding-left: .25rem;
    background: linear-gradient(90deg, transparent 0%, #fff 40%);
  }
}

/* Actions */
.actions { white-space: nowrap; }
.icon-btn { height: 32px; width: 25px;  background: #fff;
   margin: 0 2px; cursor: pointer; }
.icon-btn--approve i { font-size: 20px; color: #16a34a; transition: all .2s; }
.icon-btn--approve:hover i { color: #15803d; transform: scale(1.2); }
.icon-btn--reject i { font-size: 20px; color: #f59e0b; transition: all .2s; }
.icon-btn--reject:hover i { color: #d97706; transform: scale(1.2); }
.icon-btn--delete i { font-size: 20px; color: #888; transition: all .2s; }
.icon-btn--delete:hover i { color: #dc2626; transform: scale(1.2); }

/* Statut */
.status-badge {
  display:inline-block; padding:4px 10px; border-radius:999px; font-size:12px;
  text-transform: capitalize;
}
.status-approved { background:#dcfce7; color:#15803d; }
.status-rejected { background:#fef3c7; color:#d97706; }
.status-pending  { background:#f1f5f9; color:#334155; }

/* Lignes cliquables */
.row-click { cursor: pointer; }
.row-click:hover { background: #fafcff; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000; background: rgba(15,23,42,.45);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  width: min(820px, 92vw); background: #fff; color:#0f172a;
  border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.25);
  animation: pop .12s ease-out;
}
@keyframes pop { from { transform: scale(.98); opacity:.5 } }

.modal-close { position: absolute; right: 10px; top: 8px; font-size: 22px; border:0; background:transparent; cursor:pointer; }
.modal-header { display: grid; grid-template-columns: 48px 1fr auto; gap: 12px; align-items: center; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
.modal-title { margin:0; font-size:18px; font-weight:700; color:#111827; }
.muted { color:#6b7280; font-size:13px; }
.modal-body { padding: 14px 16px; }
.grid { display:grid; grid-template-columns: repeat(2,1fr); gap:10px 16px; margin-bottom:12px; }
.label { font-size:12px; color:#64748b; margin-bottom:4px; }
.value { font-size:14px; color:#111827; }
.prewrap { white-space: pre-wrap; }
.modal-footer { display:flex; align-items:center; gap:8px; padding: 12px 16px; border-top:1px solid #e5e7eb; }
.spacer { flex:1; }

.btn-light { background:#f8fafc; }
.btn-success { background:#dcfce7; color:#15803d; border-color:#bbf7d0; }
.btn-warn    { background:#fef3c7; color:#d97706; border-color:#fde68a; }
.btn-danger  { background:#fee2e2; color:#dc2626; border-color:#fecaca; }

/* Avatar */
.avatar-wrapper { display:flex; align-items:center; justify-content:center; width: 60px; height: 60px; border-radius: 50%; overflow: hidden; margin-right: 10px; }
.avatar { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { width: 100%; height: 100%; background-color:#008080; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:20px; border-radius:50%; text-transform:uppercase; }

/* Toolbar à droite */
.right { display:flex; flex-direction: column; align-items:flex-end; gap:8px; }

.star { font-size: 16px; color: #e5e7eb; margin-right: 2px; } 
.star.on { color: #f59e0b; } 
.note-num { margin-left: 6px; font-weight: 600; color: #334155; font-size: 13px; }

/* Pagination comme hôtels */
.pagination-simple {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 12px;
  font-size: 14px;
}
.pager-link {
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  color: #2563eb;
  text-decoration: underline;
}
.pager-link[disabled] {
  opacity: .5;
  cursor: not-allowed;
  text-decoration: none;
}
.pager-info {
  color: #6b7280;
}

/* ======= MODE COMPACT MOBILE (≤ 768px) ======= */
@media (max-width: 768px) {
  .clients-header {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .right { align-items: stretch; gap: 10px; }
  .search { width: 100%; }
  .select-wrap select { width: 100%; }

  .table-wrap { overflow-x: hidden; }
  .nice-table { table-layout: fixed; width: 100%; }

  .nice-table thead th,
  .nice-table tbody td {
    padding: 8px 10px;
    font-size: 14px;
  }

  /* cacher colonnes: 3=Titre, 4=Contenu, 6=Date */
  .nice-table thead th:nth-child(3),
  .nice-table thead th:nth-child(4),
  .nice-table thead th:nth-child(6),
  .nice-table tbody td:nth-child(3),
  .nice-table tbody td:nth-child(4),
  .nice-table tbody td:nth-child(6) {
    display: none;
  }

  .nice-table thead th:nth-child(1) { width: 46%; text-align: left; }
  .nice-table thead th:nth-child(2) { width: 18%; }
  .nice-table thead th:nth-child(5) { width: 18%; }
  .nice-table thead th:nth-child(7) { width: 18%; }

  .nice-table tbody td:nth-child(1) { text-align: left; }
  .nice-table tbody td:nth-child(2),
  .nice-table tbody td:nth-child(5) { text-align: center; }

  .nice-table tbody td:nth-child(7) {
    text-align: right;
    white-space: nowrap;
  }
  .icon-btn {
    width: 36px; height: 36px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    display: inline-flex; align-items: center; justify-content: center;
    margin-left: 6px;
  }

  .status-badge { font-size: 12px; padding: 4px 8px; }

  .pagination-simple {
    justify-content: space-between;
    padding: 10px 6px;
  }

  .modal-backdrop { padding: 0; }
  .modal {
    width: 100vw; height: 100vh; border-radius: 0;
    display: flex; flex-direction: column;
  }
  .modal-header { position: sticky; top: 0; background: #fff; z-index: 1; }
  .modal-body { flex: 1; overflow: auto; }
  .grid { grid-template-columns: 1fr; }
}

/* Par défaut (desktop) : rien n'apparaît */
.mobile-extra { display: none; }

.photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.testimonial-photo {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}















/* ===== Popup de confirmation de STATUT ===== */
.status-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.status-dialog {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px 22px;
  width: min(420px, 90vw);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.status-dialog-icon {
  font-size: 32px;
  color: #0ea5e9; /* bleu info */
  margin-bottom: 8px;
}

.status-dialog-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.status-dialog-text {
  margin: 0 0 16px;
  color: #4b5563;
  font-size: 14px;
}

.status-dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0284c7;
  border-color: #0284c7;
}

</style>

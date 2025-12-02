<template>
  <main class="content posts-container">
    <h2 class="page-title">
      <i class="fa fa-newspaper"></i>
      Articles du blog
    </h2>

    <div class="card table-card" v-if="!loading">
      <!-- Header -->
      <div class="posts-header">
        <h3>Liste des articles</h3>

        <div class="header-right">
          <button class="btn-add-post" @click="goCreate">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Ajouter un article</span>
          </button>
        </div>
      </div>

      <!-- Barre de recherche (uniquement front) -->
      <div class="searchbar-row">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="filters.q"
            type="search"
            placeholder="Rechercher (titre, extrait)…"
            aria-label="Rechercher un article"
            class="search-modern-input"
          />
        </div>
      </div>

      <!-- Filtres (uniquement front) -->
      <div class="filters-line">
        <select v-model="filters.category" class="flt">
          <option value="">Toutes catégories</option>
          <option value="omra">Omra</option>
          <option value="economique">Omra économique</option>
          <option value="confort">Omra confort</option>
          <option value="ramadan">Omra Ramadan</option>
        </select>

        <select v-model="filters.status" class="flt">
          <option value="">Tous statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>

        <button
          v-if="filters.q || filters.category || filters.status"
          class="btn ghost small"
          @click="resetFilters"
        >
          Réinitialiser
        </button>
      </div>

      <!-- Tableau -->
      <div class="table-wrapper">
        <table class="posts-table">
          <thead>
            <tr>
              <th style="text-align:center;">Titre</th>
              <th style="text-align:center;">Catégorie</th>
              <th style="text-align:center;">Statut</th>
              <th style="text-align:center;">Créé le</th>
              <th style="text-align:center;">Publié</th>
              <th style="text-align:center;" class="actions-header">Actions</th>
            </tr>
          </thead>

          <tbody v-if="pagedItems.length">
            <tr v-for="p in pagedItems" :key="p.id">
              <td data-label="Titre" style="text-align:left;">
                <strong>{{ p.title }}</strong>
                <div class="muted">{{ p.excerpt }}</div>
              </td>

              <td data-label="Catégorie" style="text-align:center;">
                <span :class="['badge','cat', catClass(p.category)]">
                  {{ labelCat(p.category) }}
                </span>
              </td>

              <td data-label="Statut" style="text-align:center;">
                <span class="pill" :class="p.status === 'published' ? 'published' : 'draft'">
                  {{ p.status === 'published' ? 'Publié' : 'Brouillon' }}
                </span>
              </td>

              <!-- Créé le -->
              <td data-label="Créé le" style="text-align:center;">
                {{ formatDate(p.created_at) }}
              </td>

              <!-- Publié le -->
              <td data-label="Publié" style="text-align:center;">
                {{ formatDate(p.published_at) }}
              </td>

              <td class="actions-cell">
                <div class="actions-inline">
                  <!-- Éditer -->
                  <button class="icon-btn" @click="goEdit(p.id)" title="Modifier" aria-label="Modifier">
                    <i class="fas fa-edit"></i>
                  </button>

                  <!-- Publier / Dépublier -->
                  <button class="icon-btn" @click="togglePublish(p)"
                          :title="p.status==='published' ? 'Dépublier' : 'Publier'"
                          aria-label="Publier / Dépublier">
                    <i v-if="p.status==='published'" class="fas fa-toggle-on"></i>
                    <i v-else class="fas fa-toggle-off"></i>
                  </button>

                  <!-- Supprimer -->
                  <button class="icon-btn icon-btn--delete" @click="remove(p.id)"
                          title="Supprimer" aria-label="Supprimer">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr><td colspan="6" class="empty">Aucun résultat</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination 100% front -->
      <!-- Pagination simple (comme Omras) -->
      <div class="pagination-simple">
        <button
          type="button"
          class="pager-link"
          @click="page > 1 && page--"
          :disabled="page === 1"
        >
          Préc.
        </button>

        <span class="pager-info">
          Page {{ page }} / {{ pageCount }}
        </span>

        <button
          type="button"
          class="pager-link"
          @click="page < pageCount && page++"
          :disabled="page === pageCount"
        >
          Suiv.
        </button>
      </div>
    </div>

    <div v-else class="muted">Chargement…</div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route  = useRoute()

const goCreate = () => router.push('/admin/blog/posts/create')
const goEdit   = (id) => router.push(`/admin/blog/posts/${id}/edit`)

/* =======================
   STATE
   ======================= */
const allItems = ref([])      // tous les articles chargés une seule fois
const loading  = ref(false)
const acting   = ref(false)

const filters = ref({
  q: '',
  category: '',
  status: ''
})

const page    = ref(1)
const perPage = ref(10)

/* =======================
   HELPERS
   ======================= */
const labelCat = c => ({
  omra:       'Omra',
  economique: 'Omra économique',
  confort:    'Omra confort',
  ramadan:    'Omra Ramadan'
}[c] || c)

const formatDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/* =======================
   SYNC AVEC L’URL
   ======================= */
const syncFiltersFromRoute = () => {
  const q = route.query
  filters.value.category = String(q.category || '')
  filters.value.status   = String(q.status   || '')
  filters.value.q        = String(q.q       || '')
  page.value             = Number(q.page    || 1)
}

// au montage on lit l’URL
syncFiltersFromRoute()

// si l’URL change (clic dans la sidebar) → MAJ filtres
watch(
  () => route.query,
  () => {
    syncFiltersFromRoute()
  },
  { deep: true }
)

/* =======================
   LOAD (UNE SEULE FOIS)
   ======================= */
const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/posts')
    // si Laravel renvoie une pagination : { data: [...], current_page... }
    allItems.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
load()

/* =======================
   FILTRAGE FRONT
   ======================= */
const filteredItems = computed(() => {
  const q   = norm(filters.value.q)
  const cat = filters.value.category
  const st  = filters.value.status

  return allItems.value.filter(p => {
    if (cat && p.category !== cat) return false
    if (st  && p.status   !== st)  return false

    if (!q) return true

    const text = norm([
      p.title,
      p.excerpt,
      labelCat(p.category),
      p.status,
      formatDate(p.created_at),
      formatDate(p.published_at)
    ].join(' '))

    return text.includes(q)
  })
})

/* Reset page à 1 quand on change les filtres (depuis le formulaire) */
watch(
  filters,
  () => {
    page.value = 1
  },
  { deep: true }
)

/* Pagination front */
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / perPage.value || 1))
)

const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredItems.value.slice(start, start + perPage.value)
})

const resetFilters = () => {
  filters.value = { q: '', category: '', status: '' }
  page.value = 1
}

/* =======================
   ACTIONS
   ======================= */
const togglePublish = async (p) => {
  if (acting.value) return
  acting.value = true
  try {
    const next = p.status === 'published' ? 'draft' : 'published'
    await api.put(`/admin/posts/${p.id}/publish`, { status: next })
    p.status = next
    p.published_at = next === 'published' ? new Date().toISOString() : null
  } catch (e) {
    console.error(e)
  } finally {
    acting.value = false
  }
}

const remove = async (id) => {
  if (!confirm('Supprimer cet article ?')) return
  if (acting.value) return
  acting.value = true
  try {
    await api.delete(`/admin/posts/${id}`)
    allItems.value = allItems.value.filter(x => x.id !== id)
  } catch (e) {
    console.error(e)
  } finally {
    acting.value = false
  }
}

/* =======================
   Catégories (couleurs)
   ======================= */
const catClass = (c) => {
  const n = norm(c)

  if (n === 'economique' || n === 'omra economique' || n === 'omra eco') {
    return 'cat--economique'
  }
  if (n === 'confort' || n === 'omra confort') {
    return 'cat--confort'
  }
  if (n === 'ramadan' || n === 'omra ramadan') {
    return 'cat--ramadan'
  }
  return 'cat--omra'
}
</script>


<style scoped>
/* ===== Container + card (comme Omras) ===== */
.posts-container { padding: 20px; background: #f9fafb; min-height: 100vh; box-sizing: border-box; overflow-x: hidden; }
.card.table-card { background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 100%; }

/* Header */
.posts-header { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom: 8px; }
.header-right { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.btn-add-post { display:inline-flex; align-items:center; gap:8px; background:#0d99e6; color:#fff; border-radius:999px; padding:8px 14px; font-weight:600; border:none; cursor:pointer; }
.btn-add-post:hover { background:#1d4ed8; transform: translateY(-1px); }

/* Barre de recherche */
.searchbar-row { display:flex; justify-content:flex-end; margin:8px 0 10px; }
.search-wrapper { width:320px; position:relative; }
.search-icon { position:absolute; top:50%; left:12px; transform:translateY(-50%); color:#9ca3af; font-size:14px; }
.search-modern-input { width:100%; padding:8px 12px 8px 35px; border-radius:20px; border:1px solid #e5e7eb; background:#f9fafb; outline:none; transition:all .3s ease; }
.search-modern-input:focus { background:#fff; border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15); }

/* Filtres */
.filters-line { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
.flt { padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; }
.btn.ghost.small { padding:8px 12px; border-radius:8px; }

/* Table */
.table-wrapper { width:100%; overflow-x:auto; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; box-shadow:0 4px 6px rgba(0,0,0,0.05); }
.posts-table { width:100%; border-collapse:separate !important; border-spacing:0; table-layout: fixed; min-width: 600px; }
.posts-table th { background:#e0e7ff; color:#1e3a8a; text-align:left; padding:10px; white-space:nowrap; border-bottom:1px solid #dbe3ff; }
.posts-table td { padding:10px; border-bottom:1px solid #eef2f7; white-space:nowrap; }

/* Autoriser le retour à la ligne dans la colonne Titre */
.posts-table td[data-label="Titre"] {
  white-space: normal !important;
}

/* séparateurs verticaux */
.posts-table th:not(:last-child), .posts-table td:not(:last-child) { border-right:1px solid #e5e7eb; }

/* Hover doux */
.posts-table tbody tr { transition: background-color .2s ease; }
.posts-table tbody tr:hover td { background:#f3f4f6; }

/* Badges statut */
.pill { display:inline-flex; align-items:center; height:26px; padding:0 10px; border-radius:999px; font-weight:700; }
.pill.published { background:#e7f6ec; color:#128a3b; border:1px solid #bfe4c9; }
.pill.draft     { background:#fdeceb; color:#aa2e25; border:1px solid #f7c3bd; }

/* Actions (icônes comme Omras) */
.actions-header, .actions-cell { text-align:center; }
.actions-inline { display:flex; gap:8px; justify-content:center; }
.icon-btn { display:flex; justify-content:center; align-items:center; width:34px; height:34px; border-radius:50%; background:#fff;  cursor:pointer; transition:.2s; }
.icon-btn:hover { background:#f6f9ff; transform:translateY(-1px); }
.icon-btn--delete i { color:#888; }
.icon-btn--delete:hover i { color:#dc2626; }

.page-title { text-align:center; margin-bottom:20px; color:#1e3a8a; font-weight:700; font-size:2rem; }

/* ===== Pagination en bas de table (style blog) ===== */
.pagination-simple {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-simple .pager-info {
  padding: 2px 6px;
}

.pagination-simple .pager-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #2563eb;
  text-decoration: underline;
  font-size: 0.9rem;
}

.pagination-simple .pager-link:disabled {
  cursor: default;
  color: #9ca3af;
  text-decoration: none;
}

/* Responsive (mêmes règles que Omras) */
@media (max-width: 992px) {
  .posts-container { padding: 15px; }
  .page-title { font-size: 1.4rem; margin-bottom: 15px; }
  .search-wrapper { width: 100%; }
}
@media (max-width: 640px) {
  .table-wrapper { border:0; box-shadow:none; }
  .posts-table, .posts-table thead, .posts-table tbody, .posts-table tr, .posts-table th, .posts-table td { display:block; width:100%; }
  .posts-table thead { position:absolute; left:-9999px; top:-9999px; }
  .posts-table tbody tr { border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,.05); margin:12px 0; background:#fff; }
  .posts-table td { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; border:0; border-bottom:1px solid #eef2f7; white-space:normal; text-align:left !important; }
  .posts-table td:last-child { border-bottom:0; }
  .posts-table td::before { content: attr(data-label); font-weight:600; color:#475569; margin-right:12px; flex:0 0 auto; }
  .actions-cell { justify-content:flex-end; }
  .icon-btn { width:36px; height:36px; }
  .posts-table { min-width: 0; }
}

/* base badge */
.badge.cat{
  display:inline-flex; align-items:center; height:26px;
  padding:0 10px; border-radius:999px; font-size:.85rem; font-weight:700;
  border:1px solid transparent; line-height:1; white-space:nowrap;
}

/* mêmes couleurs que page Omras */
.cat--economique{ color:#0a7a7a; background:#e8f8ee; border-color:#cde9df; }
.cat--confort   { color:#0b5cab; background:#eef6ff; border-color:#cfe3ff; }
.cat--ramadan   { color:#b15e00; background:#fff4e5; border-color:#ffd9a6; }
/* “Omra” générique : bleu doux neutre */
.cat--omra      { color:#0f2b63; background:#eef6ff; border-color:#cfe0ff; }
</style>

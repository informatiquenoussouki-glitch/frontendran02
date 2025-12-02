<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

/* ------------ Helpers assets ------------ */
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const toUrl = (p) => {
  if (!p) return '/placeholder-omra.jpg'
  if (/^https?:\/\//i.test(p)) return p
  return `${API_BASE}/storage/${p}`
}

/* ------------ State ------------ */
const loading = ref(false)
const error   = ref('')
const omras   = ref([])

// filtre mois ('' = tous)
const selectedMonth = ref('')

/* ------------ Helpers d'affichage ------------ */
const fmtDM = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/* ------------ Mois ------------ */
const monthNames = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
]

const extractMonth = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d)) return null
  return d.getMonth() + 1
}

const monthLabel = (m) => monthNames[m - 1] || '—'

/* ------------ Filtrage publié ------------ */
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')

const onlyPublished = computed(() =>
  omras.value.filter(o => norm(o.status) === 'publier')
)

/* 👉 Mois disponibles parmi les Omra publiées */
const monthOptions = computed(() => {
  const set = new Set()
  for (const o of onlyPublished.value) {
    const m = extractMonth(o.date_start)
    if (m) set.add(m)
  }
  return Array.from(set)
    .sort((a,b) => a - b)
    .map(m => ({
      value: String(m),
      label: monthLabel(m)
    }))
})

/* 👉 Liste affichée, filtrée par mois */
const filteredOmras = computed(() => {
  const base = onlyPublished.value
  if (!selectedMonth.value) return base
  const target = Number(selectedMonth.value)
  return base.filter(o => extractMonth(o.date_start) === target)
})

/* ------------ Load data ------------ */
onMounted(async () => {
  try {
    loading.value = true
    const { data } = await api.get('/omras', {
      params: { status: 'Publier' }
    })
    const list = Array.isArray(data) ? data : (data?.data || [])
    omras.value = list
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      'Erreur de chargement'
  } finally {
    loading.value = false
  }
})

const euroShort = (v) => {
  if (v == null) return '—'
  const n = Math.floor(Number(v))
  return `€${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`
}
</script>


<template>
  <TopBar :active="2" />

  <main class="wrap">
    <h1 class="page-title">Toutes nos formules Omra</h1>

    <!-- 🔹 Barre de filtres mois -->
    <div class="month-filter" v-if="monthOptions.length">
      <button
        class="month-chip"
        :class="{ active: selectedMonth === '' }"
        @click="selectedMonth = ''"
      >
        Tous les mois
      </button>

      <button
        v-for="m in monthOptions"
        :key="m.value"
        class="month-chip"
        :class="{ active: selectedMonth === m.value }"
        @click="selectedMonth = m.value"
      >
        {{ m.label }}
      </button>
    </div>

    <p class="muted">
      Découvrez toutes les formules disponibles — économiques,
      confort, Ramadan, etc.
    </p>

    <p v-if="loading" class="muted">Chargement…</p>

    <p v-else-if="!onlyPublished.length" class="muted">
      Aucune formule disponible.
    </p>

    <p v-else-if="!filteredOmras.length" class="muted">
      Aucune formule pour ce mois.
    </p>

    <div v-else class="grid">
      <router-link
        v-for="o in filteredOmras"
        :key="o.id"
        class="card"
        :to="{ name:'omra-detail', params:{ id: String(o.id) } }"
        aria-label="Voir la formule"
      >
        <!-- Image de couverture -->
        <div
          class="cover"
          :style="{ backgroundImage: `url(${toUrl(o.image_path)})` }"
        ></div>

        <div class="body">
          <h4 class="title">{{ o.title }}</h4>

          <div class="dates" v-if="o.date_start || o.date_end">
            Du {{ fmtDM(o.date_start) }} au {{ fmtDM(o.date_end) }}
          </div>

          <div class="type">
            Type :
            <strong>{{ o.type || '—' }}</strong>
          </div>
        </div>

        <div class="bottom">
          <div class="price">
            à partir de
            <strong>{{ euroShort(o.price_from) }}</strong>
          </div>
          <span class="btn">PRÉ-RÉSERVEZ</span>
        </div>
      </router-link>
    </div>

    <p v-if="error" class="err">{{ error }}</p>
  </main>

</template>

<style scoped>
.wrap {
  max-width: 1200px;
  margin: 50px auto;
  padding: 0 16px;
  color: #0f172a;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #c69d11;
  margin-bottom: 20px;
}

.muted {
  color: #667085;
  margin-bottom: 50px;
  margin-top: 50px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 14px;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #e9edf2;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
}

.cover {
  aspect-ratio: 16 / 10;
  background: #e5e7eb center / cover no-repeat;
}

.body {
  padding: 16px;
  display: grid;
  gap: 6px;
}

.title {
  margin: 0;
  font-size: 1.06rem;
  font-weight: 800;
  color: black;
}

.dates,
.type {
  color: #6b7280;
  font-size: 0.92rem;
}

.type strong {
  color: black;
  font-size: 0.92rem;
}

.bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 16px 16px;
}

.price {
  color: #6b7280;
  font-size: 0.92rem;
}

.price strong {
  color: #008080;
  font-size: 1.06rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  color: #fff;
  background: #c59d43;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(197, 157, 67, 0.3);
}

.card:hover .btn {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(197, 157, 67, 0.4);
  background: linear-gradient(90deg, #d4ae54, #f8e3a3);
}

.err {
  color: #e11d48;
}

.month-filter {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.month-chip {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 5px rgba(197, 157, 67, 0.4);
  border-color: #c59d43;
}

.month-chip.active {
  transform: translateY(-2px);
  box-shadow: 0 3px 3px rgba(197, 157, 67, 0.4);
  background: #c59d43;
  color: #fff;
  font-weight: 600;
  border-color: #c59d43;
}
</style>

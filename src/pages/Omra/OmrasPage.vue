<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const toUrl = p => !p ? '/placeholder-omra.jpg'
  : (/^https?:\/\//i.test(p) ? p : `${API_BASE}/storage/${p}`)

const loading = ref(false)
const error   = ref('')
const omras   = ref([])

const fmtDM = iso => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}
const minPrice = o => {
  const arr = [o.price_single, o.price_double, o.price_triple, o.price_quadruple]
    .map(Number).filter(n => Number.isFinite(n))
  return arr.length ? Math.min(...arr) : null
}
const euroShort = v => v == null ? '—' : `€${Math.round(Number(v)).toLocaleString('fr-FR')}`

onMounted(async () => {
  try {
    loading.value = true
    const { data } = await api.get('/omras') // ✅ Tous les types
    omras.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <TopBar :active="2" /> <!-- onglet Omra global -->

  <main class="wrap">
    <h1 class="page-title">Toutes nos formules Omra</h1>
    <p class="muted">Découvrez toutes les formules disponibles — économiques, confort, Ramadan, etc.</p>

    <p v-if="loading" class="muted">Chargement…</p>
    <p v-else-if="!omras.length" class="muted">Aucune formule disponible.</p>

    <div v-else class="grid">
  <router-link
    v-for="o in omras"
    :key="o.id"
    class="card"
    :to="{ name: 'omra-detail', params: { id: String(o.id) } }"
    aria-label="Voir la formule"
  >
    <div class="cover" :style="{ backgroundImage: `url(${toUrl(o.image_path)})` }"></div>

    <div class="body">
      <h4 class="title">{{ o.title }}</h4>
      <div class="dates" v-if="o.date_start || o.date_end">
        Du {{ fmtDM(o.date_start) }} au {{ fmtDM(o.date_end) }}
      </div>
      <div class="type">
        Type : <strong>{{ o.type || '—' }}</strong>
      </div>
    </div>

    <div class="bottom">
      <div class="price">
        à partir de <strong>{{ euroShort(minPrice(o)) }}</strong>
      </div>

      <!-- ✅ Bouton de réservation cliquable séparément -->
      <router-link
        :to="`/reservations/${o.id}`"
        class="btn-cta"
        @click.stop
      >
        RÉSERVEZ
      </router-link>
    </div>
  </router-link>
</div>


    <p v-if="error" class="err">{{ error }}</p>
  </main>
</template>

<style scoped>
.wrap{ max-width:1200px; margin:16px auto; padding:0 16px; color:#0f172a; }
.page-title{ margin:6px 0 4px; font-size:1.8rem; font-weight:800; }
.muted{ color:#667085; }

.grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:14px; }
@media (max-width:1100px){ .grid{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px){  .grid{ grid-template-columns:1fr; } }

.card{
  position:relative; display:flex; flex-direction:column;
  border:1px solid #e9edf2; border-radius:14px; 
  overflow:hidden; background:#fff;
  box-shadow:0 10px 28px rgba(0,0,0,.08); 
  text-decoration:none; color:inherit;
}
.cover{ aspect-ratio:16/10; background:#e5e7eb center/cover no-repeat; }
.body{ padding:16px; display:grid; gap:6px; }
.title{ margin:0; font-size:1.06rem; font-weight:800; }
.dates,.type{ color:#6b7280; font-size:.92rem; }
.bottom{
  margin-top:auto; display:flex; align-items:center; justify-content:space-between;
  gap:10px; padding:0 16px 16px;
}
.price{ color:#6b7280; font-size:.92rem; }
.price strong{ color:#008080; font-size:1.06rem; }
.btn{
  display:inline-flex; align-items:center; justify-content:center;
  padding:10px 14px; border-radius:999px; background:#f2f4f7; color:#0f172a;
  font-weight:800; border:1px solid #e5e7eb; transition:.15s ease;
}
.card:hover .btn{ border-color:#008080; box-shadow:0 8px 18px rgba(0,128,128,.18); transform:translateY(-1px); }
.err{ color:#e11d48; }
</style>

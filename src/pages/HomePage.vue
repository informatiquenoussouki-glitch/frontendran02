<script setup>
// --- Dépendances & composants -------------------------------------------------
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/ui/TopBar.vue'
//import OmraRowCarousel from '@/components/OmraRowCarousel.vue'
import api from '@/services/api'       // ✅ CORRECT
import heroImg from '@/assets/omra5.webp' // image du hero

// --- Utilitaires globaux ------------------------------------------------------
const router = useRouter()
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const toUrl = (p) => (!p ? null : (/^https?:\/\//i.test(p) ? p : `${API_BASE}/storage/${p}`))

// Format court "dd/mm"
const fmtDM = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—'

// Prix le plus bas d’une omra
const minPrice = (o) => {
  const arr = [o.price_single, o.price_double, o.price_triple, o.price_quadruple]
    .map(Number)
    .filter((n) => Number.isFinite(n))
  return arr.length ? Math.min(...arr) : null
}
const euroShort = (v) => (v == null ? '—' : `€${Math.round(Number(v)).toLocaleString('fr-FR')}`)

// --- État local ---------------------------------------------------------------
const omras = ref([])
const loading = ref(false)
const error = ref('')

// --- Chargement des omras publiées -------------------------------------------
onMounted(async () => {
  try {
    loading.value = true
    const { data } = await api.get('/omras', { params: { status: 'Publier' } })
    omras.value = Array.isArray(data) ? data : data?.data || []
  } catch (e) {
    error.value = e?.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
})

// --- Aide navigation ----------------------------------------------------------
const scrollToMonths = () =>
  document.querySelector('#months')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// --- Regroupement par type + limites d’affichage ------------------------------
const LIMITS = { eco: 6, confort: 6, ramadan: 3 }
const normType = (s) => String(s || '').toLowerCase()

const ecoAll = computed(() =>
  [...omras.value]
    .filter((o) => normType(o.type || o.omra_type) === 'economique')
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
)
const confortAll = computed(() =>
  [...omras.value]
    .filter((o) => normType(o.type || o.omra_type) === 'confort')
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
)
const ramadanAll = computed(() =>
  [...omras.value]
    .filter((o) => normType(o.type || o.omra_type) === 'ramadan')
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
)

// Slices pour la home (quantités limitées)
const eco = computed(() => ecoAll.value.slice(0, LIMITS.eco))
const confort = computed(() => confortAll.value.slice(0, LIMITS.confort))
const ramadan = computed(() => ramadanAll.value.slice(0, LIMITS.ramadan))
</script>

<template>
  <!-- Barre supérieure -->
  <TopBar :active="0" />

  <main class="home">
    <!-- ================== HERO ================== -->
    <section class="hero">
      <div class="hero-left">
        <p class="kicker">Vous voulez partir faire votre Omra ?</p>
        <h1 class="heading">
          <span>Omra et Hajj</span>
          <strong>Votre partenaire privilégié<br />pour accomplir<br />Omra et Hajj</strong>
        </h1>

        <p class="lead">
          L’agence Autre Voyage est officiellement agréée pour l’organisation du Hajj et Omra
          (agrément saoudien&nbsp;: 1068). Nous attestons organiser ces pèlerinages pour les fidèles
          musulmans.
        </p>

        <div class="cta-row">
          <button class="btn btn-primary" @click="scrollToMonths">Explorer nos forfaits Omra</button>
          <button class="btn btn-ghost">Pré-inscription Hajj 2026</button>
        </div>
      </div>

      <div class="hero-right">
        <div class="arch">
          <img :src="heroImg" alt="" />
          <span class="arch-border" />
        </div>
      </div>

      <div class="pattern" aria-hidden="true" />
    </section>

    <!-- ================== BLOCS PAR TYPE ================== -->
    <section id="months" />

    <!-- Éco -->
    <OmraRowCarousel title="Omra Économique" :items="eco" :api-base="API_BASE" />

    <!-- Confort -->
    <OmraRowCarousel title="Omra Confort" :items="confort" :api-base="API_BASE" />

    <!-- Ramadan -->
    <OmraRowCarousel title="Omra Ramadan" :items="ramadan" :api-base="API_BASE" />

    <!-- États de chargement/erreur (facultatif) -->
    <p v-if="loading" class="muted">Chargement…</p>
    <p v-else-if="!loading && error" class="err">{{ error }}</p>
  </main>
</template>

<style scoped>
/* ----------------- Variables de thème ----------------- */
:root{
  --accent:#008080;
  --ink:#0f172a;
  --muted:#667085;
  --line:#e8eaee;
}

/* ----------------- Conteneur principal ---------------- */
.home{
  color:var(--ink);
  max-width:1200px;
  margin:16px auto;
  padding:0 16px;
}

/* ----------------- HERO ------------------------------- */
.hero{
  position:relative;
  display:grid;
  grid-template-columns:1.1fr .9fr;
  gap:26px;
  padding:40px 18px 28px;
  border-radius:14px;
  overflow:hidden;
  background:linear-gradient(180deg,#fff,#fffdf9 60%,#fff);
  margin:2px 0 18px;
}
.pattern{
  position:absolute; inset:0; opacity:.25; pointer-events:none;
  background-image:
   radial-gradient(circle at 25px 25px, rgba(0,0,0,.06) 2px, transparent 2px),
   radial-gradient(circle at 55px 55px, rgba(0,0,0,.04) 1.5px, transparent 1.5px);
  background-size:80px 80px, 80px 80px;
  filter:grayscale(100%);
}
.hero-left{ position:relative; z-index:1; padding:8px 0 24px; }
.kicker{ color:#8a8f99; margin:0 0 6px; font-size:.88rem; }
.heading{ margin:0 0 14px; }
.heading > span{ display:block; font-weight:800; font-size:1.5rem; color:var(--accent); }
.heading > strong{ display:block; margin-top:6px; line-height:1.1; font-size:clamp(1.6rem,3.6vw,2.4rem); }
.lead{ color:#5b6575; max-width:640px; margin:8px 0 14px; }
.cta-row{ display:flex; gap:10px; flex-wrap:wrap; }
.btn{ padding:11px 14px; border-radius:12px; font-weight:700; border:1px solid var(--accent); cursor:pointer; transition:.15s ease; }
.btn-primary{ background:var(--accent); color:#fff; }
.btn-primary:hover{ filter:brightness(.95); transform:translateY(-1px); }
.btn-ghost{ background:#fff; color:var(--accent); }
.btn-ghost:hover{ background:rgba(0,128,128,.06); transform:translateY(-1px); }

.hero-right{ position:relative; z-index:1; display:flex; align-items:center; justify-content:center; }
.arch{ position:relative; width:min(380px,85%); aspect-ratio:3/4; border-radius:28px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,.08); }
.arch img{ width:100%; height:100%; object-fit:cover; display:block; }
.arch-border{ position:absolute; inset:0; pointer-events:none; border-radius:28px;
  box-shadow:0 0 0 4px #e7e0cf inset, 0 0 0 1px rgba(0,0,0,.06) inset; }

/* ----------------- Helpers visuels -------------------- */
.muted{ color:#64748b; }
.err{ color:#e11d48; text-align:center; }

/* ----------------- Responsive ------------------------- */
@media (max-width: 980px){
  .hero{ grid-template-columns:1fr; }
}
</style>

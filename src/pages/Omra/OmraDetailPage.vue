<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'       // ✅ CORRECT
import RoomTypeIcon from '@/components/icons/RoomTypeIcon.vue'
import FlightIcon from '@/components/icons/FlightIcon.vue'
import planeTakeoff from '@/assets/images/plane-takeoff.png'   // ou .svg
import planeLanding from '@/assets/images/plane-landing.png'   // ou .svg
import Countdown from '@/components/ui/Countdown.vue'


// Base API pour reconstruire les URLs d’images (si backend renvoie juste un path)
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const toUrl = (p) => !p ? null : (/^https?:\/\//i.test(p) ? p : `${API_BASE}/storage/${p}`)

const route = useRoute()
const router = useRouter()
// 1) prop facultative
const props = defineProps({
  omra: { type: Object, default: null }
})

// 2) source unique : prop si fournie, sinon données fetchées
const omra = ref(props.omra)     // si la prop existe, on l’utilise

//const omra   = ref(null)
const loading = ref(false)
const error   = ref('')

// Petites aides
const absUrl = (u) => !u ? '' : (u.startsWith('http') ? u : `${API_BASE}/storage/${u}`)
const toDate = (iso) => (iso ? new Date(iso) : null)
const fmtShort = (iso) => {
  const d = toDate(iso); if(!d) return '—'
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}
const fmtMoney = (n) => (n == null || n === '')
  ? '—'
  : new Intl.NumberFormat('fr-FR',{ style:'currency', currency:'EUR' }).format(Number(n))

// Hôtels (on les charge depuis l’API si ids présents)
const makkahHotel = ref(null)
const medinaHotel = ref(null)

function firstHotelImage(h){
  const it = (h?.images || [])[0]
  return it ? (it.url?.startsWith('http') ? it.url : absUrl(it.path || '')) : ''
}

async function loadHotel(id){
  if(!id) return null
  try{
    const { data } = await api.get(`/hotels/${id}`)
    // tente d’enrichir l’URL de couverture si besoin
    if (Array.isArray(data?.images)) {
      data.images = data.images.map(x => ({
        ...x,
        url: x.url?.startsWith?.('http') ? x.url : absUrl(x.path || '')
      }))
    } else {
      data.images = []
    }
    return data
  }catch{ return null }
}

// Durée (utilise la valeur fournie si backend la calcule, sinon calcule)
const durationDays = computed(() => {
  const d = omra.value
  if (!d) return 0
  if (d.duration_days) return d.duration_days
  const a = toDate(d.date_start), b = toDate(d.date_end)
  if (!a || !b) return 0
  const ms = (b - a) / 86400000 + 1
  return ms > 0 ? Math.round(ms) : 0
})


const rangeShort = computed(() => omra.value ? `Du ${fmtShort(omra.value.date_start)} au ${fmtShort(omra.value.date_end)}` : '—')

// Prix formaté court: "€1 890"
function euroShort(v) {
  if (v == null) return '—'
  const n = Math.round(Number(v))
  return `€${n.toLocaleString('fr-FR')}`
}

// Construit la liste des cartes tarifs à partir de l'Omra chargée
const tariffCards = computed(() => {
  const o = omra.value || {}
  const items = [
    { key: 'quad',   label: 'CHAMBRE QUADRUPLE', price: o.price_quadruple, occ: 4 },
    { key: 'triple', label: 'CHAMBRE TRIPLE',    price: o.price_triple,    occ: 3 },
    { key: 'double', label: 'CHAMBRE DOUBLE',    price: o.price_double,    occ: 2 },
    { key: 'single', label: 'CHAMBRE SINGLE',    price: o.price_single,    occ: 1 },
  ].filter(i => i.price != null)

  if (!items.length) return []
  const min = Math.min(...items.map(i => Number(i.price)))
  return items.map(i => ({ ...i, featured: Number(i.price) === min }))
})

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isFinite(id) || id <= 0) {
    error.value = 'Identifiant invalide.'
    return
  }
  try{
    loading.value = true
    const { data } = await api.get(`/omras/${id}`)
    // normalise image cover
    data.image_path = absUrl(data.image_path || '')
    omra.value = data

    // charge les hôtels (si ids présents)
    if (data.makkah_hotel_id)  makkahHotel.value = await loadHotel(data.makkah_hotel_id)
    if (data.medina_hotel_id)  medinaHotel.value = await loadHotel(data.medina_hotel_id)
  }catch(e){
    error.value = e?.response?.data?.message || e?.message || 'Impossible de charger cette Omra.'
  }finally{
    loading.value = false
  }
})

// grande image à gauche (fallback si manquante)
const heroImage = computed(() =>
  toUrl(omra.value?.image_path) || '/placeholder-omra.jpg'
)

// (facultatif) petites vignettes à droite – on met l’image formule en 1ère
const thumbs = computed(() => {
  const arr = []
  if (omra.value?.image_path) arr.push(toUrl(omra.value.image_path))
  // tu peux pousser d’autres images si tu en as (ex: celles des hôtels)
  // if (omra.value?.makkah_hotel?.images) arr.push(...omra.value.makkah_hotel.images.map(i => toUrl(i.path)))
  return arr.slice(0, 3)
})

const starsMax = computed(() =>
  Math.max(makkahHotel.value?.stars || 0, medinaHotel.value?.stars || 0)
)
const hasStars = computed(() => starsMax.value > 0)

// --- helpers pour l’affichage de dates longues (ex: "jeu. 08 janv. 2026")
const fmtLongDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

// Cartes de vol : on essaie d’utiliser des champs détaillés si présents,
// sinon on crée deux cartes “aller/retour” basées sur date_start/date_end
const flightCards = computed(() => {
  const o = omra.value ?? {};

  // normalise un booléen venant du backend (true/false, 1/0, "1"/"true", etc.)
  const asBool = v => v === true || v === 1 || v === '1' || v === 'true' || v === 'yes' || v === 'on';

  // supporte plusieurs conventions de nommage
  const out  = o.flight_out  || o.flightOut  || o.vol_aller  || null;
  const back = o.flight_back || o.flightBack || o.vol_retour || null;

  const toCard = (f, kind) => {
    if (!f) return null;
    const segs = Array.isArray(f.segments)
      ? f.segments
      : (typeof f.segments_text === 'string'
          ? f.segments_text.split(/\r?\n/).filter(Boolean)
          : []);
    const logo = f.logo_url || f.logo || null;
    return {
      kind,
      airline: f.airline ?? '—',
      date: f.date ?? null,
      segments: segs,
      logo: logo ? (String(logo).startsWith('http') ? logo : absUrl(logo)) : null,
    };
  };

  

  const hasDetailed =
    (out  && (out.date  || out.segments  || out.segments_text)) ||
    (back && (back.date || back.segments || back.segments_text));

  if (hasDetailed) {
    return [toCard(out, 'VOL ALLER'), toCard(back, 'VOL RETOUR')].filter(Boolean);
  }

  // Fallback : vols inclus (peu importe le format du booléen)
  if (asBool(o.flight_included ?? o.flightIncluded)) {
    return [
      { kind: 'VOL ALLER',  airline: o.airline || '—', date: o.date_start || null, segments: [], logo: null },
      { kind: 'VOL RETOUR', airline: o.airline || '—', date: o.date_end   || null, segments: [], logo: null },
    ];
  }

  // Ultime fallback : si on a des dates, on montre quand même
  if (o.date_start || o.date_end) {
    return [
      o.date_start && { kind: 'VOL ALLER',  airline: o.airline || '—', date: o.date_start, segments: [], logo: null },
      o.date_end   && { kind: 'VOL RETOUR', airline: o.airline || '—', date: o.date_end,   segments: [], logo: null },
    ].filter(Boolean);
  }

  return [];
});


function goToHotel(hotel) {
  if (!hotel?.id) return
  router.push({ name: 'hotel-view', params: { id: hotel.id } })
}

const goBack = () => {
  // Si l'utilisateur vient d'une page interne → revenir en arrière
  if (document.referrer && document.referrer.includes(window.location.host)) {
    router.back();
    return;
  }
  // Sinon, aller à la liste des Omras (adapte le name/path à ton routeur)
  router.push({ name: 'admin-omras-list' }).catch(() => router.push('omras'));
};

// --- Normalisation utilitaire : renvoyer toujours un tableau de strings
function asList(v) {
  if (Array.isArray(v)) return v.map(s => String(s || '').trim()).filter(Boolean)
  if (typeof v === 'string') {
    try { const j = JSON.parse(v); if (Array.isArray(j)) return asList(j) } catch {}
    return v.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

// Programme (tableau [{day?, title, text}]) -> nettoyé et indexé
const programDays = computed(() => {
  const src = omra.value?.program_days
  let arr = []
  if (Array.isArray(src)) arr = src
  else if (typeof src === 'string') { try { arr = JSON.parse(src) || [] } catch {} }
  return arr
    .map((d, i) => ({
      day: d?.day ?? i + 1,
      title: String(d?.title || '').trim(),
      text:  String(d?.text  || '').trim()
    }))
    .filter(d => d.title || d.text)
})

// Listes Inclus / Exclus
const includesList = computed(() =>
  (omra.value?.includes || []).map(s => String(s||'').trim()).filter(Boolean)
)
const excludesList = computed(() =>
  (omra.value?.excludes || []).map(s => String(s||'').trim()).filter(Boolean)
)

//icone vol
const isOut = (f) => /aller/i.test(f?.kind || '');   // "VOL ALLER" → true

// Mois lisible, robuste si "2" ou 2 ou déjà "Février"
const monthLabel = computed(() => {
  const m = omra.value?.month
  if (m == null || m === '') return ''
  const n = Number(m)
  if (Number.isFinite(n) && n >= 1 && n <= 12) {
    // utilise l’API Intl pour obtenir le nom français
    const name = new Date(2000, n - 1, 1)
      .toLocaleDateString('fr-FR', { month: 'long' })
    // capitaliser la 1re lettre (Intl renvoie "février")
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  // c’est déjà un texte ("Février" par ex.)
  return String(m)
})



const depCity  = computed(() => omra.value?.departure_city || '—')
const tripText = computed(() => omra.value?.trip || '')

</script>

<template>
  <main class="omra">
    <section class="details-card">

      <div class="page-actions">
        <button @click="router.back()" 
                class="back-btn" 
                aria-label="Retour à la liste des Omras">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour à la liste
        </button>
      </div>
      <!-- En-tête -->
      <header class="hero hero--two" v-if="omra">
        <!-- LEFT: title + meta -->
        <div class="hero-left">
          <h1 class="title">{{ omra.title }}
            
          </h1>
          <h2 class="block-title">
            Omra <strong>{{ monthLabel  }} {{ omra.year }}</strong>
          </h2>

          <ul class="meta">
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{{ rangeShort }}</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ durationDays }} jours</span>
            </li>
            <li v-if="hasStars">
              <svg  
                viewBox="0 0 64 40" class="bed" aria-hidden="true">
                <!-- style “lit + tête + personne” (proche de ton exemple) -->
                <rect x="4"  y="10" width="6"  height="20" rx="3" />     <!-- tête de lit -->
                <circle cx="18" cy="22" r="6" />                         <!-- tête (personne) -->
                <rect x="26" y="16" width="30" height="12" rx="6" />     <!-- couette/matelas -->
                <rect x="10" y="28" width="46" height="6"  rx="2" />     <!-- cadre -->
                <rect x="56" y="28" width="4"  height="8"  rx="2" />     <!-- pied -->
              </svg>
              <span>Hébergement en hôtel ★{{ starsMax }}</span>
            </li>
          </ul>
        </div>

        <!-- RIGHT: countdown card -->
        <!-- RIGHT: countdown + CTA -->
        <div class="hero-right">
          <div class="hero-side">
            <div class="hero-countdown">
              <Countdown :to="omra?.date_start" size="sm" endText="Départ effectué" />
            </div>

            <!-- Variante RouterLink (si tu as une page de réservation) -->
            <RouterLink class="btn-cta">
              <!-- petite icône -->
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M8 7h8M6 11h12M6 15h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              Réserver maintenant
            </RouterLink>
          </div>
        </div>
      </header>

      <!-- Galerie + résumé -->
      <section class="hero-gallery">
        <!-- colonnes de petites vignettes -->
        <div class="thumbs">
          <div v-for="(t, i) in thumbs" :key="i" class="thumb"
           :style="{ backgroundImage: `url(${t})` }" 
          />
            <!-- si tu veux forcer 3 slots, tu peux compléter par des placeholders -->
        </div>

        <!-- Bloc "Infos départ" -->
        <section class="box info">
  
          <h4 class="infos">Infos départ</h4>
          <ul class="info-list">
            <li>
              <span> <strong> Ville de départ : </strong>  </span>
              <span> {{ depCity }}</span>
            </li>

            <!-- Bloc "Séjour / Trip" -->
            <li>
              <span> <strong>Séjour : </strong></span>
              <span> {{ tripText }}</span>
            </li>
          </ul>
        </section>
        
        <!-- ton bloc texte de droite reste inchangé -->
        <div class="hero-text">
          <h4>{{ omra?.title }}</h4>
          <p>{{ omra?.description || 'Programme à venir.' }}</p>
        </div>
      </section>

      <!-- Hébergement -->
      <section class="section">
        <h4 class="section-title">
          <svg viewBox="0 0 24 24">
            <path d="M4 12l8-8 8 8"/>
            <path d="M20 12v8H4v-8"/>
          </svg>
          Hébergement
        </h4>

        <div class="hotels">
          <!-- Makkah -->
          <article
            class="hotel-card is-clickable"
            v-if="makkahHotel"
            @click="goToHotel(makkahHotel)"
            @keyup.enter="goToHotel(makkahHotel)"
            tabindex="0"
            :aria-label="`Voir ${makkahHotel.name}`">

            <div class="hotel-image" 
              :style="{ backgroundImage:`url(${ firstHotelImage(makkahHotel) })` }">
            </div>
            <div class="hotel-body">
              <div class="hotel-city">
                HÔTEL : <span>MAKKAH</span>
              </div>
              <h4 class="hotel-name">{{ makkahHotel.name }}</h4>
              <div class="hotel-meta">
                <span class="dot"></span> Makkah
                <span v-if="omra.makkah_nights"> · {{ omra.makkah_nights }} nuits</span>
              </div>
            </div>
          </article>

          <!-- Medina -->
          <article
            class="hotel-card is-clickable"
            v-if="medinaHotel"
            @click="goToHotel(medinaHotel)"
            @keyup.enter="goToHotel(medinaHotel)"
            tabindex="0"
            :aria-label="`Voir ${medinaHotel.name}`">

            <div class="hotel-image" :style="{ backgroundImage:`url(${ firstHotelImage(medinaHotel) })` }"></div>
              <div class="hotel-body">
                <div class="hotel-city">
                  HÔTEL : <span>MÉDINA</span>
                </div>
              <h4 class="hotel-name">{{ medinaHotel.name }}</h4>
              <div class="hotel-meta">
                <span class="dot"></span> Médina
                <span v-if="omra.medina_nights"> · {{ omra.medina_nights }} nuits</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Tarifs -->
      <section v-if="tariffCards.length" class="tariffs">
        <h4 class="tariffs-title">
          <svg  
            viewBox="0 0 60 40" class="bed" aria-hidden="true">
            <!-- style “lit + tête + personne” (proche de ton exemple) -->
            <rect x="4"  y="10" width="6"  height="20" rx="3" />     <!-- tête de lit -->
            <circle cx="18" cy="22" r="6" />                         <!-- tête (personne) -->
            <rect x="26" y="16" width="30" height="12" rx="6" />     <!-- couette/matelas -->
            <rect x="10" y="28" width="46" height="6"  rx="2" />     <!-- cadre -->
            <rect x="56" y="28" width="4"  height="8"  rx="2" />     <!-- pied -->
          </svg>
          Tarifs
        </h4>

        <div class="tariff-cards">
          <article
            v-for="t in tariffCards"
            :key="t.key"
            class="tariff-card"
            tabindex="0">

            <div class="tariff-icon" aria-hidden="true">
              <!-- tu peux garder ton SVG, mais si tu veux l’icône "lits" dynamique: -->
              <RoomTypeIcon :occupancy="t.occ" :size="68" />
            </div>
            <div class="tariff-name">
              {{ t.label }}
            </div>
            <div class="tariff-sub">
              Prix par personne
            </div>
            <div class="tariff-price">
              {{ euroShort(t.price) }}
            </div>

            <!-- Variante RouterLink (si tu as une page de réservation) -->
            <div class="hero-right">
              <RouterLink class="btn-cta">
                <!-- petite icône -->
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M8 7h8M6 11h12M6 15h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                Réserver 
              </RouterLink>
            </div>
          </article>
        </div>
      </section>

      <!-- ===== Vol ===== -->
      <section v-if="flightCards && flightCards.length" class="flights">
        <h4 class="section-title">
          <FlightIcon :size="24" color="#008080" />
          Vol
        </h4>

        <div class="flight-cards">
          <article v-for="(f,i) in flightCards" :key="i" class="flight-card">
            <div class="plane-hero">
              <img
                :src="isOut(f) ? planeTakeoff : planeLanding"
                :alt="isOut(f) ? 'Décollage' : 'Atterrissage'"
                class="plane-img"
              />
            </div>

            <h4 class="flight-kind">
              {{ f.kind }}
            </h4>
            <div class="airline">
              {{ f.airline }}
            </div>
            <div class="flight-date">
              {{ fmtLongDate(f.date) }}
            </div>
            <ul class="segments" v-if="f.segments && f.segments.length">
              <li v-for="(s,j) in f.segments" :key="j">
                <svg class="tick" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span v-if="typeof s === 'string'">{{ s }}</span>
                <span v-else>{{ s.code }} {{ s.from }}–{{ s.to }} {{ s.dep }}–{{ s.arr }}</span>
              </li>
            </ul>

            <div class="logos" v-if="f.logo">
              <img :src="f.logo" alt="Compagnie aérienne">
            </div>
          </article>
        </div>
      </section>

      <!-- ===== Programme jour par jour ===== -->
      <section class="program" v-if="programDays.length">
        <h4 class="section-title program-title">
        <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        Programme
        </h4>

        <div class="program-grid">
          <article v-for="(d, i) in programDays" :key="i" class="program-card">
            <div class="step">{{ i + 1 }}</div>
            <div class="program-title">{{ `Jour ${i+1}` }} : {{ d.title || `Jour ${i+1}` }}</div>
            <p class="program-text">{{ d.text }}</p>
          </article>
        </div>
      </section>

      <!-- Titre "Nos prestations" -->
      <section class="section prestations" v-if="includesList.length || excludesList.length">
        <h4 class="prestas-title">
        <!-- icône en SVG -->
          <svg class="prestas-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="4" cy="6" r="2"></circle>
            <rect x="8" y="5" width="12" height="2" rx="1"></rect>
            <circle cx="4" cy="12" r="2"></circle>
            <rect x="8" y="11" width="12" height="2" rx="1"></rect>
            <circle cx="4" cy="18" r="2"></circle>
            <rect x="8" y="17" width="12" height="2" rx="1"></rect>
          </svg>
          Nos prestations
        </h4>

        <div class="prestations-grid">
          <!-- Inclus -->
          <article class="prest-card">
            <h4 class="prest-title is-include">Le prix inclus</h4>
            <ul class="prest-list">
              <li v-for="(it,i) in includesList" :key="`inc-${i}`">
                <!-- ✓ icône -->
                <svg class="li-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#0a7a7a"/>
                  <path d="M7.5 12.5l3 3 6-6"
                    fill="none" stroke="#fff" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ it }}</span>
              </li>
            </ul>
          </article>

          <!-- N’inclut pas -->
          <article class="prest-card1">
            <h4 class="prest-title is-exclude">Le prix n’inclut pas</h4>
            <ul class="prest-list">
              <li v-for="(it,i) in excludesList" :key="`exc-${i}`">
                <!-- ✗ icône -->
                <svg class="li-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#e18700"/>
                  <path d="M8 8l8 8M16 8l-8 8"
                    fill="none" stroke="#fff" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ it }}</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <!-- Erreur / Loading -->
      <p v-if="loading" class="muted" style="text-align:center">Chargement…</p>
      <p v-if="error" class="err">{{ error }}</p>

    </section>
  </main>
</template>

<style src="@/assets/styles/OmraDetailPage.css"></style>

<template>
  <div class="home">

    <!-- HERO -->
    <section class="hero">
      <!-- Colonne gauche -->
      <div class="hero-left">
        <p class="kicker">Vous voulez partir faire votre Omra ?</p>
        <h1 class="heading">
          <span>Omra </span>
          <strong>
            Votre partenaire privilégié<br />
            pour accomplir<br />
            Omra 
          </strong>
        </h1>
        <p class="lead">
          Chez Noussouki Travel, nous sommes spécialisés dans l’organisation de l’Omra, 
          conçus pour allier spiritualité, confort et sérénité.
          Grâce à notre expérience et à notre accompagnement de qualité, 
          vous profitez omra soigneusement organisés.

          Nos offres incluent des formules Omra économique et Omra tout compris.
          <br></br>
          📌 Réservez dès aujourd’hui votre Omra tout compris avec Noussouki Travel et 
          profitez d’un service complet, transparent et de qualité.
 
        </p>
        <div class="cta-row">
          <router-link to="/omras" class="btn btn-primary">
            Explorer nos forfaits Omra
          </router-link>
          <button class="btn btn-ghost">Pré-inscription à notre site</button>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="hero-right">
        <div class="arch">
          <img src="@/assets/images/omra5.webp" alt="Illustration Omra" />
          <span class="arch-border" />
        </div>
      </div>
    </section>

    <!-- SECTION FORFAITS -->
<section class="offers">

 
    <!-- ============ OMRA ÉCONOMIQUE ============ -->
  <div class="offers-block" id="economique">
  <h2 style="text-align:center;">Omra Économique</h2>
  <p style="color: #5b6575; text-align:center;">Choisir une omra pas cher : Une expérience spirituelle accessible

    La Omra est un acte d’adoration profond qui ne devrait pas être limité par des contraintes financières. 
    Opter pour une Omra pas cher avec Noussouki Travel permet à davantage de fidèles d’accomplir ce pèlerinage sacré, 
    tout en bénéficiant d’un voyage organisé et d’un hébergement confortable.</p>

  <!-- VERSION DESKTOP : grille -->
  <div v-if="!isMobile" class="grid">
    <router-link
      v-for="o in omrasEco"
      :key="'eco-'+o.id"
      class="card"
      :to="{ name: 'omra-detail', params: { id: String(o.id) } }"
      aria-label="Voir la formule"
    >
      <!-- Image -->
      <div
        class="cover"
        :style="{ backgroundImage: `url(${toAbsolute(o.image_path)})` }"
      ></div>

      <!-- Corps -->
      <div class="body">
        <h4 class="title">{{ o.title || 'Omra' }}</h4>

        <div class="dates" v-if="o.date_start || o.date_end">
          Du {{ fmtDate(o.date_start) }} au {{ fmtDate(o.date_end) }}
        </div>

        <div class="type">
          Type :
          <strong>{{ o.type || '—' }}</strong>
        </div>
      </div>

      <!-- Bas de carte -->
      <div class="bottom">
        <div class="price">
          à partir de
          <strong>
            {{
              o.price_from !== undefined && o.price_from !== null
                ? `€${Math.trunc(o.price_from).toLocaleString('fr-FR')}`
                : '—'
            }}
          </strong>
        </div>

        <span class="btn-card-gold">PRÉ-RÉSERVEZ</span>
      </div>
    </router-link>

    <p
      v-if="!loading && !omrasEco.length"
      class="empty"
    >
      Aucune offre économique pour le moment.
    </p>
  </div>



    <!-- VERSION MOBILE : carrousel -->
    <div v-else class="carousel-wrapper">

      <!-- Flèche gauche -->
      <button
        class="scroll-btn left"
        @click="scrollTrack('eco','left')"
        aria-label="Précédent"
      >
        ‹
      </button>

      <!-- Bande scrollable -->
      <div class="carousel-track" ref="ecoTrack">
        <router-link
          v-for="o in omrasEco"
          :key="'eco-m-'+o.id"
          class="card ramadan-card"
          :to="{ name: 'omra-detail', params: { id: String(o.id) } }"
          aria-label="Voir la formule"
        >
          <!-- Image -->
          <div
            class="cover"
            :style="{ backgroundImage: `url(${toAbsolute(o.image_path)})` }"
          ></div>

          <!-- Corps -->
          <div class="body">
            <h4 class="title">{{ o.title || 'Omra' }}</h4>

            <div class="dates" v-if="o.date_start || o.date_end">
              Du {{ fmtDate(o.date_start) }} au {{ fmtDate(o.date_end) }}
            </div>

            <div class="type">
              Type :
              <strong>{{ o.type || '—' }}</strong>
            </div>
          </div>

          <!-- Bas de carte -->
          <div class="bottom">
            <div class="price">
              à partir de
              <strong>
                {{
                  o.price_from !== undefined && o.price_from !== null
                    ? `€${Math.trunc(o.price_from).toLocaleString('fr-FR')}`
                    : '—'
                }}
              </strong>
            </div>

            <button class="btn-card-gold">PRÉ-RÉSERVEZ</button>
          </div>
        </router-link>
      </div>

      <!-- Flèche droite -->
      <button
        class="scroll-btn right"
        @click="scrollTrack('eco','right')"
        aria-label="Suivant"
      >
        ›
      </button>
    </div>
  </div>


  
    <!-- ============ OMRA CONFORT ============ -->
  <div class="offers-block" id="confort">
    <h2 style="text-align:center;">Omra Confort</h2>
    <p style="color: #5b6575; text-align:center;">Choisir une omra pas cher : Une expérience spirituelle accessible

    La Omra est un acte d’adoration profond qui ne devrait pas être limité par des contraintes financières. 
    Opter pour une Omra pas cher avec Noussouki Travel permet à davantage de fidèles d’accomplir ce pèlerinage sacré, 
    tout en bénéficiant d’un voyage organisé et d’un hébergement confortable.</p>

    <!-- VERSION DESKTOP : grille -->
    <div v-if="!isMobile" class="grid">
      <router-link
        v-for="o in omrasConfort"
        :key="'conf-'+o.id"
        class="card"
        :to="{ name: 'omra-detail', params: { id: String(o.id) } }"
        aria-label="Voir la formule"
      >
        <div
          class="cover"
          :style="{ backgroundImage: `url(${toAbsolute(o.image_path)})` }"
        ></div>

        <div class="body">
          <h4 class="title">{{ o.title || 'Omra' }}</h4>

          <div class="dates" v-if="o.date_start || o.date_end">
            Du {{ fmtDate(o.date_start) }} au {{ fmtDate(o.date_end) }}
          </div>

          <div class="type">
            Type :
            <strong>{{ o.type || '—' }}</strong>
          </div>
        </div>

        <div class="bottom">
          <div class="price">
            à partir de
            <strong>
              {{
                o.price_from !== undefined && o.price_from !== null
                  ? `€${Math.trunc(o.price_from).toLocaleString('fr-FR')}`
                  : '—'
              }}
            </strong>
          </div>

          <button class="btn-card-gold">PRÉ-RÉSERVEZ</button>
        </div>
      </router-link>

      <p
        v-if="!loading && !omrasConfort.length"
        class="empty"
      >
        Aucune offre confort pour le moment.
      </p>
    </div>

    <!-- VERSION MOBILE : carrousel -->
    <div v-else class="carousel-wrapper">

      <!-- Flèche gauche -->
      <button
        class="scroll-btn left"
        @click="scrollTrack('conf','left')"
        aria-label="Précédent"
      >
        ‹
      </button>

      <!-- Bande scrollable -->
      <div class="carousel-track" ref="confTrack">
        <router-link
          v-for="o in omrasConfort"
          :key="'conf-m-'+o.id"
          class="card ramadan-card"
          :to="{ name: 'omra-detail', params: { id: String(o.id) } }"
          aria-label="Voir la formule"
         >
          <div
            class="cover"
            :style="{ backgroundImage: `url(${toAbsolute(o.image_path)})` }"
          ></div>

          <div class="body">
            <h4 class="title">{{ o.title || 'Omra' }}</h4>

            <div class="dates" v-if="o.date_start || o.date_end">
              Du {{ fmtDate(o.date_start) }} au {{ fmtDate(o.date_end) }}
            </div>

            <div class="type">
              Type :
              <strong>{{ o.type || '—' }}</strong>
            </div>
          </div>

          <div class="bottom">
            <div class="price">
              à partir de
              <strong>
                {{
                  o.price_from !== undefined && o.price_from !== null
                    ? `€${Math.trunc(o.price_from).toLocaleString('fr-FR')}`
                    : '—'
                }}
              </strong>
            </div>

            <button class="btn-card-gold">PRÉ-RÉSERVEZ</button>
          </div>
        </router-link>
      </div>

      <!-- Flèche droite -->
      <button
        class="scroll-btn right"
        @click="scrollTrack('conf','right')"
        aria-label="Suivant"
      >
        ›
      </button>
    </div>
  </div>


  <!-- ============ OMRA RAMADAN ============ -->
<div class="offers-block" id="ramadan">
  <h2 style="text-align:center;">Omra Ramadan</h2>
  <p style="color: #5b6575; text-align:center;">Choisir une omra pas cher : Une expérience spirituelle accessible

    La Omra est un acte d’adoration profond qui ne devrait pas être limité par des contraintes financières. 
    Opter pour une Omra pas cher avec Noussouki Travel permet à davantage de fidèles d’accomplir ce pèlerinage sacré, 
    tout en bénéficiant d’un voyage organisé et d’un hébergement confortable.</p>


  <div class="carousel-wrapper">

    <!-- Flèche gauche -->
    <button
      class="scroll-btn left"
      @click="scrollTrack('ramadan','left')"
      aria-label="Précédent"
    >
      ‹
    </button>

    <!-- Bande scrollable -->
    <div class="carousel-track" ref="ramadanTrack">
      <router-link
        v-for="o in omrasRamadanAll"
        :key="'ram-'+o.id"
        class="card ramadan-card"
        :to="{ name: 'omra-detail', params: { id: String(o.id) } }"
        aria-label="Voir la formule"
      >
        <!-- Image -->
        <div
          class="cover"
          :style="{ backgroundImage: `url(${toAbsolute(o.image_path)})` }"
        ></div>

        <!-- Texte -->
        <div class="body">
          <h4 class="title">{{ o.title || 'Omra' }}</h4>

          <div class="dates" v-if="o.date_start || o.date_end">
            Du {{ fmtDate(o.date_start) }} au {{ fmtDate(o.date_end) }}
          </div>

          <div class="type">
            Type : <strong>{{ o.type || '—' }}</strong>
          </div>
        </div>

        <!-- Bas de carte -->
        <div class="bottom">
          <div class="price">
            à partir de
            <strong>
              {{
                o.price_from !== undefined && o.price_from !== null
                  ? `€${Math.trunc(o.price_from).toLocaleString('fr-FR')}`
                  : '—'
              }}
            </strong>
          </div>

          <button class="btn-card-gold">PRÉ-RÉSERVEZ</button>
        </div>
      </router-link>
    </div>

    <!-- Flèche droite -->
    <button
      class="scroll-btn right"
      @click="scrollTrack('ramadan','right')"
      aria-label="Suivant"
    >
      ›
    </button>
  </div>

  <p
    v-if="!loading && !omrasRamadanAll.length"
    class="empty"
  >
    Aucune offre Ramadan pour le moment.
  </p>
</div>



  <p v-if="err" class="error">{{ err }}</p>
</section>

<!-- ================== TÉMOIGNAGES ================== -->
<section class="testimonials-section">
  <div class="testimonials-inner">

    <div class="testimonials-header">
      <h2 class="testi-title">
        Témoignages <span class="gold">clients</span>
      </h2>

      <button class="video-btn">
        Voir les témoignages en vidéos
      </button>
    </div>

    <div class="testimonials-carousel-wrapper">
      <!-- Flèche gauche -->
      <button
        class="testi-arrow left"
        @click="scrollTestimonials('left')"
        aria-label="Précédent"
      >
        ‹
      </button>

      <!-- Liste horizontale -->
      <div class="testimonials-track" ref="testimonialsTrack">
        <article
          v-for="t in testimonials"
          :key="t.id"
          class="testi-card"
          >
          <!-- Avatar -->
          <div class="testi-avatar-row">
            <div
              class="testi-avatar"
              :style="t.avatar_url
              ? { backgroundImage: `url(${t.avatar_url})` }
              : {}"
              >
              <template v-if="!t.avatar_url">
                {{ getInitials(t.name) }}
              </template>
            </div>
          </div>

          <!-- Nom + Date -->
          <div class="testi-meta">
            <div class="testi-name">
              {{ t.name || 'Client' }}
            </div>
            <div class="testi-date">
              {{ formatDateFR(t.date) }}
            </div>
          </div>

          <!-- Étoiles + badge vérifié -->
          <div class="stars-line">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ active: i <= t.rating }"
              >★
            </span>

            <span class="verified-dot" title="Avis vérifié"></span>
          </div>

          <!-- Texte + Lire la suite -->
          <div class="testi-text">
            {{ getDisplayText(t) }}
          </div>

          <div
            v-if="getToggleLabel(t)"
            class="testi-more"
            @click="toggleExpand(t.id)"
            >
            {{ getToggleLabel(t) }}
          </div>
        </article>
      </div>

      <!-- Flèche droite -->
      <button
        class="testi-arrow right"
        @click="scrollTestimonials('right')"
        aria-label="Suivant"
      >
        ›
      </button>
    </div>
  </div>
</section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import api from "@/services/api"

/* =========================================================
   Refs DOM pour les carrousels d'offres
   ========================================================= */
const ecoTrack = ref(null)          // carrousel Omra Économique (mobile)
const confTrack = ref(null)         // carrousel Omra Confort (mobile)
const ramadanTrack = ref(null)      // carrousel Omra Ramadan (desktop + mobile)
const testimonialsTrack = ref(null) // carrousel Témoignages

/* =========================================================
   State principal
   ========================================================= */
const loading = ref(true)         // chargement des offres Omra
const all = ref([])               // toutes les Omra publiées
const err = ref("")               // message d'erreur réseau/API

/* =========================================================
   Responsive : savoir si on est en mobile (<950px)
   ========================================================= */
const isMobile = ref(false)

function handleResize() {
  isMobile.value = window.matchMedia("(max-width: 950px)").matches
}

/* =========================================================
   Scroll (manuel + auto)
   ========================================================= */

// largeur exacte d'une carte (incluant le gap)
function getScrollStep(el) {
  if (!el) return 0
  const card = el.querySelector(".card, .ramadan-card, .testi-card")
  return card ? card.offsetWidth + 24 : 400  // 24px = gap en CSS
}

/**
 * Scroll par boutons flèches (Éco / Confort / Ramadan)
 */
function scrollTrack(which, dir) {
  let el = null
  if (which === "eco") el = ecoTrack.value
  if (which === "conf") el = confTrack.value
  if (which === "ramadan") el = ramadanTrack.value
  if (!el) return

  const step = getScrollStep(el)
  el.scrollBy({
    left: dir === "left" ? -step : step,
    behavior: "smooth",
  })

  // si l’utilisateur clique sur une flèche, on coupe l’autoplay du carrousel concerné
  if (which === "eco") stopEcoAuto()
  if (which === "conf") stopConfAuto()
  if (which === "ramadan") stopRamadanAuto()
}

/**
 * Scroll automatique d’un track (utilisé par chaque autoplay)
 */
function autoScrollOnce(elRef) {
  const el = elRef.value
  if (!el) return

  const step = getScrollStep(el)
  const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10

  if (nearEnd) {
    el.scrollTo({ left: 0, behavior: "smooth" })
  } else {
    el.scrollBy({ left: step, behavior: "smooth" })
  }
}

/**
 * Attache "stop si scroll MANUEL" pour un carrousel donné
 * (wheel / mousedown / touchstart)
 */
function attachStopOnManualScroll(elRef, stopFn) {
  const el = elRef?.value
  if (!el || !stopFn) return

  const handler = () => {
    stopFn()
    el.removeEventListener("wheel", handler)
    el.removeEventListener("mousedown", handler)
    el.removeEventListener("touchstart", handler)
  }

  el.addEventListener("wheel", handler, { passive: true })
  el.addEventListener("mousedown", handler)
  el.addEventListener("touchstart", handler, { passive: true })
}

/* =========================================================
   Helpers Omra (eco / confort / ramadan)
   ========================================================= */

function parseDateSafe(d) {
  if (!d) return Infinity
  return new Date(d).getTime()
}

function byTypeSorted(t) {
  return all.value
    .filter((o) => String(o.type || "").toLowerCase() === t)
    .slice()
    .sort((a, b) => parseDateSafe(a.date_start) - parseDateSafe(b.date_start))
}

const omrasEco = computed(() => byTypeSorted("economique").slice(0, 6))
const omrasConfort = computed(() => byTypeSorted("confort").slice(0, 6))
const omrasRamadanAll = computed(() => byTypeSorted("ramadan"))

function fmtDate(iso) {
  if (!iso) return "—"
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function toAbsolute(u) {
  if (!u) return ""
  if (/^https?:\/\//i.test(u)) return u
  const base = api?.defaults?.baseURL?.replace(/\/+$/, "") || ""
  return u.startsWith("/") ? base + u : base ? `${base}/${u}` : u
}

/* =========================================================
   Témoignages
   ========================================================= */
const testimonials = ref([])
const expandedIds = ref([])
const PREVIEW_LIMIT = 120

function scrollTestimonials(dir) {
  const el = testimonialsTrack.value
  if (!el) return
  const step = getScrollStep(el)
  el.scrollBy({
    left: dir === "left" ? -step : step,
    behavior: "smooth",
  })
  // 👉 coupe seulement l’autoplay des témoignages
  stopTestimonialsAuto()
}

function needsTruncate(txt) {
  if (!txt) return false
  return txt.length > PREVIEW_LIMIT
}

function isExpanded(id) {
  return expandedIds.value.includes(id)
}

function toggleExpand(id) {
  if (isExpanded(id)) {
    expandedIds.value = expandedIds.value.filter((x) => x !== id)
  } else {
    expandedIds.value.push(id)
  }
}

function getDisplayText(t) {
  if (!t || !t.content) return ""
  if (isExpanded(t.id)) return t.content
  if (needsTruncate(t.content)) return t.content.slice(0, PREVIEW_LIMIT) + "…"
  return t.content
}

function getToggleLabel(t) {
  if (!t || !t.content) return ""
  if (!needsTruncate(t.content)) return ""
  return isExpanded(t.id) ? "Lire moins" : "Lire la suite"
}

function getInitials(name) {
  if (!name) return "??"
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ""
  const last = parts[1]?.[0] || ""
  return (first + last).toUpperCase()
}

function formatDateFR(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  const jours = d.getDate()
  const moisNoms = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ]
  const mois = moisNoms[d.getMonth()]
  const an = d.getFullYear()
  return `${jours} ${mois} ${an}`
}

async function loadTestimonials() {
  try {
    const { data } = await api.get("/testimonials/public")
    testimonials.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error("Erreur chargement témoignages", e)
  }
}

/* =========================================================
   AUTOPLAY ÉCO (mobile)
   ========================================================= */
const ecoAutoEnabled = ref(true)
let ecoInterval = null
let ecoAutoCount = 0
const ECO_MAX_AUTO = 30

function startEcoAuto() {
  if (!ecoTrack.value) return
  if (!ecoAutoEnabled.value) return
  if (!isMobile.value) return   // Éco en carrousel seulement sur mobile

  if (ecoInterval) clearInterval(ecoInterval)

  ecoInterval = setInterval(() => {
    if (!ecoAutoEnabled.value) return
    autoScrollOnce(ecoTrack)
    ecoAutoCount++
    if (ecoAutoCount >= ECO_MAX_AUTO) {
      stopEcoAuto()
    }
  }, 4000)
}

function stopEcoAuto() {
  ecoAutoEnabled.value = false
  if (ecoInterval) {
    clearInterval(ecoInterval)
    ecoInterval = null
  }
}

/* =========================================================
   AUTOPLAY CONFORT (mobile)
   ========================================================= */
const confAutoEnabled = ref(true)
let confInterval = null
let confAutoCount = 0
const CONF_MAX_AUTO = 30

function startConfAuto() {
  if (!confTrack.value) return
  if (!confAutoEnabled.value) return
  if (!isMobile.value) return   // Confort en carrousel seulement sur mobile

  if (confInterval) clearInterval(confInterval)

  confInterval = setInterval(() => {
    if (!confAutoEnabled.value) return
    autoScrollOnce(confTrack)
    confAutoCount++
    if (confAutoCount >= CONF_MAX_AUTO) {
      stopConfAuto()
    }
  }, 4000)
}

function stopConfAuto() {
  confAutoEnabled.value = false
  if (confInterval) {
    clearInterval(confInterval)
    confInterval = null
  }
}

/* =========================================================
   AUTOPLAY RAMADAN (desktop + mobile)
   ========================================================= */
const ramadanAutoEnabled = ref(true)
let ramadanInterval = null
let ramadanAutoCount = 0
const RAMADAN_MAX_AUTO = 30

function startRamadanAuto() {
  if (!ramadanTrack.value) return
  if (!ramadanAutoEnabled.value) return

  if (ramadanInterval) clearInterval(ramadanInterval)

  ramadanInterval = setInterval(() => {
    if (!ramadanAutoEnabled.value) return
    autoScrollOnce(ramadanTrack)
    ramadanAutoCount++
    if (ramadanAutoCount >= RAMADAN_MAX_AUTO) {
      stopRamadanAuto()
    }
  }, 4000)
}

function stopRamadanAuto() {
  ramadanAutoEnabled.value = false
  if (ramadanInterval) {
    clearInterval(ramadanInterval)
    ramadanInterval = null
  }
}

/* =========================================================
   AUTOPLAY TÉMOIGNAGES (desktop + mobile)
   ========================================================= */
const testiAutoEnabled = ref(true)
let testiInterval = null
let testiAutoCount = 0
const TESTI_MAX_AUTO = 30

function startTestimonialsAuto() {
  if (!testimonialsTrack.value) return
  if (!testiAutoEnabled.value) return

  if (testiInterval) clearInterval(testiInterval)

  testiInterval = setInterval(() => {
    if (!testiAutoEnabled.value) return
    autoScrollOnce(testimonialsTrack)
    testiAutoCount++
    if (testiAutoCount >= TESTI_MAX_AUTO) {
      stopTestimonialsAuto()
    }
  }, 4000)
}

function stopTestimonialsAuto() {
  testiAutoEnabled.value = false
  if (testiInterval) {
    clearInterval(testiInterval)
    testiInterval = null
  }
}

/* =========================================================
   Lifecycle
   ========================================================= */
onMounted(async () => {
  // 1) responsive
  handleResize()
  window.addEventListener("resize", handleResize)

  // 2) charger offres Omra
  try {
    const { data } = await api.get("/omras", { params: { status: "Publier" } })
    all.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.warn("LOAD OMRA ERROR:", e?.response?.status, e?.message)
    err.value = "Impossible de charger les offres."
  } finally {
    loading.value = false
  }

  // 3) charger témoignages
  await loadTestimonials()

  // 4) stopper chaque autoplay UNIQUEMENT si scroll manuel dans son carrousel
  attachStopOnManualScroll(ecoTrack, stopEcoAuto)
  attachStopOnManualScroll(confTrack, stopConfAuto)
  attachStopOnManualScroll(ramadanTrack, stopRamadanAuto)
  attachStopOnManualScroll(testimonialsTrack, stopTestimonialsAuto)

  // 5) lancer les autoscroll indépendants
  startEcoAuto()
  startConfAuto()
  startRamadanAuto()
  startTestimonialsAuto()
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize)
  stopEcoAuto()
  stopConfAuto()
  stopRamadanAuto()
  stopTestimonialsAuto()
})
</script>



<style scoped src="@/assets/styles/home.css"></style>
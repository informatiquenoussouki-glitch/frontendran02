<!-- src/pages/admin/AdminOmraCreate.vue -->
<script setup>
/* =========================================================
   Imports
   ========================================================= */
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import AlertPopup from '@/components/popups/AlertPopup.vue'

/* =========================================================
   Constantes de date et options de sélection
   ========================================================= */
const router = useRouter()
const NOW = new Date()
const CURRENT_YEAR  = NOW.getFullYear()
const CURRENT_MONTH = NOW.getMonth() + 1 // 1..12

const YEARS = computed(() => {
  const arr = []
  for (let y = CURRENT_YEAR; y <= CURRENT_YEAR + 5; y++) arr.push(y)
  return arr
})
const MONTHS = [
  { value: 1,  label: 'Janvier' },   { value: 2,  label: 'Février' },
  { value: 3,  label: 'Mars' },      { value: 4,  label: 'Avril' },
  { value: 5,  label: 'Mai' },       { value: 6,  label: 'Juin' },
  { value: 7,  label: 'Juillet' },   { value: 8,  label: 'Août' },
  { value: 9,  label: 'Septembre' }, { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },  { value: 12, label: 'Décembre' },
]
const monthsForSelectedYear = computed(() =>
  MONTHS.map(m => ({
    ...m,
    disabled:
      !form.value.year ||
      (Number(form.value.year) === CURRENT_YEAR && Number(m.value) < CURRENT_MONTH),
  }))
)

/* =========================================================
   State principal
   ========================================================= */
const hotels  = ref([])
const loading = ref(false)
const error   = ref('')

const form = ref({
  title: '',
  description: '',
  image_path: '',
  year: CURRENT_YEAR,
  month: '',

  date_start: '',
  date_end: '',

  makkah_hotel_id: 0,
  medina_hotel_id: 0,

  // ✅ initialisés à 0
  makkah_nights: 0,
  medina_nights: 0,

  price_from: null,
  price_single: null,
  price_double: null,
  price_triple: null,
  price_quadruple: null,

  transfer_included: null,
  flight_included:   null,
  pension: '',

  includes: [],
  excludes: [],

  program_days: [{ title: '', text: '' }],
  type: 'confort',
  status: 'Brouillon',

  departure_city: '',
  trip: '',

  // optionnel
  places_available: '',
})

const errors = ref({})

/* =========================================================
   Helpers
   ========================================================= */
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

function cityKey (s) {
  const t = norm(s)
  if (/(makkah|mecca|mecque)/.test(t))  return 'makkah'
  if (/(medina|madinah|medine)/.test(t)) return 'medina'
  return t
}
const hotelsMakkah = computed(() => hotels.value.filter(h => cityKey(h.city) === 'makkah'))
const hotelsMedina = computed(() => hotels.value.filter(h => cityKey(h.city) === 'medina'))

function normalizeMoneyText (s) {
  if (s == null) return null
  s = String(s).trim()
  if (!s) return null
  if (s.includes(',') && !s.includes('.')) return parseFloat(s.replace(',', '.')) || null
  return parseFloat(s) || null
}
const cleanList = arr => (arr || []).map(s => String(s || '').trim()).filter(Boolean)

/* =========================================================
   Chargement Hôtels
   ========================================================= */
async function loadHotels () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('admin/hotels')
    hotels.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Erreur chargement hôtels'
  } finally {
    loading.value = false
  }
}
onMounted(loadHotels)

/* =========================================================
   Upload image principale
   ========================================================= */
const fileInput = ref(null)
async function onPickFile (e) {
  const file = e.target.files?.[0]
  if (!file) return

 // Révoquer seulement l'APERÇU PRÉCÉDENT, pas celui qu'on vient de créer
 if (_revoke) { URL.revokeObjectURL(_revoke); _revoke = null }
 const localUrl = URL.createObjectURL(file)
 previewSrc.value = localUrl
 // Mémoriser pour le révoquer plus tard (au prochain choix fichier)
 _revoke = localUrl
 

  // 2) Upload
  const fd = new FormData()
  fd.append('file', file)
  try {
    const { data } = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

    // 3) Récupère la bonne clé selon la réponse backend
    const returned = data?.url || data?.path || data?.file || data?.location || ''
    if (!returned) throw new Error('Réponse upload invalide (pas d’URL).')

    form.value.image_path = returned
 const abs = toAbsoluteUrl(returned)
 // On précharge l'image serveur: si elle charge => on bascule, sinon on garde l'aperçu local
 try {
   await new Promise((resolve, reject) => {
     const img = new Image()
     img.onload = () => resolve()
     img.onerror = reject
     img.src = abs
   })
   previewSrc.value = abs
 } catch {
   // On garde le preview local si l’URL serveur n’est pas encore accessible
   console.warn('Image serveur non accessible pour le moment, on garde le preview local:', abs)
 }
    
  } catch (err) {
    openError(err?.response?.data?.message || err?.message || 'Upload impossible')
  }
}


/* =========================================================
   Dates / Durée
   ========================================================= */
const pad2  = n => String(n).padStart(2, '0')
const toISO = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`
const lastDayOf = (y, m) => new Date(y, m, 0).getDate()

const todayISO = computed(() => {
  const d = new Date(); d.setHours(0,0,0,0)
  return toISO(d.getFullYear(), d.getMonth() + 1, d.getDate())
})
const addDays = (iso, days) => {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const tomorrowISO = computed(() => addDays(todayISO.value, 1))

const monthStartISO = computed(() => {
  const y = Number(form.value.year), m = Number(form.value.month)
  return (y && m) ? toISO(y, m, 1) : ''
})
const monthEndISO = computed(() => {
  const y = Number(form.value.year), m = Number(form.value.month)
  return (y && m) ? toISO(y, m, lastDayOf(y, m)) : ''
})
const monthIsPast = computed(() =>
  !!monthEndISO.value && monthEndISO.value < tomorrowISO.value
)

// bornes du départ
const departMin = computed(() => {
  if (monthIsPast.value) return ''
  const start = monthStartISO.value || tomorrowISO.value
  return start < tomorrowISO.value ? tomorrowISO.value : start
})
const departMax = computed(() => monthIsPast.value ? '' : monthEndISO.value)

// bornes du retour
const returnMin = computed(() => form.value.date_start ? addDays(form.value.date_start, 1) : '')
const returnMax = computed(() => {
  const y = Number(form.value.year), m = Number(form.value.month)
  return (y && m) ? toISO(y, m, lastDayOf(y, m)) : ''
})

// ✅ Durée = (fin - début) + 1 jour
const durationDays = computed(() => {
  if (!form.value.date_start || !form.value.date_end) return 0
  const s = new Date(form.value.date_start)
  const e = new Date(form.value.date_end)
  const d = Math.round((e - s) / 86400000) + 1
  return d > 0 ? d : 0
})

// ✅ Total max de nuits = durée - 1
const nightsLimit = computed(() =>
  durationDays.value > 0 ? durationDays.value - 1 : 0
)

/* Si l’utilisateur change l’année/mois/départ/retour -> on garde la saisie,
   mais on recalculera Médine plus bas. */
watch([() => form.value.year, () => form.value.month], () => {
  const s = form.value.date_start
  if (s && (s < departMin.value || (departMax.value && s > departMax.value))) form.value.date_start = ''
  const r = form.value.date_end
  if (r && (r < returnMin.value || (returnMax.value && r > returnMax.value))) form.value.date_end = ''
})
watch(() => form.value.date_start, () => {
  const r = form.value.date_end
  if (r && r < returnMin.value) form.value.date_end = ''
})

watch(
  [() => form.value.makkah_nights, () => durationDays.value],
  () => {
    const limit = Math.max(0, Number(nightsLimit.value || 0)) // durée - 1
    let mk = Number(form.value.makkah_nights || 0)
    if (!Number.isFinite(mk) || mk < 0) mk = 0
    if (mk > limit) mk = limit
    if (mk !== form.value.makkah_nights) form.value.makkah_nights = mk

    // si tu calcules Médine automatiquement :
    form.value.medina_nights = Math.max(0, limit - mk)
  },
  { immediate: true }
)


/* =========================================================
   Étoiles
   ========================================================= */
const makkahStars = computed(() =>
  hotels.value.find(h => h.id === form.value.makkah_hotel_id)?.stars || null
)
const medinaStars = computed(() =>
  hotels.value.find(h => h.id === form.value.medina_hotel_id)?.stars || null
)

/* =========================================================
   Programme
   ========================================================= */
function addProgramDay () {
  const max = durationDays.value || 60
  if (form.value.program_days.length >= max) {
    errors.value.program_days = `Maximum ${max} jours (durée du voyage).`
    return
  }
  form.value.program_days.push({ title: '', text: '' })
}
function removeProgramDay (idx) {
  form.value.program_days.splice(idx, 1)
  if (!form.value.program_days.length) {
    form.value.program_days.push({ title: '', text: '' })
  }
}
const cleanedProgramDays = computed(() =>
  form.value.program_days
    .map(d => ({ title: (d.title || '').trim(), text: (d.text || '').trim() }))
    .filter(d => d.title || d.text)
    .map((d, i) => ({ day: i + 1, ...d }))
)
watch(cleanedProgramDays, (pd) => {
  if (!pd.length) errors.value.program_days = 'Ajoutez au moins une ligne de programme (titre et/ou texte).'
  else if (errors.value.program_days) delete errors.value.program_days
}, { immediate: true })

/* =========================================================
   Statut
   ========================================================= */
function normalizeStatus (s) {
  const t = String(s ?? '').toLowerCase()
  if (['publier', 'published', 'publié', 'publie'].includes(t)) return 'Publier'
  if (['archiver', 'archived', 'archivé', 'archive'].includes(t)) return 'Archiver'
  return 'Brouillon'
}

/* =========================================================
   Validation (assouplie)
   ========================================================= */
const depError = computed(() => {
  const v = form.value.date_start
  if (!v) return ''
  return v <= todayISO.value ? 'La date de départ doit être postérieure à aujourd’hui.' : ''
})
const endError = computed(() => {
  const s = form.value.date_start, e = form.value.date_end
  if (!s || !e) return ''
  return e < s ? 'La date de retour doit être après la date de départ.' : ''
})

const allOmras = ref([])
onMounted(async () => {
  try {
    const { data } = await api.get('/admin/omras')
    allOmras.value = Array.isArray(data) ? data : []
  } catch {}
})
const nameTaken = computed(() => {
  const current = norm(form.value.title)
  if (!current) return false
  return allOmras.value.some(o => norm(o.title ?? o.name) === current)
})

function validate () {
  const f = form.value
  const e = {}

  if (!f.title.trim()) e.title = 'Nom obligatoire.'
  else if (nameTaken.value) e.title = 'Ce nom d’Omra existe déjà.'

  if (!f.image_path) e.image_path = 'Image obligatoire.'
  if (!f.month) e.month = 'Choisissez un mois.'
  if (f.year == null || f.year === '' || isNaN(Number(f.year))) e.year = 'Choisissez une année.'
  else if (Number(f.year) < CURRENT_YEAR) e.year = `L’année doit être ≥ ${CURRENT_YEAR}.`

  if (!f.date_start) e.date_start = 'Date de départ obligatoire.'
  if (!f.date_end) e.date_end = 'Date de retour obligatoire.'
  if (depError.value) e.date_start = depError.value
  if (endError.value) e.date_end = endError.value

  if (!(Number(f.makkah_hotel_id) > 0)) e.makkah_hotel_id = 'Choisissez un hôtel à Makkah.'
  if (!(Number(f.medina_hotel_id) > 0)) e.medina_hotel_id = 'Choisissez un hôtel à Médine.'

  // ✅ Autorise 0 nuit, mais interdit le négatif
  if (Number(f.makkah_nights) < 0) e.makkah_nights = 'Nuits à Makkah ≥ 0.'
  if (Number(f.medina_nights) < 0) e.medina_nights = 'Nuits à Médine ≥ 0.'

  errors.value = e
  return Object.keys(e).length === 0
}

/* =========================================================
   Popup feedback
   ========================================================= */
const showAlert = ref(false)
const alertData = ref({ variant: 'success', title: 'Succès', message: '', primaryText: 'OK' })
let lastAlertWasSuccess = false
function openSuccess (msg) {
  alertData.value = { variant: 'success', title: 'Succès', message: msg || 'Créée avec succès.', primaryText: 'OK' }
  lastAlertWasSuccess = true
  showAlert.value = true
}
function openError (msg) {
  alertData.value = { variant: 'error', title: 'Erreur', message: msg || 'Merci de corriger les champs en rouge.', primaryText: 'Fermer' }
  lastAlertWasSuccess = false
  showAlert.value = true
}
function onAlertClosed (v) {
  if (!v && lastAlertWasSuccess) {
    window?.$router ? window.$router.push('/admin/omras') : (location.href = '/admin/omras')
  }
}
function openFormErrorsPopup () {
  const msgs = Object.values(errors.value || {}).flat().filter(Boolean)
  const preview = msgs.slice(0, 4)
  const extra = msgs.length > 4 ? `\n…et ${msgs.length - 4} autre(s).` : ''
  openError(preview.length ? `Veuillez corriger :\n• ${preview.join('\n• ')}${extra}` : 'Merci de corriger les champs en rouge.')
  nextTick(() => {
    const firstInvalid = document.querySelector('.invalid') || document.querySelector('[aria-invalid="true"]')
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstInvalid.focus?.()
    }
  })
}

/* =========================================================
   🔁 Calcul auto : Médine = max(0, (durée - 1) - Makkah)
   - On ne touche JAMAIS à la valeur saisie pour Makkah
   - Si la durée n’est pas définie (0), Médine = 0
   ========================================================= */
watch(
  [() => form.value.makkah_nights, () => durationDays.value],
  () => {
    const limit = Math.max(0, Number(nightsLimit.value || 0)) // durée - 1
    const mk    = Math.max(0, Number(form.value.makkah_nights || 0))
    form.value.medina_nights = Math.max(0, limit - mk)
  },
  { immediate: true }
)

/* =========================================================
   Actions
   ========================================================= */

async function save () {
  if (!validate()) { openFormErrorsPopup(); return }

  const p = form.value
  const payload = {
    title: p.title.trim(),
    description: p.description || null,
    image_path: p.image_path || null,
    month: p.month ? String(p.month) : '',
    year: Number(p.year),

    date_start: p.date_start,
    date_end:   p.date_end,

    makkah_hotel_id: Number(p.makkah_hotel_id) || null,
    medina_hotel_id: Number(p.medina_hotel_id) || null,
    makkah_nights: Number(p.makkah_nights),
    medina_nights: Number(p.medina_nights),

    price_from:      normalizeMoneyText(p.price_from),
    price_single:    normalizeMoneyText(p.price_single),
    price_double:    normalizeMoneyText(p.price_double),
    price_triple:    normalizeMoneyText(p.price_triple),
    price_quadruple: normalizeMoneyText(p.price_quadruple),

    transfer_included: !!p.transfer_included,
    flight_included:   !!p.flight_included,
    pension: p.pension,

    includes: cleanList(p.includes),
    excludes: cleanList(p.excludes),

    program_days: cleanedProgramDays.value,

    type: p.type,
    status: normalizeStatus(p.status) || 'Brouillon',

    departure_city: (p.departure_city || '').trim() || null,
    trip: (p.trip || '').trim() || null,

    places_available: (p.places_available || '').trim() || null,
  }
  if (durationDays.value > 0 && Number(form.value.makkah_nights) >= durationDays.value) {
  errors.value.makkah_nights = `Nuits à Makkah doit être < durée (${durationDays.value}).`
    }


  try {
    await api.post('/admin/omras', payload)
    openSuccess(`L’omra « ${p.title.trim()} » a été créée avec succès.`)
  } catch (e) {
    const apiMsg =
      e?.response?.data?.message ||
      (e?.response?.data?.errors && Object.values(e.response.data.errors).flat()[0]) ||
      e?.message || 'Erreur lors de la création.'
    openError(apiMsg)
  }
}

// ouverture forcée du datepicker
function forceOpenPicker (e) {
  const el = (e.currentTarget || e.target)
  requestAnimationFrame(() => {
    if (el && typeof el.showPicker === 'function') {
      try { el.showPicker() } catch {}
    } else if (el?.focus) {
      el.focus()
    }
  })
}


function cancel(){ router.push({ path: '/admin/omras' }) }


const previewSrc = ref('')  // URL d’aperçu locale (ObjectURL)

function toAbsoluteUrl(u) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  // Si l’API renvoie un chemin relatif (/uploads/xxx.jpg)
  const base = api?.defaults?.baseURL?.replace(/\/+$/,'') || ''
  if (!base) return u
  return u.startsWith('/') ? base + u : `${base}/${u}`
}

let _revoke = null
onUnmounted(() => { if (_revoke) URL.revokeObjectURL(_revoke) })




/* boutons “+ ligne” pour les listes inclut/exclut */
function addInclude () { form.value.includes.push('') }
function removeInclude (i) { form.value.includes.splice(i, 1) }
function addExclude () { form.value.excludes.push('') }
function removeExclude (i) { form.value.excludes.splice(i, 1) }
</script>

<template>
  <main class="content omra-create">
    <div class="card table-card">
      <h2 class="page-title">Ajouter une Omra</h2>

      <form @submit.prevent="save" class="form">
        <!-- Titre -->
        <div class="row-1">
          <div class="field">
            <label for="f-title">Titre *</label>
            <input id="f-title" v-model="form.title" :class="{invalid: errors.title}" required />
            <small class="error" v-if="errors.title">{{ errors.title }}</small>
          </div>
        </div>

        <!-- Description -->
        <div class="row-1">
          <div class="field">
            <label for="f-desc">Description</label>
            <textarea id="f-desc" v-model="form.description" rows="3" placeholder="Programme, inclus, etc."></textarea>
          </div>
        </div>

        <!-- Ville de départ -->
        <div class="row-1">
          <div class="field">
            <label for="f-depCity">Ville de départ</label>
            <input id="f-depCity" v-model="form.departure_city" placeholder="ex : Paris"/>
          </div>
        </div>

        <!-- Places disponibles (optionnel) -->
        <div class="row-1">
          <div class="field">
            <label for="f-places">Places disponibles</label>
            <textarea
              id="f-places"
              v-model="form.places_available"
              rows="2"
              placeholder="Ex : 25 places (maj 29/10), liste d’attente : 5"
            ></textarea>
          </div>
        </div>

        <!-- Séjour -->
        <div class="row-1">
          <div class="field">
            <label for="f-trip">Séjour (trip)</label>
            <input id="f-trip" v-model="form.trip" rows="4" placeholder="Détails du séjour…"/>
          </div>
        </div>

        <!-- Prix à partir -->
        <div class="row-1">
          <div class="field">
            <label for="f-priceFrom">Prix à partir de (€)</label>
            <input id="f-priceFrom" v-model="form.price_from" type="text" placeholder="ex: 1 299,50 €" />
          </div>
        </div>

        <!-- Image + aperçu -->
        <div class="row-2 row-image">
          <div class="field">
            <label for="f-imageFile">Image (depuis l'appareil) *</label>
            <input id="f-imageFile" ref="fileInput" type="file" accept="image/*"
                   @change="onPickFile" :class="{invalid: errors.image_path}" />
            <small class="muted">JPG/PNG/WEBP, max 4 Mo</small>
            <small class="error" v-if="errors.image_path">{{ errors.image_path }}</small>
          </div>

          <div class="field">
  <label>Aperçu</label>
  <div class="preview-box">
    <img
      v-if="previewSrc || form.image_path"
      :src="previewSrc || toAbsoluteUrl(form.image_path)"
      alt="Aperçu"
      class="preview-img"
    />
    <span v-else class="muted">Aucune image</span>
  </div>
</div>

        </div>

        <!-- Année + Mois -->
        <div class="row-2">
          <div class="field">
            <label for="omra-year">Année *</label>
            <select id="omra-year" v-model="form.year">
              <option :value="null">— Choisir —</option>
              <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div class="field">
            <label for="omra-month">Mois *</label>
            <select id="omra-month" v-model="form.month" :disabled="!form.year">
              <option value="">— Choisir —</option>
              <option
                v-for="m in monthsForSelectedYear"
                :key="m.value"
                :value="String(m.value)"
                :disabled="m.disabled">
                {{ m.label }}
              </option>
            </select>
            <small class="muted" v-if="form.year === CURRENT_YEAR">
              Les mois avant {{ MONTHS[CURRENT_MONTH - 1].label.toLowerCase() }} {{ CURRENT_YEAR }} sont indisponibles.
            </small>
          </div>
        </div>

        <!-- Départ + Retour -->
        <div class="row-2">
          <div class="field">
            <label for="depart">Date de départ *</label>
            <input
              id="depart"
              type="date"
              v-model="form.date_start"
              :min="departMin"
              :max="departMax"
              :disabled="!form.year || !form.month || monthIsPast"
              @focus="forceOpenPicker" @click="forceOpenPicker"
              @keydown.space.prevent="forceOpenPicker" @keydown.enter.prevent="forceOpenPicker"
              :class="{ invalid: errors.date_start }"
              placeholder="jj / mm / aaaa"
            />
            <small class="error" v-if="errors.date_start">{{ errors.date_start }}</small>
            <small class="error" v-else-if="monthIsPast">Le mois choisi est déjà passé.</small>
            <small class="muted" v-else-if="departMin">Départ possible à partir du {{ departMin }}.</small>
          </div>

          <div class="field">
            <label for="retour">Date de retour *</label>
            <input
  id="retour"
  type="date"
  v-model="form.date_end"
  :min="form.date_start ? addDays(form.date_start, 1) : ''"
  :disabled="!form.date_start"
  @focus="forceOpenPicker"
  @click="forceOpenPicker"
  @keydown.space.prevent="forceOpenPicker"
  @keydown.enter.prevent="forceOpenPicker"
  placeholder="jj / mm / aaaa"
/>

          </div>
        </div>

        <!-- Durée auto -->
        <div class="row-1">
          <div class="field">
            <label>Durée du voyage</label>
            <div class="readonly"><strong>{{ durationDays }}</strong> jour(s)</div>
          </div>
        </div>

        <!-- Type + Statut -->
        <div class="row-2">
          <div class="field">
            <label for="omra-type">Type d’Omra *</label>
            <select
              id="omra-type"
              v-model="form.type"
              class="type-select"
              :class="{
                'is-economique': form.type === 'economique',
                'is-confort':    form.type === 'confort',
                'is-ramadan':    form.type === 'ramadan'
              }">
              <option value="economique">Omra économique</option>
              <option value="confort">Omra confort</option>
              <option value="ramadan">Omra Ramadan</option>
            </select>
            <small class="error" v-if="errors.type">{{ errors.type }}</small>
          </div>

          <div class="field">
            <label for="f-status">Statut</label>
            <select
              id="f-status"
              v-model="form.status"
              class="status-select"
              :class="{
                'is-draft':     form.status === 'Brouillon',
                'is-published': form.status === 'Publier',
                'is-archived':  form.status === 'Archiver'
              }">
              <option value="Brouillon">Brouillon</option>
              <option value="Publier">Publier</option>
              <option value="Archiver" disabled>Archiver (automatique)</option>
            </select>
            <small class="muted">Par défaut : « Brouillon ». « Archiver » est appliqué automatiquement après la date de départ.</small>
          </div>
        </div>

        <!-- Hôtels + Nuits -->
        <!-- HÔTEL + NUITS MAKKAH -->
<div class="row-2 hotel-line">
  <!-- Hôtel Makkah -->
  <div class="field">
    <label for="f-makkahHotel">Hôtel Makkah *</label>

    <!-- select + étoiles dans une même ligne -->
    <div class="hotel-select-wrap">
      <select
        id="f-makkahHotel"
        v-model.number="form.makkah_hotel_id"
        :class="{ invalid: errors.makkah_hotel_id }"
      >
        <option :value="0">— Choisir —</option>
        <option
          v-for="h in hotelsMakkah"
          :key="h.id"
          :value="h.id"
        >
          {{ h.name }} ({{ h.city || '—' }})
        </option>
      </select>

      <!-- ⭐ juste après l’hôtel, sans changer la largeur du select -->
      <span class="hotel-stars" v-if="makkahStars">
        ★ {{ makkahStars }}
      </span>
    </div>

    <small class="error" v-if="!hotelsMakkah.length">
      Aucun hôtel à Makkah trouvé.
    </small>
    <small class="error" v-if="errors.makkah_hotel_id">
      {{ errors.makkah_hotel_id }}
    </small>
  </div>

  <!-- Nuits Makkah -->
  <div class="field">
    <label for="f-makkahNights">Nuits à Makkah *</label>
    <input
      id="f-makkahNights"
      v-model.number="form.makkah_nights"
      type="number"
      min="0"
      :max="nightsLimit || 0"
      :disabled="!(Number(form.makkah_hotel_id) > 0)"
      :class="{ invalid: errors.makkah_nights }"
    />
    <small class="error" v-if="errors.makkah_nights">
      {{ errors.makkah_nights }}
    </small>
    <small class="muted" v-if="durationDays">
      Règle : Nuits Makkah + Médine &lt; {{ durationDays }} (jours)
      → total ≤ {{ nightsLimit }} nuit(s).
    </small>
  </div>
</div>

<!-- HÔTEL + NUITS MÉDINE -->
<div class="row-2 hotel-line">
  <!-- Hôtel Médine -->
  <div class="field">
    <label for="f-medinaHotel">Hôtel Médine *</label>

    <!-- select + étoiles -->
    <div class="hotel-select-wrap">
      <select
        id="f-medinaHotel"
        v-model.number="form.medina_hotel_id"
        :class="{ invalid: errors.medina_hotel_id }"
      >
        <option :value="0">— Choisir —</option>
        <option
          v-for="h in hotelsMedina"
          :key="h.id"
          :value="h.id"
        >
          {{ h.name }} ({{ h.city || '—' }})
        </option>
      </select>

      <span class="hotel-stars" v-if="medinaStars">
        ★ {{ medinaStars }}
      </span>
    </div>

    <small class="error" v-if="!hotelsMedina.length">
      Aucun hôtel à Médine trouvé.
    </small>
    <small class="error" v-if="errors.medina_hotel_id">
      {{ errors.medina_hotel_id }}
    </small>
  </div>

  <!-- Nuits Médine -->
  <div class="field">
    <label for="f-medinaNights">Nuits à Médine *</label>
    <input
      id="f-medinaNights"
      v-model.number="form.medina_nights"
      type="number"
      min="0"
      :readonly="true"
      :title="'Calculé automatiquement : (durée-1) - nuits Makkah'"
      :class="{ invalid: errors.medina_nights }"
    />
    <small class="error" v-if="errors.medina_nights">
      {{ errors.medina_nights }}
    </small>
    <small class="muted" v-if="durationDays">
      Règle : Nuits Makkah + Médine &lt; {{ durationDays }} (jours)
      → total ≤ {{ nightsLimit }} nuit(s).
    </small>
  </div>
</div>



        <!-- Tarifs -->
        <fieldset class="row-1 prices-group">
          <legend>Tarifs des chambres</legend>
          <div class="row-4">
            <div class="field">
              <label for="f-priceSingle">Single</label>
              <div class="input-euro"><input id="f-priceSingle" v-model="form.price_single" type="text" /><span>€</span></div>
            </div>
            <div class="field">
              <label for="f-priceDouble">Double</label>
              <div class="input-euro"><input id="f-priceDouble" v-model="form.price_double" type="text" /><span>€</span></div>
            </div>
            <div class="field">
              <label for="f-priceTriple">Triple</label>
              <div class="input-euro"><input id="f-priceTriple" v-model="form.price_triple" type="text" /><span>€</span></div>
            </div>
            <div class="field">
              <label for="f-priceQuad">Quadruple</label>
              <div class="input-euro"><input id="f-priceQuad" v-model="form.price_quadruple" type="text" /><span>€</span></div>
            </div>
          </div>
        </fieldset>

        <!-- Logistique -->
        <fieldset class="row-1 group">
          <legend>Logistique</legend>
          <div class="row-2">
            <div class="field">
              <label for="f-transfer">Transfert *</label>
              <select id="f-transfer" v-model="form.transfer_included" :class="{invalid: errors.transfer_included}">
                <option :value="null">— Choisir —</option>
                <option :value="true">Inclus</option>
                <option :value="false">Non inclus</option>
              </select>
              <small class="error" v-if="errors.transfer_included">{{ errors.transfer_included }}</small>
            </div>

            <div class="field">
              <label for="f-flight">Vol *</label>
              <select id="f-flight" v-model="form.flight_included" :class="{invalid: errors.flight_included}">
                <option :value="null">— Choisir —</option>
                <option :value="true">Inclus</option>
                <option :value="false">Non inclus</option>
              </select>
              <small class="error" v-if="errors.flight_included">{{ errors.flight_included }}</small>
            </div>
          </div>

          <div class="row-1">
            <div class="field">
              <label for="f-pension">Pension *</label>
              <textarea id="f-pension" v-model="form.pension" rows="2"
                        :class="{invalid: errors.pension}"
                        placeholder="Ex : Petit-déjeuner / Demi-pension / Pension complète" required />
              <small class="error" v-if="errors.pension">{{ errors.pension }}</small>
            </div>
          </div>
        </fieldset>

        <!-- Contenu du prix -->
        <fieldset class="row-2 group">
          <legend>Contenu du prix</legend>
          <div class="field prest prest-include">
            <label class="prest-title is-include">Le prix inclut</label>
            <div v-for="(item,i) in form.includes" :key="'inc-'+i" class="line-input-wrap">
              <input v-model="form.includes[i]" class="line-input" placeholder="Ex : Hébergement" />
              <button type="button" class="line-icon-btn" @click="form.includes.splice(i,1)" aria-label="Supprimer" title="Supprimer">
                <svg viewBox="0 0 24 24" class="icon-trash" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
            <button class="btn add add-include" type="button" @click="addInclude">+ Ajouter une ligne</button>
          </div>

          <div class="field prest prest-exclude">
            <label class="prest-title is-exclude">Le prix n’inclut pas</label>
            <div v-for="(item,i) in form.excludes" :key="'exc-'+i" class="line-input-wrap">
              <input v-model="form.excludes[i]" class="line-input" placeholder="Ex : Vol" />
              <button type="button" class="line-icon-btn" @click="form.excludes.splice(i,1)" aria-label="Supprimer" title="Supprimer">
                <svg viewBox="0 0 24 24" class="icon-trash" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" />
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <button class="btn add add-exclude" type="button" @click="addExclude">+ Ajouter une ligne</button>
          </div>
        </fieldset>

        <!-- Programme -->
        <fieldset class="row-1 group">
          <legend>Programme jour par jour</legend>
          <div v-for="(d, idx) in form.program_days" :key="`pd-${idx}`" class="program-row">
            <span class="program-badge">{{ idx + 1 }}</span>
            <div class="field full">
              <div class="input-with-action">
                <input v-model="d.title" class="w-full" placeholder="Titre du jour (ex. Départ, Médine...)" />
                <button type="button" class="icon-btn delete" @click="removeProgramDay(idx)" aria-label="Supprimer" title="Supprimer">
                  <svg viewBox="0 0 24 24" class="icon-trash" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
              <textarea v-model="d.text" rows="3" placeholder="Description du programme…" />
            </div>
          </div>
          <div class="row-1">
            <button class="btn-add" type="button" @click="addProgramDay">+ Ajouter un jour</button>
          </div>
          <small class="error" v-if="errors.program_days">{{ errors.program_days }}</small>
        </fieldset>

        <!-- Actions -->
        <div class="row-1 actions">
          <button class="btn btn-lg" type="submit">Ajouter</button>
          <button class="btn ghost" type="button" @click="cancel">Annuler</button>
        </div>

        <!-- Popup -->
        <AlertPopup
          v-model="showAlert"
          :variant="alertData.variant"
          :title="alertData.title"
          :message="alertData.message"
          :primary-text="alertData.primaryText"
          @update:modelValue="onAlertClosed"
        />
      </form>
    </div>
  </main>
</template>

<style scoped src="@/assets/styles/AdminOmra.css"></style>
<style scoped src="@/assets/styles/AdminCommon.css"></style>
<style scoped>
.omra-create {
  padding: 20px;
  background: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
}
.table-card .page-title {
  margin: 0 0 14px;
  color: #1e3a8a;
  font-weight: 700;
}


.omra-create {
  padding: 20px;
  background: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
}
.table-card .page-title {
  margin: 0 0 14px;
  color: #1e3a8a;
  font-weight: 700;
}


</style>

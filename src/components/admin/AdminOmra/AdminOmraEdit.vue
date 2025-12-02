<!-- src/pages/admin/AdminOmraEdit.vue -->
<script setup>
/* =========================================================
   Imports
   ========================================================= */
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'       // ✅ CORRECT
import FlashBanner from '@/components/ui/FlashBanner.vue'
import AlertPopup from '@/components/popups/AlertPopup.vue'
import { useFlash } from '@/composables/useFlash'

/* =========================================================
   Instances & helpers globaux
   ========================================================= */
const route = useRoute()
const router = useRouter()
const { error: flashError } = useFlash()

/* ---- Date système et bornes ---- */
const now = new Date()
const CURRENT_YEAR  = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1 // 1..12

/* Utilitaires date (ISO) */
const pad2  = n => String(n).padStart(2, '0')
const toISO = (y,m,d) => `${y}-${pad2(m)}-${pad2(d)}`
const lastDayOf = (y,m) => new Date(y, m, 0).getDate()
const addDays = (iso, days) => {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toISO(d.getFullYear(), d.getMonth()+1, d.getDate())
}
const todayISO = computed(() => {
  const d = new Date(); d.setHours(0,0,0,0)
  return toISO(d.getFullYear(), d.getMonth()+1, d.getDate())
})
const tomorrowISO = computed(() => addDays(todayISO.value, 1))

/* =========================================================
   State
   ========================================================= */
const loading = ref(false)
const hotels  = ref([])
const errors  = ref({})
const allOmras = ref([]) // pour vérifier l’unicité du titre

// flags pour ignorer les watchers pendant le chargement / respecter choix utilisateur
const isBootstrapping = ref(false)
const statusTouchedByUser = ref(false)

/* Formulaire (valeurs par défaut sûres) */
const form = ref({
  id: null,
  title: '',
  description: '',
  image_path: '',
  month: '',
  year: CURRENT_YEAR,
  date_start: '',
  date_end: '',
  makkah_hotel_id: 0,
  medina_hotel_id: 0,
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
  program_days: [{ title: '', text: '' }], // facultatif, peut rester vide
  type: 'confort',
  status: 'Brouillon',
  departure_city: '',
  trip: '',
})

/* =========================================================
   Dérivés d’affichage / formulaires
   ========================================================= */
// années (présent → +5)
const YEARS = computed(() => {
  const max = CURRENT_YEAR + 5
  return Array.from({length: max - CURRENT_YEAR + 1}, (_,i) => CURRENT_YEAR + i)
})

const MONTHS = [
  { value: 1,  label: 'Janvier'   },
  { value: 2,  label: 'Février'   },
  { value: 3,  label: 'Mars'      },
  { value: 4,  label: 'Avril'     },
  { value: 5,  label: 'Mai'       },
  { value: 6,  label: 'Juin'      },
  { value: 7,  label: 'Juillet'   },
  { value: 8,  label: 'Août'      },
  { value: 9,  label: 'Septembre' },
  { value: 10, label: 'Octobre'   },
  { value: 11, label: 'Novembre'  },
  { value: 12, label: 'Décembre'  },
]

/* Mois disponibles selon l’année choisie */
const monthsForSelectedYear = computed(() =>
  MONTHS.map(m => ({
    ...m,
    disabled: !form.value.year ||
      (Number(form.value.year) === CURRENT_YEAR && Number(m.value) < CURRENT_MONTH)
  }))
)

/* Bornes liées au mois sélectionné */
const monthStartISO = computed(() => {
  const y = Number(form.value.year), m = Number(form.value.month)
  return (y && m) ? toISO(y, m, 1) : ''
})
const monthEndISO = computed(() => {
  const y = Number(form.value.year), m = Number(form.value.month)
  return (y && m) ? toISO(y, m, lastDayOf(y, m)) : ''
})
const monthIsPast = computed(() => !!monthEndISO.value && monthEndISO.value < tomorrowISO.value)

/* Bornes des date pickers */
const departMin = computed(() => {
  if (monthIsPast.value) return ''
  const start = monthStartISO.value || tomorrowISO.value
  return start < tomorrowISO.value ? tomorrowISO.value : start
})
const departMax = computed(() => monthIsPast.value ? '' : monthEndISO.value)
const returnMin = computed(() => form.value.date_start ? addDays(form.value.date_start, 1) : '')
const returnMax = computed(() => {
  const y = Number(form.value.year), m = Number(form.value.month)
  return (y && m) ? toISO(y, m, lastDayOf(y, m)) : ''
})

/* Durée calculée (jours) */
const durationDays = computed(() => {
  if (!form.value.date_start || !form.value.date_end) return 0
  const s = new Date(form.value.date_start)
  const e = new Date(form.value.date_end)
  const d = Math.round((e - s)/86400000) + 1
  return d > 0 ? d : 0
})

/* Étoiles affichées à côté des selects */
const norm = s => String(s || '')
  .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
const cityKey = s => {
  const t = norm(s)
  if (/(makkah|mecca|mecque)/.test(t))  return 'makkah'
  if (/(medina|madinah|medine)/.test(t)) return 'medina'
  return t
}
const hotelsMakkah = computed(() => hotels.value.filter(h => cityKey(h.city) === 'makkah'))
const hotelsMedina = computed(() => hotels.value.filter(h => cityKey(h.city) === 'medina'))
const makkahStars  = computed(() => hotels.value.find(h => h.id === form.value.makkah_hotel_id)?.stars || null)
const medinaStars  = computed(() => hotels.value.find(h => h.id === form.value.medina_hotel_id)?.stars || null)

/* Nuits : somme & contrainte (total < durée) */
const totalNights  = computed(() =>
  Number(form.value.makkah_nights || 0) + Number(form.value.medina_nights || 0)
)
const nightsLimit  = computed(() => durationDays.value ? durationDays.value - 1 : 0)

/* =========================================================
   Chargement API
   ========================================================= */
async function loadHotels(){
  try{
    const { data } = await api.get('/admin/hotels')
    hotels.value = Array.isArray(data) ? data : []
  }catch{/* noop */}
}

async function loadAllOmras(){
  try {
    const { data } = await api.get('/admin/omras')
    allOmras.value = Array.isArray(data) ? data : []
  } catch {/* noop */}
}

async function loadOne(id){
  try{
    isBootstrapping.value = true
    loading.value = true
    const { data } = await api.get(`/admin/omras/${id}`)

    form.value = {
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      image_path: data.image_path || '',
      month: (data.month ?? '').toString(),
      year: data.year ?? CURRENT_YEAR,
      date_start: data.date_start || '',
      date_end:   data.date_end   || '',
      makkah_hotel_id: Number(data.makkah_hotel_id) || 0,
      medina_hotel_id: Number(data.medina_hotel_id) || 0,
      makkah_nights: Number(data.makkah_nights) || 0,
      medina_nights: Number(data.medina_nights) || 0,
      price_from:      data.price_from ?? null,
      price_single:    data.price_single ?? null,
      price_double:    data.price_double ?? null,
      price_triple:    data.price_triple ?? null,
      price_quadruple: data.price_quadruple ?? null,
      transfer_included: data.transfer_included ?? null,
      flight_included:   data.flight_included   ?? null,
      pension: data.pension || '',
      includes: Array.isArray(data.includes) ? data.includes.map(s => String(s ?? '')) : [],
      excludes: Array.isArray(data.excludes) ? data.excludes.map(s => String(s ?? '')) : [],
      program_days: Array.isArray(data.program_days) && data.program_days.length
        ? data.program_days.map(d => ({ title: d.title || '', text: d.text || '' }))
        : [{ title:'', text:'' }],
      type: data.type || 'confort',
      status: normalizeStatus(data.status) || 'Brouillon',
      departure_city: data.departure_city || '',
      trip: data.trip || '',
    }
    previewSrc.value = toAbsoluteUrl(form.value.image_path) || ''

    errors.value = {}
  }catch(e){
    flashError(`Impossible de charger cette Omra (id=${id}).`)
    router.replace({ path: '/admin/omras' })
  }finally{
    loading.value = false
    await nextTick()
    isBootstrapping.value = false
    statusTouchedByUser.value = false
  }
}

/* Boot */
onMounted(async () => {
  const raw = route.params.id ?? route.query?.id
  const id = Number(raw)
  if (!Number.isFinite(id) || id <= 0) {
    flashError(`Identifiant invalide (reçu: ${raw}).`)
    return router.replace({ path: '/admin/omras' })
  }
  await Promise.all([loadHotels(), loadAllOmras(), loadOne(id)])
})
watch(() => route.params.id, id => {
  const n = Number(id)
  if (Number.isFinite(n) && n > 0) loadOne(n)
})

/* =========================================================
   Upload image (optionnel)
   ========================================================= */
const fileInput = ref(null)

async function onPickFile(e){
  const { data } = await api.post('/uploads', fd)

  const file = e.target.files?.[0]
  if (!file) return

  // validations côté front
  const MAX_MB = 4
  const allowed = ['image/jpeg','image/png','image/webp']
  if (!allowed.includes(file.type)) { flashError('Format non supporté (JPEG, PNG ou WEBP).'); return }
  if (file.size > MAX_MB * 1024 * 1024) { flashError(`Fichier trop volumineux (> ${MAX_MB} Mo).`); return }

  // aperçu local
  if (_revoke) { URL.revokeObjectURL(_revoke); _revoke = null }
  const localUrl = URL.createObjectURL(file)
  previewSrc.value = localUrl
  _revoke = localUrl

  // FormData : on envoie **file** (car ton backend a déjà répondu “The file field is required.”)
  const fd = new FormData()
  fd.append('file', file, file.name)

  try {
    // ⚠️ Utilise bien le chemin EXACT de ta route (souvent '/uploads')
    const { data, status } = await api.post('/uploads', fd, {
      headers: { /* NE PAS forcer application/json ici */ 'Content-Type': 'multipart/form-data' },
      transformRequest: v => v, // laisse passer le FormData
      withCredentials: true     // utile si Sanctum/CSRF
    })

    const returned = data?.url || data?.path || data?.file || data?.location || ''
    if (!returned) throw new Error('Réponse upload invalide (pas d’URL).')

    form.value.image_path = returned
    const abs = toAbsoluteUrl(returned)
    await new Promise((res, rej) => { const img = new Image(); img.onload = res; img.onerror = rej; img.src = abs })
    previewSrc.value = abs
  } catch (err) {
    const st = err?.response?.status
    const srv = err?.response?.data
    console.warn('UPLOAD ERROR', st, srv, err)

    // messages utiles selon le code
    if (st === 422) {
      // Validation Laravel
      const msg = (srv?.message) ||
                  (srv?.errors && Object.values(srv.errors).flat()[0]) ||
                  'Validation échouée.'
      flashError(msg); return
    }
    if (st === 413) {
      // Payload Too Large → PHP.ini
      flashError('Fichier trop grand pour le serveur (413). Augmente upload_max_filesize / post_max_size.'); return
    }
    if (st === 401 || st === 419) {
      flashError('Non autorisé / CSRF. Vérifie le jeton ou la session.'); return
    }
    // fallback
    flashError(srv?.message || err?.message || 'Upload impossible')
  }
}







/* =========================================================
   Validations (mêmes règles que la création — sauf programme devenu optionnel)
   ========================================================= */
const depError = computed(() => {
  const v = form.value.date_start
  if (!v) return ''
  // En édition, on peut autoriser une date passée
  return ''
})
const endError = computed(() => {
  const s = form.value.date_start, e = form.value.date_end
  if (!s || !e) return ''
  return e < s ? 'La date de retour doit être après la date de départ.' : ''
})

/* Nom Omra unique (insensible accents/majuscules/espaces) */
const normName = s => String(s||'').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/\s+/g,' ').trim()

const nameTaken = computed(() => {
  const current = normName(form.value.title)
  if (!current) return false
  return allOmras.value.some(o =>
    (o.id !== form.value.id) && normName(o.title ?? o.name) === current
  )
})

/* Nettoyage listes et programme */
const cleanList = (arr) => (arr || []).map(s => String(s || '').trim()).filter(Boolean)
const cleanedProgramDays = computed(() =>
  form.value.program_days
    .map(d => ({ title:(d.title||'').trim(), text:(d.text||'').trim() }))
    .filter(d => d.title || d.text)               // ← programme facultatif (peut rester vide)
    .map((d,i) => ({ day: i+1, ...d }))
)

/* Type/Statut helpers */
const ALLOWED_TYPES = ['economique', 'confort', 'ramadan']
function normalizeStatus(s){
  const t = String(s ?? '').toLowerCase()
  if (['publier','published','publié','publie'].includes(t)) return 'Publier'
  if (['archiver','archived','archivé','archive'].includes(t)) return 'Archiver'
  return 'Brouillon'
}

/* Validation globale */
function validate(){
  const f = form.value
  const e = {}

  if (!f.title.trim()) e.title = 'Nom obligatoire.'
  else if (nameTaken.value) e.title = 'Ce nom d’Omra existe déjà.'

  if (!f.image_path) e.image_path = 'Image obligatoire.'
  if (!f.month)      e.month      = 'Mois obligatoire.'
  if (f.year == null || f.year === '' || isNaN(Number(f.year))) {
    e.year = 'Année obligatoire.'
  } else if (Number(f.year) < CURRENT_YEAR) {
    e.year = `L’année doit être ≥ ${CURRENT_YEAR}.`
  }

  if (!f.date_start) e.date_start = 'Date de départ obligatoire.'
  if (!f.date_end)   e.date_end   = 'Date de retour obligatoire.'
  if (depError.value) e.date_start = depError.value
  if (endError.value) e.date_end   = endError.value

  if (!(Number(f.makkah_hotel_id) > 0)) e.makkah_hotel_id = 'Choisissez un hôtel à Makkah.'
  if (!(Number(f.medina_hotel_id) > 0)) e.medina_hotel_id = 'Choisissez un hôtel à Médine.'
 

  if (durationDays.value > 0 && Number(f.makkah_nights) >= durationDays.value) {
  e.makkah_nights = `Nuits à Makkah doit être < durée (${durationDays.value}).`
}
if (Number(f.medina_nights) < 0) {
  e.medina_nights = 'Nuits à Médine ≥ 0.'
}
  if (f.transfer_included === null) e.transfer_included = 'Choisissez Transfert (Inclus / Non).'
  if (f.flight_included   === null) e.flight_included   = 'Choisissez Vol (Inclus / Non).'
  if (!f.pension.trim())            e.pension           = 'Pension obligatoire.'

  if (!ALLOWED_TYPES.includes(String(f.type || ''))) {
    e.type = 'Choisissez un type valide.'
  }

  // ❌ plus d’erreur sur program_days : c’est optionnel

  errors.value = e
  return Object.keys(e).length === 0
}

/* Maintien des contraintes quand année/mois/dates changent */
watch([() => form.value.year, () => form.value.month], () => {
  // ⛔ Ne touche pas aux dates pendant le chargement initial
  if (isBootstrapping.value) return

  const s = form.value.date_start
  if (s && (s < departMin.value || (departMax.value && s > departMax.value))) {
    form.value.date_start = ''
  }

  const r = form.value.date_end
  if (r && (r < returnMin.value || (returnMax.value && r > returnMax.value))) {
    form.value.date_end = ''
  }
})

watch(() => form.value.date_start, () => {
  // ⛔ Pareil : ne pas casser la date de retour pendant le chargement
  if (isBootstrapping.value) return

  const r = form.value.date_end
  if (r && r < returnMin.value) {
    form.value.date_end = ''
  }
})

/* L’utilisateur modifie explicitement le statut ⇒ ne plus auto-changer */
watch(() => form.value.status, (nv, ov) => {
  if (isBootstrapping.value) return
  if (nv !== ov) statusTouchedByUser.value = true
})

/* =========================================================
   Pop-up unifiée (succès / erreur) + redirection conditionnelle
   ========================================================= */
const showAlert = ref(false)
const alertData = ref({
  variant: 'success',
  title: 'Succès',
  message: '',
  primaryText: 'OK',
})
const lastAlertWasSuccess = ref(false) // ← flag interne

function openSuccess(msg){
  lastAlertWasSuccess.value = true
  alertData.value = { variant:'success', title:'Succès', message: msg || 'Opération effectuée.', primaryText:'OK' }
  showAlert.value = true
}
function openError(msg){
  lastAlertWasSuccess.value = false
  alertData.value = { variant:'error', title:'Erreur', message: msg || 'Merci de corriger les champs en rouge.', primaryText:'Fermer' }
  showAlert.value = true
}
function onAlertClosed (v) {
  // v === false quand la popup se ferme
  if (!v && lastAlertWasSuccess.value) {
    router.push('/admin/omras')
  }
}

/* Pop-up dédiée aux erreurs de validation */
function openFormErrorsPopup(){
  const msgs = Object.values(errors.value || {}).flat().filter(Boolean)
  const preview = msgs.slice(0, 4)
  const extra = msgs.length > 4 ? `\n…et ${msgs.length - 4} autre(s).` : ''
  openError(preview.length ? `Veuillez corriger :\n• ${preview.join('\n• ')}${extra}` : undefined)

  nextTick(() => {
    const firstInvalid =
      document.querySelector('.invalid') ||
      document.querySelector('[aria-invalid="true"]')
    firstInvalid?.scrollIntoView({ behavior:'smooth', block:'center' })
    firstInvalid?.focus?.()
  })
}

/* =========================================================
   Actions
   ========================================================= */
function cancel(){ router.push({ path: '/admin/omras' }) }

function normalizeMoneyText(s){
  if (s == null) return null
  s = String(s).trim()
  if (!s) return null
  if (s.includes(',') && !s.includes('.')) return parseFloat(s.replace(',', '.')) || null
  return parseFloat(s) || null
}

async function save(){
  // 1) Validation front
  if (!validate()){
    openFormErrorsPopup()
    return
  }

  const p = form.value
  const payload = {
    title: p.title.trim(),
    description: p.description || null,
    image_path: p.image_path || null,
    month: p.month ? String(p.month) : null,
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
    type: p.type || null,
    program_days: cleanedProgramDays.value,  // ← peut être []
    status: normalizeStatus(p.status) || 'Brouillon',
    departure_city: (p.departure_city || '').trim() || null,
    trip: (p.trip || '').trim() || null,
  }

  // 2) Appel API
  try{
    await api.put(`/admin/omras/${p.id}`, payload)
    await loadOne(p.id) // resync
    openSuccess(`L’omra « ${p.title} » a été mise à jour avec succès.`)
  }catch(e){
    const apiMsg =
      e?.response?.data?.message ||
      (e?.response?.data?.errors && Object.values(e.response.data.errors).flat()[0]) ||
      e?.message ||
      'Erreur lors de la mise à jour.'
    openError(apiMsg)
  }
}

/* Ouvre le datepicker natif (ergonomie) */
function forceOpenPicker(e){
  const el = (e.currentTarget || e.target)
  requestAnimationFrame(() => {
    if (el && typeof el.showPicker === 'function') {
      try { el.showPicker() } catch {}
    } else if (el?.focus) {
      el.focus()
    }
  })
}

watch(() => form.value.date_start, () => {
  if (form.value.date_end && form.value.date_start) {
    const min = addDays(form.value.date_start, 1)
    if (form.value.date_end < min) form.value.date_end = ''
  }
})

//const nightsLimit = computed(() => durationDays.value ? durationDays.value - 1 : 0)


watch(
  [() => form.value.makkah_nights, () => durationDays.value],
  () => {
    const limit = Math.max(0, Number(nightsLimit.value || 0)) // durée - 1
    let mk = Number(form.value.makkah_nights || 0)
    if (!Number.isFinite(mk) || mk < 0) mk = 0
    if (mk > limit) mk = limit
    if (mk !== form.value.makkah_nights) form.value.makkah_nights = mk
    form.value.medina_nights = Math.max(0, limit - mk)
  },
  { immediate: true }
)


const previewSrc = ref('')   // URL pour l’aperçu (local ou serveur)
let _revoke = null           // pour révoquer l’ObjectURL précédent

function toAbsoluteUrl(u) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  const base = api?.defaults?.baseURL?.replace(/\/+$/,'') || ''
  return u.startsWith('/') ? base + u : (base ? `${base}/${u}` : u)
}

onUnmounted(() => { if (_revoke) URL.revokeObjectURL(_revoke) })



</script>

<template>
  <main class="content omra-create">
   <div class="card table-card">

    <FlashBanner/>
    <h2 class="page-title">Modifier une Omra</h2>

    <form v-if="!loading && form.id" @submit.prevent="save" class="form">
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

      <!-- Séjour / Trip -->
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
          <input id="f-priceFrom" v-model="form.price_from" type="text" placeholder="ex: 1 299,50" />
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
          <div class="preview-box" 
               :style="{ backgroundImage: previewSrc ? `url(${previewSrc})` : 'none' }">
          </div>
        </div>
      </div>

      <!-- Mois + Année -->
      <div class="row-2">
        <!--  Année -->
        <div class="field">
          <label for="omra-year">Année *</label>
          <select id="omra-year" v-model="form.year">
            <option :value="null">— Choisir —</option>
            <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Mois -->
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
            @focus="forceOpenPicker"
            @click="forceOpenPicker"
            @keydown.space.prevent="forceOpenPicker"
            @keydown.enter.prevent="forceOpenPicker"
            placeholder="jj / mm / aaaa"
          />
          <small class="error" v-if="monthIsPast">
            Le mois choisi est déjà passé.
          </small>
          <small class="muted" v-else-if="departMin">
            Départ possible à partir du {{ departMin }}.
          </small>
        </div>

        <div class="field">
          <label for="retour">Date de retour *</label>
          <input
  id="retour"
  type="date"
  v-model="form.date_end"
  :min="form.date_start ? addDays(form.date_start, 1) : ''"
  :disabled="!form.date_start"
  @focus="forceOpenPicker" @click="forceOpenPicker"
  @keydown.space.prevent="forceOpenPicker" @keydown.enter.prevent="forceOpenPicker"
  placeholder="jj / mm / aaaa"
/>
        </div>
      </div>

      <!-- Durée -->
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
              'is-draft':     (form.status === 'Brouillon'),
              'is-published': (form.status === 'Publier'),
              'is-archived':  (form.status === 'Archiver')
            }">
            <option value="Brouillon">Brouillon</option>
            <option value="Publier">Publier</option>
            <option value="Archiver" disabled>Archiver (automatique)</option>
          </select>
          <small class="muted">
            Par défaut : « Brouillon ». « Archiver » est appliqué automatiquement après la date de départ.
          </small>
        </div>
      </div>

      <!-- Hôtel Makkah -->
            <!-- Hôtel Makkah -->
      <div class="row-2 hotel-line">
        <!-- Colonne Hôtel -->
        <div class="field">
          <label for="f-makkahHotel">Hôtel Makkah *</label>

          <!-- Select + étoiles dans la même ligne -->
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

            <!-- ⭐ après l’hôtel -->
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

        <!-- Colonne Nuits -->
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


      <!-- Hôtel Médine -->
            <!-- Hôtel Médine -->
      <div class="row-2 hotel-line">
        <!-- Colonne Hôtel -->
        <div class="field">
          <label for="f-medinaHotel">Hôtel Médine *</label>

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

        <!-- Colonne Nuits -->
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
            <div class="input-euro">
              <input id="f-priceSingle" v-model="form.price_single" type="text" />
              <span>€</span>
            </div>
          </div>

          <div class="field">
            <label for="f-priceDouble">Double</label>
            <div class="input-euro">
              <input id="f-priceDouble" v-model="form.price_double" type="text" />
              <span>€</span>
            </div> 
          </div>

          <div class="field">
            <label for="f-priceTriple">Triple</label>
            <div class="input-euro">
              <input id="f-priceTriple" v-model="form.price_triple" type="text" />
              <span>€</span>
            </div>
          </div>

          <div class="field">
            <label for="f-priceQuad">Quadruple</label>
            <div class="input-euro">
              <input id="f-priceQuad" v-model="form.price_quadruple" type="text" />
              <span>€</span>
            </div>
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
                      placeholder="Ex : Petit-déjeuner / Demi-pension / Pension complète" 
                      required />
            <small class="error" v-if="errors.pension">{{ errors.pension }}</small>
          </div>
        </div>
      </fieldset>

      <!-- Le prix inclut / n’inclut pas -->
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
          <button class="btn add add-include" type="button" @click="form.includes.push('')">+ Ajouter une ligne</button>
        </div>

        <div class="field prest prest-exclude">
          <label class="prest-title is-exclude">Le prix n’inclut pas</label>
          <div v-for="(item,i) in form.excludes" :key="'exc-'+i" class="line-input-wrap">
            <input v-model="form.excludes[i]" class="line-input" placeholder="Ex : Vol" />
            <button type="button" class="line-icon-btn" @click="form.excludes.splice(i,1)" aria-label="Supprimer" title="Supprimer">
              <svg viewBox="0 0 24 24" class="icon-trash" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
          <button class="btn add add-exclude" type="button" @click="form.excludes.push('')">+ Ajouter une ligne</button>
        </div>
      </fieldset>

      <!-- Programme (facultatif) -->
      <fieldset class="row-1 group">
        <legend>Programme jour par jour (optionnel)</legend>
        <div v-for="(d, idx) in form.program_days" :key="`pd-${idx}`" class="program-row">
          <span class="program-badge">{{ idx + 1 }}</span>
          <div class="field full">
            <div class="input-with-action">
              <input v-model="d.title" class="w-full" placeholder="Titre du jour (ex. Départ, Séjour à Médine...)" />
              <button type="button" class="icon-btn delete" @click="form.program_days.splice(idx,1)" aria-label="Supprimer ce jour" title="Supprimer cette ligne">
                <svg viewBox="0 0 24 24" class="icon-trash" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <textarea v-model="d.text" rows="3" placeholder="Description du programme…" />
          </div>
        </div>
        <div class="row-1">
          <button class="btn-add" type="button" @click="form.program_days.push({ title:'', text:'' })">+ Ajouter un jour</button>
        </div>
        <!-- plus d'erreur ici car optionnel -->
      </fieldset>

      <!-- Actions -->
      <div class="row-1 actions">
        <button class="btn btn-lg" type="submit">Mettre à jour</button>
        <button class="btn ghost" type="button" @click="cancel">Annuler</button>
      </div>
    </form>

    <div v-else class="muted">Chargement…</div>

    <!-- Pop-up unifiée : si succès → redirection vers /admin/omras/list -->
    <AlertPopup
      v-model="showAlert"
      :variant="alertData.variant"
      :title="alertData.title"
      :message="alertData.message"
      :primary-text="alertData.primaryText"
      @update:modelValue="onAlertClosed"
    />

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
</style>
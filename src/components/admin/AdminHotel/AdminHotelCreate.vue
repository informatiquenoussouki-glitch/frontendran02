<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'       // ✅ CORRECT
 import FlashBanner from '@/components/ui/FlashBanner.vue'
 import AlertPopup from '@/components/popups/AlertPopup.vue'
import { useFlash } from '@/composables/useFlash'
import MapPicker from '@/components/MapPicker.vue'


const router = useRouter()
const { success, error: flashError } = useFlash()

/* ===== Constantes ===== */
const CITIES = ['Makkah', 'Medina']
const MAX_IMG = 5
const MAX_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/* ===== State ===== */
const allHotels = ref([])
const loading = ref(false)
const errors = ref({})
const form = ref({
  name: '',
  city: '',
  stars: 0,
  description: '',
  distance_to_haram: '',
  address: '',
  lat: null,
  lng: null,
  map_embed_src: ''   // src d’un iframe Google Maps (embed?pb=… ou embed/v1/…)
  
})

/* ===== Fichiers ===== */
const newFiles = ref([])
const previews = ref([])
const remaining = computed(() => Math.max(0, MAX_IMG - newFiles.value.length))
const fileInputRef = ref(null)

/* ===== Helpers erreurs ===== */
function setImageError(msg){ errors.value = { ...errors.value, images: msg } }
function clearImageError(){
  if ('images' in errors.value) {
    const { images, ...rest } = errors.value
    errors.value = rest
  }
}
function clearLatLngError(){
  if ('latlng' in (errors.value || {})) {
    const { latlng, ...rest } = errors.value
    errors.value = rest
  }
}

/* ===== Images ===== */
function onPickImages(e){
  const files = Array.from(e.target.files || [])
  e.target.value = ''

  if (remaining.value === 0) {
    setImageError(`Maximum ${MAX_IMG} images atteint. Supprimez-en une pour en ajouter.`)
    return
  }
  const valid = []
  let badType = 0, tooBig = 0
  for (const f of files) {
    if (!ALLOWED_TYPES.includes(f.type)) { badType++; continue }
    if (f.size > MAX_SIZE) { tooBig++; continue }
    valid.push(f)
  }
  if (badType || tooBig) {
    const parts = []
    if (badType) parts.push(`${badType} fichier(s) refusé(s) (format non supporté)`)
    if (tooBig)  parts.push(`${tooBig} fichier(s) > 4 Mo`)
    setImageError(parts.join(' · '))
  }
  if (!valid.length) return

  if (valid.length > remaining.value) {
    setImageError(`Vous ne pouvez ajouter que ${remaining.value} image(s) supplémentaire(s) (max ${MAX_IMG}).`)
  }
  const take = valid.slice(0, remaining.value)
  newFiles.value.push(...take)
  previews.value.push(...take.map(f => URL.createObjectURL(f)))
  if (take.length) clearImageError()
}

function removeNew(idx){
  URL.revokeObjectURL(previews.value[idx])
  previews.value.splice(idx,1)
  newFiles.value.splice(idx,1)
  if (remaining.value > 0) clearImageError()
}

async function uploadImagesFor(hotelId){
  if (!newFiles.value.length) return
  const fd = new FormData()
  newFiles.value.forEach(f => fd.append('images[]', f))
  await api.post(`/admin/hotels/${hotelId}/images`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/* ===== Chargement liste hôtels ===== */
async function loadHotels(){
  try{
    const { data } = await api.get('/admin/hotels')
    allHotels.value = Array.isArray(data) ? data : []
  }catch{/* noop */}
}
onMounted(loadHotels)

/* ===== Validation ===== */
function normName(s){
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function validate(){
  const e = {}, f = form.value
  const nameN = normName(f.name)
  if (!nameN) e.name = 'Nom de l’hôtel obligatoire.'
  else if (allHotels.value.some(h => normName(h.name) === nameN)) e.name = 'Ce nom d’hôtel existe déjà.'

  if(!f.city || !CITIES.includes(f.city)) e.city = 'Choisissez Makkah ou Medina.'
  const s = Number(f.stars)
  if(!Number.isFinite(s) || s < 1 || s > 5) e.stars = 'Étoiles entre 1 et 5.'
  
  const dist = String(f.distance_to_haram ?? '').trim()  // <-- cast sûr
  if (!dist) {
    e.distance_to_haram = 'Distance obligatoire (ex : "250 m").'
  }

  if (newFiles.value.length < 1) e.images = 'Au moins une image est obligatoire (max 5).'

  // ❗️NOUVEAU : il faut EITHER map_embed_src OR lat/lng
  const hasEmbed = !!f.map_embed_src
  const hasCoords = Number.isFinite(f.lat) && Number.isFinite(f.lng)
  if (!hasEmbed && !hasCoords) {
    e.latlng = 'Collez un embed Google Maps (Partager → Intégrer) OU placez le marqueur sur la carte.'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

/* ===== Save ===== */
async function save(){
  if(!validate()) {
    openFormErrorsPopup()
    return
  }

  const nameN = normName(form.value.name)
  const distanceText = String(form.value.distance_to_haram ?? '').trim()

  if (allHotels.value.some(h => normName(h.name) === nameN)) {
    success('Cet hôtel est déjà enregistré.')
    return
  }
  try{
    const payload = {
      name: form.value.name.trim(),
      city: form.value.city,
      stars: Number(form.value.stars),
      description: form.value.description?.trim() || null,
      distance_to_haram: distanceText || null,  // <- string envoyée
      address: form.value.address?.trim() || null,
      lat: Number.isFinite(form.value.lat) ? Number(form.value.lat) : null,
      lng: Number.isFinite(form.value.lng) ? Number(form.value.lng) : null,
      map_embed_src: form.value.map_embed_src?.trim() || null,
    }
    const { data } = await api.post('/admin/hotels', payload)
    const hotelId = data?.id
    await uploadImagesFor(hotelId)
    //success('Hôtel créé avec succès.')

    // 👉 Ouvre la pop-up
    openSuccess(`L’omra « ${nameN} » a été créée avec succès.`)

    
    await loadHotels()
  }catch(e){
    const { response } = e || {}
    const msg   = response?.data?.message || e?.message || ''
    const vErr  = response?.data?.errors
    const nameIsUniqueErr =
      (Array.isArray(vErr?.name) && vErr.name.some(t => /unique|taken|existe/i.test(t))) ||
      (/name/i.test(msg) && /(unique|taken|existe)/i.test(msg))
    if (nameIsUniqueErr) { success('Cet hôtel est déjà enregistré.'); return }
    if (/image|images/i.test(msg)) errors.value = { ...errors.value, images: 'Au moins une image est obligatoire (max 5).' }
    if (/distance/i.test(msg))     errors.value = { ...errors.value, distance_to_haram: 'Distance obligatoire (en mètres, > 0).' }
    flashError(msg || 'Erreur lors de l’enregistrement.')

    const apiMsg =
      e?.response?.data?.message ||
      (e?.response?.data?.errors && Object.values(e.response.data.errors).flat()[0]) ||
      e?.message || 'Erreur lors de la création.'
    openError(apiMsg)
  }
}

/* ===== Map (v-model d’objet) ===== */
const coords = computed({
  get: () => ({ lat: form.value.lat, lng: form.value.lng }),
  set: v => { form.value.lat = v.lat; form.value.lng = v.lng; clearLatLngError() }
})

/* ===== Coller un lien Google Maps ===== */
const googleUrl = ref('')
const googleEmbedUrl = ref('') // si un <iframe ... src="..."> est collé

// Extraction et normalisation (SANS place_id / SANS API Google)
function parseGoogleMapsUrl(input) {
  if (!input) return null;
  let u = String(input).trim();

  // Si l'utilisateur colle un <iframe ... src="..."> on extrait le src
  const mSrc = u.match(/src\s*=\s*['"]([^'"]+)['"]/i);
  if (mSrc) u = mSrc[1];

  // Normalisation minimale: HTML -> URL
  u = u.replace(/&amp;/g, '&');

  // 1) Embed natif "pb=" (ce qu'il faut pour avoir le nom)
  if (/^https:\/\/www\.google\.com\/maps\/embed\?pb=/.test(u)) {
    // Optionnel: sanity check rapide (pb doit contenir des "!")
    const mPb = u.match(/[?&]pb=(.+)$/);
    if (!mPb || !mPb[1].includes('!')) return { error: 'embed_pb_invalid' };
    return { embed: u };
  }

  // 2) Embed v1 (clé) — accepté aussi
  if (/^https:\/\/www\.google\.com\/maps\/embed\/v1\//.test(u)) {
    return { embed: u };
  }

  // 3) URLs avec coordonnées (fallback sans nom)
  let m;
  m = u.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: +m[1], lng: +m[2] };

  m = u.match(/[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: +m[1], lng: +m[2] };

  m = u.match(/[?&]ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: +m[1], lng: +m[2] };

  // cas pb collé avec !3d… !4d… dans l'URL brute (rare)
  m = u.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: +m[1], lng: +m[2] };
  m = u.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: +m[2], lng: +m[1] };

  return null;
}

function applyGoogleUrl(){
  const raw = googleUrl.value?.trim();
  if (!raw || !/https?:\/\/|<iframe/i.test(raw)) {
    errors.value = { ...errors.value,
      latlng: 'Collez le lien Google Maps long ou le code <iframe> complet (btn Partager → Intégrer).'
    };
    return;
  }

  const parsed = parseGoogleMapsUrl(raw);
  if (!parsed) {
    errors.value = { ...errors.value,
      latlng: 'Lien non reconnu. Collez un embed “…/maps/embed?pb=…” OU une URL avec @lat,lng.'
    };
    return;
  }

  if (parsed.error === 'embed_pb_invalid') {
    errors.value = { ...errors.value,
      latlng: 'Embed invalide: paramètre "pb" tronqué. Re-copiez exactement le “src” de l’iframe (ne modifiez pas l’URL).'
    };
    return;
  }

  if (parsed.embed) {
    // NE PAS décoder/transformer l’URL d’embed – on la garde telle quelle
    form.value.map_embed_src = parsed.embed;
    clearLatLngError();

    // bonus: si l’embed contient !3d…!4d… on peut peupler lat/lng
    const m34 = parsed.embed.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    const m23 = parsed.embed.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
    if (m34) { form.value.lat = +m34[1]; form.value.lng = +m34[2]; }
    else if (m23) { form.value.lat = +m23[2]; form.value.lng = +m23[1]; }
    return;
  }

  if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
    form.value.lat = parsed.lat;
    form.value.lng = parsed.lng;
    form.value.map_embed_src = ''; // pas d’embed fourni
    clearLatLngError();
    return;
  }
}

/* ===== Aperçu Google =====
   1) map_embed_src (pb= ou v1/…) -> affiche la fiche avec le nom
   2) lat/lng -> simple épingle (@lat,lng)
*/
const googlePreviewSrc = computed(() => {
  if (form.value.map_embed_src) {
    return form.value.map_embed_src.replace(/&amp;/g,'&')
  }
  const { lat, lng } = form.value
  if (Number.isFinite(+lat) && Number.isFinite(+lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}&hl=fr&z=16&output=embed`
  }
  return ''
})


const showAlert = ref(false)
const alertData = ref({
  variant: 'success', // 'success' | 'error'
  title: 'Succès',
  message: '',
  primaryText: 'OK',
})

function openSuccess(msg){
  alertData.value = { variant:'success', title:'Succès', message: msg || 'Créée avec succès.', primaryText:'OK' }
  showAlert.value = true
}
function openError(msg){
  alertData.value = { variant:'error', title:'Erreur', message: msg || 'Merci de corriger les champs en rouge.', primaryText:'Essayer à nouveau' }
  showAlert.value = true
}


// Pop-up dédiée aux erreurs de validation du formulaire
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
function cancel(){ router.push({ path: '/admin/hotels' }) }
</script>

<template>
  <main class="content omra-create">
    <div class="card table-card">
    <FlashBanner/>

    
    <h2 class="page-title">Ajouter un Hôtel</h2>

    <form @submit.prevent="save" class="form">
      <!-- Nom -->
      <div class="row-1">
        <div class="field">
          <label for="h-name">Nom de l’hôtel *</label>
          <input id="h-name" v-model="form.name" :class="{invalid: errors.name}" placeholder="ex: Hilton" />
          <small class="error" v-if="errors.name">{{ errors.name }}</small>
        </div>
      </div>

      <!-- Ville + Étoiles -->
      <div class="row-2">
        <!-- Ville -->
        <div class="field">
          <label for="h-city">Ville *</label>
          <select id="h-city" v-model="form.city" :class="{invalid: errors.city}">
            <option value="">— Choisir —</option>
            <option v-for="c in CITIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <small class="error" v-if="errors.city">{{ errors.city }}</small>
        </div>

        <!-- Étoiles -->
        <div class="field">
          <label for="h-stars">Étoiles *</label>
          <input id="h-stars" v-model.number="form.stars" type="number" min="1" max="5" :class="{invalid: errors.stars}" />
          <small class="error" v-if="errors.stars">{{ errors.stars }}</small>
        </div>
      </div>

      <!-- Description -->
      <div class="row-1">
        <div class="field">
          <label for="h-desc">Description (facultatif)</label>
          <textarea id="h-desc" v-model="form.description" rows="3" placeholder="Infos utiles sur l’hôtel, services, etc."></textarea>
        </div>
      </div>

      <!-- Distance -->
      <div class="row-1">
        <div class="field">
          <label for="h-distance">Distance au Haram*</label>
          <input id="h-distance"
                 v-model="form.distance_to_haram"
                 type="text" placeholder="ex : 250 m"
                 :class="{invalid: errors.distance_to_haram}" />
          <small class="error" v-if="errors.distance_to_haram">{{ errors.distance_to_haram }}</small>
        </div>
      </div>

      <!-- Galerie -->
      <fieldset class="row-1 group">
        <legend>Galerie (max {{ MAX_IMG }})</legend>

        <div class="row-1">
          <div class="field">
            <label>Images *</label>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              multiple
              :class="{invalid: errors.images}"
              :disabled="remaining === 0"
              @change="onPickImages"
            />
            <small class="error" v-if="errors.images">{{ errors.images }}</small>
            <small class="muted" v-else-if="remaining > 0">
              Formats : JPG/PNG/WEBP, 4 Mo max. Il reste {{ remaining }} image(s) possible(s) (max {{ MAX_IMG }}).
            </small>
            <small class="error" v-else>
              Maximum {{ MAX_IMG }} images atteint. Supprimez-en une pour en ajouter.
            </small>
          </div>
        </div>

        <div class="gallery" v-if="previews.length">
          <div v-for="(url,idx) in previews" :key="'new-'+idx" class="thumb">
            <img :src="url" alt="prévisualisation" />
            <button type="button" class="thumb-del" @click="removeNew(idx)">✕</button>
          </div>
        </div>
      </fieldset>

      <!-- Localisation -->
      <fieldset class="row-1 group">
        <legend>Localisation</legend>

        <!-- Carte interactive -->
        <div class="row-1">
          <div class="field" :class="{ invalid: errors.latlng }">
            <label>Carte (cliquez pour placer le marqueur)</label>
            <MapPicker v-model="coords" :zoom="15" height="260px" />
            <small class="error" v-if="errors.latlng">{{ errors.latlng }}</small>
          </div>
        </div>

        <!-- Coller un lien -->
        <div class="row-1">
          <div class="field">
            <label for="gurl">Coller un lien Google Maps (ou le code &lt;iframe&gt;)</label>
            <div style="display:flex; gap:8px;">
              <input id="gurl" v-model="googleUrl"
                     placeholder='https://www.google.com/maps/embed?pb=…  OU  https://www.google.com/maps/@LAT,LNG…'
                     style="flex:1">
              <button class="btn" type="button" @click="applyGoogleUrl">
                Extraire
              </button>
            </div>
            <small class="muted">
              Astuce : utilisez le bouton <em>Partager → Intégrer une carte</em> dans Google Maps et collez le <code>src</code> (il contient <code>/maps/embed</code>).
            </small>
          </div>
        </div>

        <!-- Aperçu Google -->
        <div class="row-1" v-if="googlePreviewSrc">
          <div class="field">
            <label>Aperçu Google</label>
            <iframe
              :src="googlePreviewSrc"
              width="100%" height="220"
              style="border:0;"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </fieldset>

      <!-- Actions -->
      <div class="row-1 actions">
        <button class="btn btn-lg" type="submit">
          Ajouter
        </button>

        <button class="btn ghost" type="button" @click="cancel">
          Annuler
        </button>
      </div>

    </form>

    <AlertPopup
      v-model="showAlert"
      :variant="alertData.variant"
      :title="alertData.title"
      :message="alertData.message"
      :primary-text="alertData.primaryText"
      @update:modelValue="v => { 
      if (!v && alertData.variant === 'success') router.push('/admin/hotels')
      }"
    />
    </div>
  </main>
</template>

<style scoped src="@/assets/styles/AdminHotel.css"></style>
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


<!-- src/pages/admin/AdminHotelEdit.vue -->
<script setup>
/* =========================
   Imports & outils Vue/Router
   ========================= */
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* =========================
   Services & UI partagés
   ========================= */
import api from '@/services/api'       // ✅ CORRECT
 import FlashBanner from '@/components/ui/FlashBanner.vue'
import { useFlash } from '@/composables/useFlash'
import AlertPopup from '@/components/popups/AlertPopup.vue' // ← pop-up succès/erreur

/* =========================
   Constantes métier
   ========================= */
const CITIES       = ['Makkah', 'Medina']
const MAX_IMG      = 5
const MAX_SIZE     = 4 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const API_BASE     = import.meta.env.VITE_API_BASE_URL || ''

/* =========================
   Router & flash
   ========================= */
const route  = useRoute()
const router = useRouter()
const { success, error: flashError } = useFlash()

/* =========================
   État principal (formulaire)
   ========================= */
const allHotels = ref([])     // pour vérifier l'unicité du nom
const loading   = ref(false)  // spinner global
const errors    = ref({})     // messages par champ
const form      = ref({
  id: null,
  name: '',
  city: '',
  stars: 0,
  description: '',
  // distance enregistrée côté API en texte (varchar) :
  distance_to_haram: '',
  // coordonnées (numériques)
  lat: null,
  lng: null,
  // si on colle un "embed" google maps
  map_embed_src: ''
})

/* =========================
   Galerie d’images (existantes & nouvelles)
   ========================= */
const existingImages = ref([])    // images déjà en base
const newFiles       = ref([])    // fichiers ajoutés (non envoyés)
const previews       = ref([])    // URLs locales pour aperçu des nouveaux fichiers
const removedImages  = ref([])    // images existantes marquées pour suppression

// Combien peut-on encore ajouter ?
const remaining = computed(() =>
  Math.max(0, MAX_IMG - (existingImages.value.length + newFiles.value.length))
)

// Normalise les images récupérées depuis l’API → {id, path, url}
function setExistingImages(arr){
  existingImages.value = (Array.isArray(arr) ? arr : []).map(x => ({
    id: x.id,
    path: x.path ?? null,
    url: x.url?.startsWith?.('http') ? x.url : (API_BASE + '/storage/' + (x.path || '')),
  }))
}

// Helpers erreurs
function setImageError(msg){ errors.value = { ...errors.value, images: msg } }
function clearImageError(){
  if ('images' in errors.value) {
    const { images, ...rest } = errors.value
    errors.value = rest
  }
}

// Ajout d’images depuis <input type="file" multiple>
function onPickImages(e){
  const files = Array.from(e.target.files || [])
  e.target.value = '' // reset input

  if (remaining.value === 0) {
    setImageError(`Maximum ${MAX_IMG} images atteint.`)
    return
  }

  const valid = []
  let badType = 0, tooBig = 0
  for (const f of files){
    if (!ALLOWED_TYPES.includes(f.type)) { badType++; continue }
    if (f.size > MAX_SIZE) { tooBig++; continue }
    valid.push(f)
  }

  if (badType || tooBig){
    const parts = []
    if (badType) parts.push(`${badType} fichier(s) non supporté(s)`)
    if (tooBig)  parts.push(`${tooBig} fichier(s) > 4 Mo`)
    setImageError(parts.join(' · '))
  }

  if (!valid.length) return
  if (valid.length > remaining.value){
    setImageError(`Vous ne pouvez ajouter que ${remaining.value} image(s) (max ${MAX_IMG}).`)
  }

  const take = valid.slice(0, remaining.value)
  newFiles.value.push(...take)
  previews.value.push(...take.map(f => URL.createObjectURL(f)))
  if (take.length) clearImageError()
}

// Retire une nouvelle image avant envoi
function removeNew(idx){
  URL.revokeObjectURL(previews.value[idx])
  previews.value.splice(idx,1)
  newFiles.value.splice(idx,1)
  if (remaining.value > 0) clearImageError()
}

// Marque une image existante pour suppression
function markDelete(img){
  if (!img?.id) return
  existingImages.value = existingImages.value.filter(i => i.id !== img.id)
  removedImages.value.push(img)
  if (remaining.value > 0) clearImageError()
}

// Annule une suppression marquée
function undoDelete(img){
  if (!img?.id) return
  existingImages.value.push(img)
  removedImages.value = removedImages.value.filter(i => i.id !== img.id)
  if (remaining.value > 0) clearImageError()
}

// Envoie les nouvelles images au backend
async function uploadPendingImages(hotelId){
  if (!newFiles.value.length) return
  const fd = new FormData()
  newFiles.value.forEach(f => fd.append('images[]', f))
  const { data } = await api.post(`/admin/hotels/${hotelId}/images`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  // Remplace la liste par celle renvoyée par l’API
  setExistingImages(data)
  // Nettoyage local des previews/fichiers
  previews.value.forEach(u => URL.revokeObjectURL(u))
  previews.value = []
  newFiles.value = []
}

/* =========================
   Chargement données
   ========================= */
async function loadHotels(){
  try{
    const { data } = await api.get('/admin/hotels')
    allHotels.value = Array.isArray(data) ? data : []
  }catch{/* noop */}
}

async function loadOneForEdit(id){
  try{
    loading.value = true
    const { data } = await api.get(`/admin/hotels/${id}`)
    form.value = {
      id: data.id,
      name: data.name || '',
      city: CITIES.includes(data.city) ? data.city : '',
      stars: Number.isFinite(Number(data.stars)) ? Number(data.stars) : 0,
      description: data.description || '',
      distance_to_haram: (data.distance_to_haram ?? '').toString(),
      lat: Number.isFinite(Number(data.lat)) ? Number(data.lat) : null,
      lng: Number.isFinite(Number(data.lng)) ? Number(data.lng) : null,
      map_embed_src: data.map_embed_src || ''
    }
    setExistingImages(data.images || [])
    errors.value = {}
  }catch(e){
    flashError('Impossible de charger cet hôtel.')
    router.replace({ path: '/admin/hotels/list' })
  }finally{
    loading.value = false
  }
}

// Au montage : charge la liste + l’hôtel à éditer
onMounted(async ()=>{
  const id = Number(route.params.id)
  if (!Number.isFinite(id) || id <= 0) {
    flashError('Identifiant d’hôtel invalide.')
    return router.replace({ path: '/admin/hotels/list' })
  }
  await loadHotels()
  await loadOneForEdit(id)
})

// Si on change d’ID via la route, recharge la fiche
watch(() => route.params.id, (id) => {
  const n = Number(id)
  if (Number.isFinite(n) && n > 0) loadOneForEdit(n)
})

/* =========================
   Validation
   ========================= */
function normName(s){
  return String(s || '')
    .toLowerCase().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function validate(){
  const e = {}, f = form.value
  // Nom obligatoire + unique (hors lui-même)
  const nameN = normName(f.name)
  if (!nameN) e.name = 'Nom de l’hôtel obligatoire.'
  else {
    const dup = allHotels.value.some(h => normName(h.name) === nameN && h.id !== f.id)
    if (dup) e.name = 'Ce nom d’hôtel existe déjà.'
  }

  // Ville + étoiles
  if(!f.city || !CITIES.includes(f.city)) e.city = 'Choisissez Makkah ou Medina.'
  const s = Number(f.stars)
  if(!Number.isFinite(s) || s < 1 || s > 5) e.stars = 'Étoiles entre 1 et 5.'

  // Distance (texte requis)
  const d = (f.distance_to_haram ?? '').toString().trim()
  if (!d) e.distance_to_haram = 'Distance obligatoire.'

  // Au moins 1 image au total (existantes + nouvelles)
  const totalImgs = existingImages.value.length + newFiles.value.length
  if (totalImgs < 1) e.images = 'Au moins une image est obligatoire (max 5).'

  errors.value = e
  return Object.keys(e).length === 0
}

/* =========================
   Coller un lien Google Maps (URL ou <iframe>)
   ========================= */
const googleUrl = ref('')

function clearLatLngError(){
  if ('latlng' in errors.value) {
    const { latlng, ...rest } = errors.value
    errors.value = rest
  }
}

function googleEmbed(lat,lng){
  if (!Number.isFinite(+lat) || !Number.isFinite(+lng)) return ''
  return `https://www.google.com/maps?q=${lat},${lng}&hl=fr&z=16&output=embed`
}

// Parse l’input (URL longue ou code iframe) et remplit map_embed_src et/ou lat,lng
function applyGoogleUrl(){
  const raw = googleUrl.value?.trim()
  if (!raw || !/https?:\/\/|<iframe/i.test(raw)) {
    errors.value = { ...errors.value, latlng: 'Collez une URL Google Maps longue ou l’iframe ENTIER (src="https://…").' }
    return
  }

  // Si un <iframe ... src="..."> est collé, on récupère seulement le src
  let src = raw
  const mSrc = raw.match(/src\s*=\s*['"]([^'"]+)['"]/i)
  if (mSrc) src = mSrc[1]
  src = src.replace(/&amp;/g,'&')

  // 1) embed “…/maps/embed?pb=…”
  if (/\/maps\/embed\?/i.test(src) && /[?&]pb=/.test(src)) {
    form.value.map_embed_src = src
    // Bonus : essaye d’extraire lat/lng de l’embed
    const m34 = src.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    const m23 = src.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/)
    if (m34) { form.value.lat = +m34[1]; form.value.lng = +m34[2] }
    else if (m23) { form.value.lat = +m23[2]; form.value.lng = +m23[1] }
    clearLatLngError()
    return
  }

  // 2) URL avec coordonnées
  const mAt = src.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  const mQ  = src.match(/[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  const mLl = src.match(/[?&]ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  const m34b= src.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  const m23b= src.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/)

  const ll =
    (mAt && { lat:+mAt[1], lng:+mAt[2] }) ||
    (mQ  && { lat:+mQ[1],  lng:+mQ[2]  }) ||
    (mLl && { lat:+mLl[1], lng:+mLl[2] }) ||
    (m34b&& { lat:+m34b[1],lng:+m34b[2]}) ||
    (m23b&& { lat:+m23b[2],lng:+m23b[1]}) ||
    null

  if (ll) {
    form.value.lat = ll.lat
    form.value.lng = ll.lng
    form.value.map_embed_src = '' // pas d’embed fourni → simple coordonnées
    clearLatLngError()
    return
  }

  errors.value = { ...errors.value, latlng: 'Lien non reconnu. Collez un embed “…/maps/embed?pb=…”, ou une URL @lat,lng.' }
}

// URL d’aperçu de la carte (iframe)
const googlePreviewSrc = computed(() => {
  if (form.value.map_embed_src) return form.value.map_embed_src.replace(/&amp;/g,'&')
  if (Number.isFinite(+form.value.lat) && Number.isFinite(+form.value.lng)) {
    return googleEmbed(form.value.lat, form.value.lng)
  }
  return ''
})

/* =========================
   Pop-up d’alerte (succès/erreur)
   ========================= */
const showAlert  = ref(false)
const alertData  = ref({ variant: 'success', title: 'Succès', message: '', primaryText: 'OK' })
const onCloseRoute = ref(null) // si défini, on navigue à la fermeture

function openSuccess(msg){
  alertData.value = { variant:'success', title:'Succès', message: msg, primaryText:'OK' }
  onCloseRoute.value = '/admin/hotels/list' // ← retour à la liste sur OK
  showAlert.value = true
}
function openError(msg){
  alertData.value = { variant:'error', title:'Erreur', message: msg, primaryText:'Fermer' }
  onCloseRoute.value = null // ← rester sur place pour corriger
  showAlert.value = true
}

/* =========================
   Actions
   ========================= */
function cancel(){ router.push({ path: '/admin/hotels/list' }) }

async function save(){
  if(!validate()){
    // Affiche une pop-up d’erreurs condensée + focus 1er champ invalide
    const msgs = Object.values(errors.value || {}).flat().filter(Boolean)
    const preview = msgs.slice(0, 4)
    const extra = msgs.length > 4 ? `\n…et ${msgs.length - 4} autre(s).` : ''
    openError(
      preview.length
        ? `Veuillez corriger :\n• ${preview.join('\n• ')}${extra}`
        : 'Merci de corriger les champs en rouge.'
    )
    await nextTick()
    const firstInvalid =
      document.querySelector('.invalid') ||
      document.querySelector('[aria-invalid="true"]')
    firstInvalid?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    firstInvalid?.focus?.()
    return
  }

  try{
    const id = form.value.id
    const payload = {
      name: form.value.name.trim(),
      city: form.value.city,
      stars: Number(form.value.stars),
      description: form.value.description?.trim() || null,
      distance_to_haram: (form.value.distance_to_haram ?? '').toString().trim() || null,
      lat: Number.isFinite(Number(form.value.lat)) ? Number(form.value.lat) : null,
      lng: Number.isFinite(Number(form.value.lng)) ? Number(form.value.lng) : null,
      map_embed_src: form.value.map_embed_src?.trim() || null,
    }

    // 1) mise à jour de l’hôtel
    await api.put(`/admin/hotels/${id}`, payload)

    // 2) upload des nouvelles images (si présentes)
    await uploadPendingImages(id)

    // 3) suppression des images marquées
    if (removedImages.value.length){
      await Promise.all(
        removedImages.value.map(img => api.delete(`/hotels/${id}/images/${img.id}`))
      )
      removedImages.value = []
    }

    // 4) resynchronise localement (utile si d’autres infos changent côté API)
    await loadOneForEdit(id)
    await loadHotels()

    // 5) pop-up succès
    openSuccess(`L’hôtel « ${form.value.name} » a été modifié avec succès.`)

  }catch(e){
    // mapping d’erreurs serveur → champs UI + pop-up erreur
    const msg = e?.response?.data?.message || e?.message || 'Erreur lors de l’enregistrement.'
    if (/name/i.test(msg) && /(unique|taken|existe)/i.test(msg)) {
      errors.value = { ...errors.value, name: 'Ce nom d’hôtel existe déjà.' }
    }
    if (/image|images/i.test(msg)) {
      errors.value = { ...errors.value, images: 'Au moins une image est obligatoire (max 5).' }
    }
    if (/lat|lng|coord/i.test(msg)) {
      errors.value = { ...errors.value, latlng: 'Coordonnées requises par l’API (lat/lng).' }
    }
    openError(msg)
  }
}
</script>

<template>
  <main class="content">
    <FlashBanner/>
    <h2>Modifier un Hôtel</h2>

    <form v-if="!loading && form.id !== null" @submit.prevent="save" class="form">
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

      <!-- Distance (string) -->
      <div class="row-1">
        <div class="field">
          <label for="h-distance">Distance au Haram *</label>
          <input id="h-distance" v-model="form.distance_to_haram" type="text" placeholder="ex: 120 m, 1.2 km"
                 :class="{invalid: errors.distance_to_haram}" />
          <small class="error" v-if="errors.distance_to_haram">{{ errors.distance_to_haram }}</small>
        </div>
      </div>

      <!-- Google Maps : collage + aperçu -->
      <fieldset class="row-1 group">
        <legend>Localisation</legend>

        <!-- Google Maps : collage -->
        <div class="row-1">
          <div class="field" :class="{ invalid: errors.latlng }">
            <label for="gurl">Coller un lien Google Maps (ou le code &lt;iframe&gt;)</label>
            <div style="display:flex; gap:8px;">
              <input id="gurl" v-model="googleUrl"
                     placeholder="https://www.google.com/maps/embed?pb=…  OU  https://www.google.com/maps/@LAT,LNG,15z"
                     style="flex:1">
              <button type="button" class="btn" @click="applyGoogleUrl">Extraire</button>
            </div>
            <small class="error" v-if="errors.latlng">{{ errors.latlng }}</small>
            <small class="muted" v-else>
              Astuce : utilisez <em>Partager → Intégrer une carte</em> dans Google Maps et collez le <code>src</code>.
            </small>
          </div>
        </div>

        <!-- Google Maps : aperçu -->
        <div class="row-1" v-if="googlePreviewSrc">
          <div class="field">
            <label>Aperçu Google</label>
            <iframe
              :src="googlePreviewSrc"
              width="100%" height="260"
              style="border:0;"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </fieldset>

      <!-- on garde lat/lng en hidden pour l’API -->
      <input type="hidden" v-model="form.lat" />
      <input type="hidden" v-model="form.lng" />

      <!-- Galerie -->
      <fieldset class="row-1 group">
        <legend>Galerie (max {{ MAX_IMG }})</legend>

        <div class="row-1">
          <div class="field">
            <label>Images *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              :class="{invalid: errors.images}"
              :disabled="remaining === 0"
              @change="onPickImages"
            />
            <small class="error" v-if="errors.images">{{ errors.images }}</small>
            <small class="muted" v-else-if="remaining > 0">
              Formats : JPG/PNG/WEBP, 4 Mo max. Il reste {{ remaining }} image(s) (max {{ MAX_IMG }}).
            </small>
            <small class="error" v-else>Maximum {{ MAX_IMG }} images atteint.</small>
          </div>
        </div>

        <!-- Existant -->
        <div class="gallery" v-if="existingImages.length">
          <div v-for="img in existingImages" :key="'ex-'+img.id" class="thumb">
            <img :src="img.url" :alt="'img-'+img.id" />
            <button type="button" class="thumb-del" @click.stop="markDelete(img)" title="Supprimer">✕</button>
          </div>
        </div>

        <!-- À supprimer (preview grisé) -->
        <div class="gallery" v-if="removedImages.length" style="opacity:.8">
          <div v-for="img in removedImages" :key="'rm-'+img.id" class="thumb">
            <img :src="img.url" :alt="'del-'+img.id" />
            <button type="button" class="thumb-del" @click.stop="undoDelete(img)" title="Annuler la suppression">↩</button>
          </div>
        </div>
        <small class="muted" v-if="removedImages.length">
          {{ removedImages.length }} image(s) seront supprimées lors de l’enregistrement.
        </small>

        <!-- Nouvelles -->
        <div class="gallery" v-if="previews.length">
          <div v-for="(url,idx) in previews" :key="'new-'+idx" class="thumb">
            <img :src="url" alt="preview" />
            <button type="button" class="thumb-del" @click="removeNew(idx)">✕</button>
          </div>
        </div>
      </fieldset>

      <!-- Actions -->
      <div class="row-1 actions">
        <button class="btn btn-lg" type="submit">Mettre à jour</button>
        <button class="btn ghost" type="button" @click="cancel()">Annuler</button>
        <RouterLink class="btn ghost" style="text-align:center" to="/admin/hotels/list">Voir la liste</RouterLink>
      </div>
    </form>

    <div v-else class="muted">Chargement…</div>
  </main>

  <!-- Pop-up d’alerte unifiée -->
  <AlertPopup
    v-model="showAlert"
    :variant="alertData.variant"
    :title="alertData.title"
    :message="alertData.message"
    :primary-text="alertData.primaryText"
    @update:modelValue="v => { 
      if (!v && alertData.variant === 'success') router.push('/admin/hotels/list')
    }"
        />
</template>

<style scoped src="@/assets/styles/AdminOmras.css"></style>

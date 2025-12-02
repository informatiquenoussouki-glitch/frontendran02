<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'       // ✅ CORRECT

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const hotel = ref(null)
const images = ref([])
const current = ref(0)

const API_BASE   = import.meta.env.VITE_API_BASE_URL || ''
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '' // clé pour Maps Embed API

onMounted(async () => {
  try {
    const { data } = await api.get(`/hotels/${route.params.id}`)
    hotel.value = Array.isArray(data) ? data[0] : (data?.data || data)

    images.value = (hotel.value?.images ?? []).map(x => ({
      id: x.id,
      url: x.url || (x.path ? `${API_BASE}/storage/${x.path}` : ''),
    })).filter(x => x.url)

    if (!images.value.length) {
      images.value = [{ id: 0, url: 'https://via.placeholder.com/1200x800?text=Hotel' }]
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
})

function setCurrent(i) { current.value = i }

const prettyDistance = computed(() => {
  const h = hotel.value
  if (!h) return null

  // 1) Si la distance est déjà une chaîne (ex: "250 m", "1.2 km"), on l'affiche telle quelle
  const distText =
    (h.distance_to_haram ?? h.distance_text ?? '')
      .toString()
      .trim()

  if (distText) return distText

  // 2) Fallback si tu as encore une distance numérique (ex: distance_m)
  const dRaw =
    h.distance_m ?? h.distanceMeters ?? h.distance ?? null
  const d = Number(dRaw)

  if (Number.isFinite(d)) {
    if (d < 1000) return `${d} m`
    const km = d / 1000
    return `${km.toFixed(km % 1 ? 1 : 0)} km`
  }

  // 3) Rien à afficher
  return null
})

/**
 * URL Google Maps à afficher (priorités) :
 * 1) map_embed_src (iframe pb= de Google) -> affiche la fiche avec le NOM
 * 2) place_id + GOOGLE_KEY via embed/v1/place -> fiche avec NOM
 * 3) fallback lat,lng -> simple épingle (coordonnées)
 */
const googleMapSrc = computed(() => {
  const h = hotel.value
  if (!h) return ''

  // 1) on privilégie l’embed stocké en BDD (affiche le NOM)
  const pb = h.map_embed_src || h.google_embed_src || h.embed_src
  if (pb && /\/maps\/embed\?/.test(pb)) return String(pb).replace(/&amp;/g,'&')

  // 2) sinon, place_id + clé (affiche le NOM)
  const pid = h.place_id || h.google_place_id || h.placeId
  if (pid && GOOGLE_KEY)
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=place_id:${encodeURIComponent(pid)}`

  // 3) fallback : coordonnées
  const lat = Number(h.lat), lng = Number(h.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng))
    return `https://www.google.com/maps?q=${lat},${lng}&hl=fr&z=16&output=embed`

  return ''
})

</script>

<template>
  <main class="content">
    <!-- CADRE autour de toute la page view -->
    <section class="card view-card">
      <div class="hotel-view">
        <button class="back" @click="router.back()">
          ← Retour
        </button>
        <h1 class="title">{{ hotel?.name || 'Hôtel' }}</h1>
        <div class="meta">
          <span v-if="hotel?.city">🏙️ {{ hotel.city }}</span>
          <span v-if="hotel?.stars">⭐ {{ hotel.stars }}</span>
          <span v-if="prettyDistance">📍 {{ prettyDistance }} du Haram</span>
        </div>

        <p v-if="error" class="err">{{ error }}</p>
        <p v-else-if="loading">Chargement…</p>

        <div v-else class="gallery-grid">
          <div class="main">
            <img :src="images[current]?.url" :alt="`image-${current}`" />
          </div>
          <aside class="thumbs">
            <button
              v-for="(img, i) in images"
              :key="img.id ?? i"
              :class="['thumb', { active: i === current }]"
              @click="setCurrent(i)"
              :title="`Image ${i+1}`">

              <img :src="img.url" :alt="`thumb-${i}`" />
            </button>
          </aside>
        </div>

        <section class="desc">
          <h2>À propos</h2>
          <p v-if="hotel?.description?.length" class="text">{{ hotel.description }}</p>
          <p v-else class="muted">Pas de description fournie.</p>
        </section>

        <!-- MAP -->
        <section v-if="googleMapSrc" class="map">
          <iframe
            :src="googleMapSrc"
            width="100%" height="360"
            style="border:0;"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen>
          </iframe>
        </section>  
      </div>
    </section>
  </main>
</template>

<style scoped src="@/assets/styles/HotelView.css"></style>

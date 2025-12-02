<script setup>
import { computed } from 'vue'

// Tu peux passer :
// - embedSrc : le src exact copié depuis "Partager > Intégrer une carte" (recommandé pour afficher la fiche)
// - OU lat/lng (+ optionnel name) : on fabrique une URL d’embed simple
const props = defineProps({
  embedSrc: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  name: { type: String, default: '' },
  height: { type: String, default: '260px' },
})

function extractSrcIfIframe(s) {
  const m = String(s || '').match(/src="([^"]+)"/i)
  return m ? m[1] : s
}

const src = computed(() => {
  // 1) Cas idéal : on a collé le code <iframe ...> de Google → on récupère juste le src
  const fromEmbed = extractSrcIfIframe(props.embedSrc)
  if (fromEmbed) return fromEmbed

  // 2) Sinon, on construit une URL d’embed avec lat/lng (+ nom si fourni)
  if (Number.isFinite(props.lat) && Number.isFinite(props.lng)) {
    const q = props.name ? encodeURIComponent(props.name) : `${props.lat},${props.lng}`
    // Cette URL ne nécessite pas d’API key
    return `https://www.google.com/maps?hl=fr&ll=${props.lat},${props.lng}&q=${q}&z=17&output=embed`
  }

  return '' // rien à afficher
})

const expandUrl = computed(() => {
  if (!src.value) return ''
  // Lien "Agrandir le plan" (ouvre Google Maps plein écran)
  if (Number.isFinite(props.lat) && Number.isFinite(props.lng)) {
    return `https://www.google.com/maps?q=${props.lat},${props.lng}&z=17`
  }
  // sinon, on réutilise l’embedSrc si fourni
  return src.value.replace('output=embed', '')
})
</script>

<template>
  <div v-if="src" class="gmap-card" :style="{ '--h': height }">
    <iframe
      :src="src"
      width="100%"
      height="100%"
      style="border:0"
      allowfullscreen
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>

    <div class="actions">
      <a v-if="expandUrl" :href="expandUrl" target="_blank" rel="noopener">
        Agrandir le plan
      </a>
    </div>
  </div>
</template>

<style scoped>
.gmap-card{
  position: relative;
  width: 100%;
  height: var(--h);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}
.actions{
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(3px);
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 700;
  font-size: .9rem;
}
.actions a{ 
  color:#0a5; text-decoration:none; 
}
.actions a:hover{ 
  text-decoration:underline; 
}
</style>

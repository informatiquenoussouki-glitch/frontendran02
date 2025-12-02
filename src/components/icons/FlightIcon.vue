<template>
  <span :style="styleObj" class="flight-icon" aria-hidden="true"></span>
</template>

<script setup>
import { computed } from 'vue'

/*
 * On résout l'URL de l'image :
 * - si le fichier est dans src/assets/flight.png => new URL(...)
 * - sinon s'il est dans /public/flight.png => BASE_URL + 'flight.png'
 */
let planeUrl = ''
try {
  planeUrl = new URL('@/assets/flight.png', import.meta.url).href
} catch {
  planeUrl = (import.meta.env.BASE_URL || '/') + 'flight.png'
}

const props = defineProps({
  size:   { type: [Number, String], default: 56 },   // px ou '3rem'
  color:  { type: String, default: '#c5c7cb' },      // gris clair
  rotate: { type: Number, default: -45 },            // -45° aller / 135° retour
})

const styleObj = computed(() => ({
  display: 'inline-block',
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  backgroundColor: props.color,
  /* masquage PNG (Chrome/Safari/Edge/Firefox) */
  WebkitMask: `url(${planeUrl}) no-repeat center / contain`,
  mask:       `url(${planeUrl}) no-repeat center / contain`,
  transform:  `rotate(${props.rotate}deg)`,
}))
</script>

<style scoped>
.flight-icon { opacity: .55; } /* même rendu “gris” que ta maquette */
</style>

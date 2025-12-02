<script setup>
import { computed } from 'vue'


const props = defineProps({
  /** nombre de lits à afficher : 1..4 */
  occupancy: { type: Number, default: 1 },
  /** largeur totale du pictogramme (le composant adapte les lits) */
  size: { type: Number, default: 34 },
  /** couleur (doré/brun) */
  color: { type: String, default: '#b08962' },
  /** optionnel : petit texte “1 bed / 2 bed …” */
  caption: { type: Boolean, default: false },
})

const occ = computed(() => Math.min(4, Math.max(1, Number(props.occupancy) || 1)))

/* Disposition : 
   1 => [ [1] ]
   2 => [ [1,1] ]
   3 => [ [1,1], [1] ]
   4 => [ [1,1], [1,1] ] */
const layout = computed(() => {
  switch (occ.value) {
    case 1: return [[1]]
    case 2: return [[1,1]]
    case 3: return [[1,1],[1]]
    default: return [[1,1],[1,1]]
  }
})
</script>

<template>
  <div class="rt" :style="{ '--c': color, '--s': size + 'px' }">
    <div v-for="(row, ri) in layout" :key="ri" class="row">
      <svg v-for="ci in row" :key="ri + '-' + ci" viewBox="0 0 64 40" class="bed" aria-hidden="true">
        <!-- style “lit + tête + personne” (proche de ton exemple) -->
        <rect x="4"  y="10" width="6"  height="20" rx="3" />     <!-- tête de lit -->
        <circle cx="18" cy="22" r="6" />                         <!-- tête (personne) -->
        <rect x="26" y="16" width="30" height="12" rx="6" />     <!-- couette/matelas -->
        <rect x="10" y="28" width="46" height="6"  rx="2" />     <!-- cadre -->
        <rect x="56" y="28" width="4"  height="8"  rx="2" />     <!-- pied -->
      </svg>
    </div>
    <div v-if="caption" class="cap">{{ occ }} bed</div>
  </div>
</template>

<style scoped>
.rt{
  display:inline-flex; flex-direction:column; align-items:center;
  color:var(--c); width:var(--s);
}
.row{ display:flex; justify-content:center; gap:calc(var(--s) * .06); }
.bed{ width:calc(var(--s) * .42); height:auto; fill:currentColor; }
.cap{ font-size:.72rem; margin-top:.25rem; opacity:.8; }
</style>

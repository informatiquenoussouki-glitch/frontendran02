<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  /** Target date/time. Accepts 'YYYY-MM-DD', ISO string, Date, or timestamp */
  to: { type: [String, Number, Date], required: true },
  /** Size preset: 'sm' | 'md' */
  size: { type: String, default: 'sm' },
  /** Text when countdown finishes */
  endText: { type: String, default: 'Départ effectué' },
})

const targetMs = ref(0)
const left = ref(0)
let tickId

function parseTarget(v){
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return v
  if (!v) return 0
  // Date-only string → assume local midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T00:00:00').getTime()
  const d = new Date(v)
  return isNaN(d) ? 0 : d.getTime()
}

function update(){ left.value = Math.max(0, targetMs.value - Date.now()) }

function start(){
  clearInterval(tickId)
  update()
  tickId = setInterval(update, 1000)
}

watch(() => props.to, (v) => {
  targetMs.value = parseTarget(v)
  start()
}, { immediate: true })

onMounted(start)
onBeforeUnmount(() => clearInterval(tickId))

const done = computed(() => left.value <= 0)
const parts = computed(() => {
  let s = Math.floor(left.value / 1000)
  const d = Math.floor(s / 86400); s -= d * 86400
  const h = Math.floor(s / 3600);  s -= h * 3600
  const m = Math.floor(s / 60);    s -= m * 60
  const pad = (n) => String(n).padStart(2, '0')
  return { d, h: pad(h), m: pad(m), s: pad(s) }
})
</script>

<template>
  <div class="countdown" :class="size">
    <template v-if="!done">
      <div class="box"><div class="num">{{ parts.d }}</div><div class="lbl">Days</div></div>
      <div class="colon"></div>
      <div class="box"><div class="num">{{ parts.h }}</div><div class="lbl">Hrs</div></div>
      <div class="colon"></div>
      <div class="box"><div class="num">{{ parts.m }}</div><div class="lbl">Mins</div></div>
      <div class="colon"></div>
      <div class="box"><div class="num">{{ parts.s }}</div><div class="lbl">Secs</div></div>
    </template>
    <template v-else>
      <div class="done">{{ endText }}</div>
    </template>
  </div>
</template>

<style scoped>
.countdown{
  display:flex; align-items:flex-end; justify-content:center; flex-wrap:wrap;
  gap:6px;                 /* <- moins d’espace entre blocs (avant 10px) */
  font-variant-numeric: tabular-nums;
  color:#111;
}

.box{
  flex:0 0 auto;           /* ne pas s'étirer */
  width:48px;              /* <- largeur plus petite (au lieu d’un min-width:54px) */
  padding:6px 4px;         /* <- cadre plus fin */
  text-align:center;
}

.num{ font-size:22px; line-height:1; font-weight:300 }
.lbl{ font-size:10px; color:#666; margin-top:4px }
.colon{ font-size:22px; opacity:.6; padding:0 2px }
.done{ font-size:14px; color:#888 }

@media (max-width: 480px){
  .countdown{ gap:4px; }
  .box{ width:44px; padding:4px 3px; }
  .num{ font-size:18px; }
  .lbl{ font-size:9px; }
}
</style>

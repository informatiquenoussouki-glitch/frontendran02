<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] },
  apiBase: { type: String, default: '' },
  perView: { type: Number, default: 3 },
  gap: { type: Number, default: 16 },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 4000 }
})

const scroller = ref(null)
const cardW = ref(0)
const idx = ref(0)
let timer = null

// perView “actuel” (devient 1 en mobile, 2 en tablette)
const perViewNow = ref(props.perView)

const count = computed(() => props.items.length)
const maxIndex = computed(() => Math.max(0, count.value - perViewNow.value))

const toUrl = p => !p ? null : (/^https?:\/\//i.test(p) ? p : `${props.apiBase}/storage/${p}`)
const minPrice = o => {
  const arr = [o.price_single,o.price_double,o.price_triple,o.price_quadruple]
    .map(Number).filter(Number.isFinite)
  return arr.length ? Math.min(...arr) : null
}
const euroShort = v => v==null ? '—' : `${Math.round(v).toLocaleString('fr-FR')} €`
const fmtDM = iso => iso ? new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}) : '—'

function measure () {
  const el = scroller.value
  if (!el) return

  // responsive: 1 carte (≤640), 2 cartes (≤900), sinon props.perView
  const w = el.clientWidth
  perViewNow.value = w <= 640 ? 1 : (w <= 900 ? Math.min(props.perView, 2) : props.perView)

  const gaps = (perViewNow.value - 1) * props.gap
  cardW.value = Math.max(200, Math.floor((w - gaps) / perViewNow.value))
  jumpTo(idx.value)
}

function jumpTo (i) {
  const el = scroller.value
  if (!el || !cardW.value) return
  const x = i * (cardW.value + props.gap)
  el.scrollTo({ left: x, behavior: 'auto' })
}
function slideTo (i) {
  const el = scroller.value
  if (!el || !cardW.value) return
  const x = i * (cardW.value + props.gap)
  el.scrollTo({ left: x, behavior: 'smooth' })
}

function next(n=1) {
  if (!count.value) return
  idx.value = (idx.value + n) > maxIndex.value ? 0 : (idx.value + n)
  slideTo(idx.value)
}
function prev(n=1) {
  if (!count.value) return
  idx.value = (idx.value - n) < 0 ? maxIndex.value : (idx.value - n)
  slideTo(idx.value)
}

function start() {
  if (!props.autoplay || count.value <= perViewNow.value) return
  stop()
  timer = setInterval(() => next(1), props.interval)
}
function stop() { if (timer) { clearInterval(timer); timer = null } }

onMounted(async () => {
  await nextTick()
  measure()
  window.addEventListener('resize', measure, { passive:true })
  start()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  stop()
})

function onEnter(){ stop() }
function onLeave(){ start() }

watch(() => props.items, async () => {
  await nextTick(); measure(); start()
})
</script>

<template>
  <section class="row-wrap row-surface">
    <div class="row-head">
      <h3>{{ title }}</h3>
      
    </div>

    <div class="viewport with-arrows"
          @mouseenter="onEnter" @mouseleave="onLeave"
          @touchstart.passive="onEnter" @touchend.passive="onLeave">

         <button
    v-if="count > perView"
    class="arrow abs arrow-left"
    @click="prev()" aria-label="Précédent"
  >‹</button>

      <div class="track" ref="scroller" :style="{ gap: gap + 'px' }">
        <RouterLink
          v-for="o in items" :key="o.id"
          class="omra-card carousel-card"
          :style="{ width: cardW + 'px' }"
          :to="{ name:'omra-detail', params:{ id:String(o.id) } }">

          <div class="cover"
               :style="{ backgroundImage:`url(${toUrl(o.image_path) || '/placeholder-omra.jpg'})` }"/>

          <div class="body">
            <h4 class="title">{{ o.title }}</h4>
            <div class="dates" v-if="o.date_start || o.date_end">
              Du {{ fmtDM(o.date_start) }} au {{ fmtDM(o.date_end) }}
            </div>
          </div>

          <div class="bottom">
            <div class="price">
              à partir de <strong>{{ euroShort(minPrice(o)) }}</strong>
            </div>
            <span class="btn">PRÉ-RÉSERVEZ</span>
          </div>

          <span v-if="
            o?.sold_out || o?.is_full || o?.full ||
            (o?.spots_left != null && Number(o.spots_left) <= 0)
          " class="soldout">COMPLET</span>
        </RouterLink>
      </div>
      <button
    v-if="count > perView"
    class="arrow abs arrow-right"
    @click="next()" aria-label="Suivant"
  >›</button>
    </div>
  </section>
</template>

<style scoped>
/* keep only carousel mechanics here (width, scrolling, arrows, …) */
.row-wrap{ margin:20px 0 8px; }
.row-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.arrows{ display:flex; gap:8px; }
.arrow{
  width:36px; height:36px; border-radius:10px; border:1px solid #e6e9ef; background:#fff; cursor:pointer;
  font-size:20px; line-height:1; display:grid; place-items:center;
}
.arrow:hover{ background:#f6f7f9; }

.viewport{ overflow:hidden; }
.track{
  display:flex; align-items:stretch;
  overflow:hidden;
  padding:4px 2px 26px;
  scroll-behavior:smooth;
}

/* make the card a slide */
.carousel-card{ flex:0 0 auto; }


/* ==== Omra card (shared) ==== */
/* Carte */
.omra-card{
  position: relative;            /* pour le badge COMPLET */
  display:flex; 
  flex-direction:column;
  border-radius:14px;
  overflow:hidden;
  background:#fff;
  border:1px solid #e9edf2;
  box-shadow:0 10px 18px rgba(0,0,0,.06);
  text-decoration:none;
  color:inherit;
}
.omra-card .cover{
  aspect-ratio:16/10;
  background:#e5e7eb center/cover no-repeat;
}
.omra-card .body{
  padding:16px; 
  display:grid; 
  gap:6px;
}
.omra-card .title{ 
  margin:0; 
  font-size:1.06rem; 
  font-weight:800; 
}
.omra-card .dates { 
  color:#6b7280; 
  font-size:.92rem; 
}
.omra-card .bottom{
  margin-top:auto;
  display:flex; 
  align-items:center; 
  justify-content:space-between;
  gap:10px; 
  padding:0 16px 16px;
}
.omra-card .price { 
  color:#6b7280; 
  font-size:.92rem; 
}
.omra-card .price strong{ 
  color:var(--accent); 
  font-size:1.06rem; 
}

/* “Bouton” visuel dans la carte */
.omra-card .btn{
  display:inline-flex; 
  align-items:center; 
  justify-content:center;
  padding:10px 14px; 
  border-radius:999px;
  background:#e18700; 
  color:#fff; 
  font-weight:800;
  border:1px solid #e5e7eb; 
  transition:.15s ease;
}
.omra-card:hover .btn{
  
  box-shadow:0 8px 18px rgba(0,128,128,.18);
  transform:translateY(-1px);
}

/* Badge COMPLET */
.soldout{
  position:absolute; 
  top:12px; 
  right:12px;
  background:#ef4444; 
  color:#fff;
  font-weight:800; 
  font-size:.78rem;
  padding:6px 10px; 
  border-radius:8px;
  box-shadow:0 6px 14px rgba(239,68,68,.25);
}



/* le parent des flèches devient le contexte de positionnement */
.viewport.with-arrows{
  position: relative;
  overflow: hidden; /* garde les cartes nettes, les flèches restent dedans */
}

/* style commun des flèches en overlay */
.arrow.abs{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1px solid #e6e9ef;
  background: #fff;
  box-shadow: 0 6px 18px rgba(16,24,40,.12);
  display: grid; place-items: center;
  cursor: pointer;
}

/* A L’INTERIEUR du carrousel (sur les cartes), pas collées aux bords de page */
.arrow-left  { left: 10px; }
.arrow-right { right: 10px; }

.arrow.abs:hover{ background:#f6f7f9; }

/* sur mobile on les rapproche encore un poil des cartes */
@media (max-width:640px){
  .arrow-left  { left: 6px; }
  .arrow-right { right: 6px; }
}



</style>

<!-- import the shared visual styles (unscoped) -->

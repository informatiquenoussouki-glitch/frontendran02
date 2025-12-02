<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: () => [
      { label: 'ACCUEIL' , to: '/' },
      { label: 'OMRA', to: '/admin/omras/list' }, // CHANGÉ: ajouter "/" devant
      { label: 'OMRA ECONOMIQUE', to: '/omras/economique' },
      { label: 'OMRA CONFORT', to: '/omras/confort' },
      { label: 'OMRA RAMADAN', to: '/omras/ramadan' },
      { label: 'CONNEXION ' },
    ],
  },
  active: { type: Number, default: 0 },
  sticky: { type: Boolean, default: true },
})

/* --- Mobile only --- */
const open = ref(false)
const toggle = () => (open.value = !open.value)
const close  = () => (open.value = false)

/* Empêche le scroll de la page quand le menu est ouvert */
watch(open, v => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})
//bouton fermer  mobile
const onKey = (e) => { if (e.key === 'Escape') close() }

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="topbar" :class="{ sticky }" role="navigation" aria-label="Barre de navigation">
    <div class="inner">
      <div class="brand" aria-hidden="true">AUTRE VOYAGE</div>

      <!-- Desktop menu (inchangé) -->
      <ul class="menu" role="menubar">
        <li v-for="(it, i) in items" :key="i" role="none" :class="{ 'is-active': i === active }">
          <component
            :is="it.to ? RouterLink : 'span'"
            class="item"
            :to="it.to"
            role="menuitem"
            :tabindex="it.to ? 0 : 0"
            :aria-disabled="!it.to">
            {{ it.label }}
          </component>
        </li>
      </ul>

      <!-- Bouton hamburger (mobile) -->
      <button class="burger" @click="toggle" aria-label="Ouvrir le menu" aria-controls="mobile-nav" :aria-expanded="open">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Menu mobile plein écran -->
    <transition name="fade">
      <div v-if="open" id="mobile-nav" class="mobile-overlay" @click.self="close">
        <button class="mobile-close" @click="close" aria-label="Fermer">×</button>

        <nav class="mobile-nav" role="menu">
          <template v-for="(it,i) in items" :key="'m'+i">
            <component
              :is="it.to ? RouterLink : 'span'"
              class="m-item"
              :to="it.to"
              role="menuitem"
              @click="close">
              {{ it.label }}
              <svg v-if="it.to" viewBox="0 0 24 24" class="m-caret" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </component>
            <hr class="m-sep" />
          </template>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
:root{ --accent:#008080; --ink:#0f172a; --line:#e8eaee; }

/* ====== Barre (desktop – inchangé) ====== */
.topbar{ width:100%; background:rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid var(--line); z-index:50; }
.topbar.sticky{ position: sticky; top:0; }
.inner{ max-width:1200px; margin:0 auto; padding:10px 14px; display:flex; align-items:center; gap:14px; margin-left: 400px; }
.brand{ font-weight:900; letter-spacing:.06em; font-size:.9rem; color:var(--accent); white-space:nowrap; }
.menu{ display:flex; gap:14px; list-style:none; margin:0; padding:0; flex-wrap:wrap; }
.menu li{ position:relative; padding:6px 8px; border-radius:10px; }
.item{ font-size:.82rem; font-weight:800; letter-spacing:.03em; text-transform:uppercase; color:#4a5568; text-decoration:none; outline:none; }
.menu li:hover{ background:rgba(0,128,128,.06); }
.menu li.is-active{ background:rgba(0,128,128,.08); }
.menu li.is-active .item{ color:var(--accent); }
.menu li.is-active::after{ content:""; position:absolute; left:8px; right:8px; bottom:-6px; height:2px; border-radius:2px; background:var(--accent); }
.item:not(a){ cursor:default; }
a.item{ cursor:pointer; }

/* ====== Bouton hamburger (caché sur desktop) ====== */
.burger{
  display:none;          /* visible seulement en mobile */
  margin-left:auto;
  width:40px; height:40px;
  border:1px solid #e7ebf0; border-radius:10px;
  background:#fff; cursor:pointer;
  align-items:center; justify-content:center;
}
.burger span{
  display:block; width:18px; height:2px; background:#111; margin:3px auto;
}

/* ====== Menu mobile fullscreen ====== */
.mobile-overlay{
  position:fixed; inset:0; background:rgba(0,0,0,.6);
  backdrop-filter: blur(2px);
  /* CHANGÉ: on utilise un layout qui colle le panneau sur tout l'écran,
     pas un petit cadre centré. */
  display:block;                 /* au lieu de flex/center */
  z-index:9999;
}

/* CHANGÉ: le panneau (nav) occupe TOUT l'écran */
.mobile-nav{
  position: fixed;               /* colle au viewport */
  inset: 0;                      /* top/right/bottom/left = 0 */
  width: 100vw;                  /* plein écran */
  height: 100vh;                 /* plein écran */
  background:#111111e1; color:#fff;
  border-radius:0;               /* pas d'arrondis */
  padding: 72px 18px 24px;       /* espace haut pour le bouton × */
  overflow: auto;                /* si contenu long */
 
}


/* BOUTON FERMETURE — fixé au viewport, toujours visible */
.mobile-close{
  position: fixed;            /* <— pas absolute : reste dans le coin de l’écran */
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 0;
  background: #ffffffd9;
  color: #111;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  z-index: 10000;             /* au-dessus du panneau */
  box-shadow: 0 6px 16px rgba(0,0,0,.25);
  display: grid;
  place-items: center;
}
.mobile-close:hover{ background:#fff; }
.mobile-close:active{ transform: scale(.98); }

/* items */
.m-item{
  display:flex; align-items:center; justify-content:center; /* texte centré */
  gap:8px;
  text-decoration:none; color:#fff; font-weight:800; letter-spacing:.03em;
  padding:14px 18px; text-transform:uppercase;
}
.m-item:hover{ background:#222; }
.m-caret{ width:16px; height:16px; opacity:.6; }
.m-sep{ width:78%; margin:0.25rem auto; border:0; border-top:1px solid rgba(255,255,255,.18); }

/* Animation d’apparition */
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; }

/* ====== Règles MOBILE UNIQUEMENT (≤ 900px) ====== */
@media (max-width: 900px){
  .menu{ display:none; }            /* on masque la barre d’onglets */
  .burger{ display:inline-flex; }   /* on montre le bouton */
  .inner{ margin-left: 0; }         /* pas de décalage en mobile */
}
</style>

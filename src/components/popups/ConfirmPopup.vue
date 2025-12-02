<!-- src/components/popups/ConfirmPopup.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  variant:    { type: String,  default: 'error' },   // 'error' recommandé pour delete
  title:      { type: String,  default: 'Confirmation' },
  message:    { type: String,  default: '' },
  okText:     { type: String,  default: 'OK' },
  cancelText: { type: String,  default: 'Annuler' },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const open = computed({
  get: () => props.modelValue,
  set: v   => emit('update:modelValue', v)
})

function onConfirm(){
  emit('confirm')
  open.value = false
}
function onCancel(){
  emit('cancel')
  open.value = false
}
</script>

<template>
  <div v-if="open" class="cp-backdrop">
   <div class="cp-card" :class="`is-${variant}`" role="dialog" aria-modal="true" @submit.prevent>
     <!-- Icône héro (poubelle) -->
      <div class="cp-hero">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="cp-trash">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      </div>

      <!-- Titre + message -->
      <h3 class="cp-title">{{ title }}</h3>
      <p class="cp-text" style="white-space:pre-line">{{ message }}</p>

      <!-- Actions -->
      <button type="button" class="cp-primary" @click.stop.prevent="onConfirm">
        {{ okText }}
      </button>
      <button type="button" class="cp-secondary" @click.stop.prevent="onCancel">
        {{ cancelText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Backdrop légèrement assombri (tu peux mettre un jaune uni si tu veux coller 100%) */
.cp-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display: grid; place-items: center; z-index: 1000;
}
.cp-card{
  width: min(360px, 92vw);
  background: #fff;
  border-radius: 22px;
  padding: 22px 20px 16px;
  box-shadow: 0 18px 40px rgba(0,0,0,.18);
  text-align: center;
}
/* Héro */
.cp-hero{
  width: 84px; height: 84px; margin: -60px auto 10px;
  background: #fff; border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0,0,0,.12);
  display: grid; place-items: center;
}
.cp-trash{
  width: 44px; height: 44px; stroke: #e53935; /* rouge */
  fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
.cp-title{
  font-size: 20px; font-weight: 700; margin: 8px 0 6px;
}
.cp-text{
  margin: 0 0 16px; color: #444; line-height: 1.5;
}
/* Bouton principal large et arrondi */
.cp-primary{
  display: block; width: 100%;
  border: none; border-radius: 28px;
  padding: 12px 18px; font-weight: 700; cursor: pointer;
  background: #e53935; color: #fff;
  transition: filter .15s ease;
}
.cp-primary:hover{ filter: brightness(0.95); }
/* Lien secondaire */
.cp-secondary{
  display: inline-block; margin-top: 10px;
  border: none; background: transparent; cursor: pointer;
  color: #e53935; font-weight: 600; text-decoration: underline;
}
/* Variantes si besoin */
.is-warning .cp-trash{ stroke:#e53935; }   /* orange */
.is-success .cp-trash{ stroke:#2e7d32; }   /* vert */
</style>

<!-- src/components/popups/ConfirmPopup.vue -->
<template>
  <div v-if="open" class="cp-backdrop">
    <div class="cp-card" role="dialog" aria-modal="true">
      <!-- Icône héro -->
      <div class="cp-hero" :class="heroClass">
        <!-- 🟢 vert = valider -->
        <i v-if="mode === 'approve'" class="fa-solid fa-check"></i>

        <!-- 🟡 jaune = rejeter -->
        <i v-else-if="mode === 'reject'" class="fa-solid fa-xmark"></i>

        <!-- 🔴 rouge = supprimer -->
        <svg v-else viewBox="0 0 24 24" aria-hidden="true" class="cp-trash">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      </div>

     
      <p class="cp-text" style="white-space:pre-line">{{ message }}</p>

      <button
        type="button"
        class="cp-primary"
        :class="btnClass"
        @click.stop.prevent="onConfirm"
      >
        {{ okText }}
      </button>

      <button
        type="button"
        class="cp-secondary"
        @click.stop.prevent="onCancel"
      >
        {{ cancelText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },

  
  message:    { type: String,  default: '' },
  okText:     { type: String,  default: 'OK' },
  cancelText: { type: String,  default: 'Annuler' },

  // 'approve' | 'reject' | 'delete'
  mode: {
    type: String,
    default: 'delete'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const open = computed({
  get: () => props.modelValue,
  set: v   => emit('update:modelValue', v)
})

const heroClass = computed(() => ({
  'hero-approve': props.mode === 'approve',
  'hero-reject' : props.mode === 'reject',
  'hero-delete' : props.mode === 'delete',
}))

const btnClass = computed(() => ({
  'btn-approve': props.mode === 'approve',
  'btn-reject' : props.mode === 'reject',
  'btn-delete' : props.mode === 'delete',
}))

function onConfirm () {
  emit('confirm')
  open.value = false
}
function onCancel () {
  emit('cancel')
  open.value = false
}
</script>

<style scoped>
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

/* Héro (rond) */
.cp-hero{
  width: 84px; height: 84px; margin: -60px auto 10px;
  border-radius: 999px;
  display: grid; place-items: center;
  box-shadow: 0 6px 20px rgba(0,0,0,.12);
}
.cp-trash{
  width: 44px; height: 44px;
  stroke: currentColor;
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
  color: #fff;
  transition: filter .15s ease;
}
.cp-primary:hover{ filter: brightness(0.96); }

/* Lien secondaire */
.cp-secondary{
  display: inline-block; margin-top: 10px;
  border: none; background: transparent; cursor: pointer;
  color: #444; font-weight: 600;
}

/* ==== Couleurs selon le mode ==== */
/* rond */
.cp-hero.hero-approve {           /* vert */
  background: #dcfce7;
  color: #15803d;
}
.cp-hero.hero-reject {            /* jaune */
  background: #fef3c7;
  color: #d97706;
}
.cp-hero.hero-delete {            /* rouge */
  background: #fee2e2;
  color: #dc2626;
}

/* bouton */
.cp-primary.btn-approve {
  background: #16a34a;
}
.cp-primary.btn-reject {
  background: #f59e0b;
}
.cp-primary.btn-delete {
  background: #e53935;
}
</style>

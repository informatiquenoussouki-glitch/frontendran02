<template>
  <teleport to="body">
    <div v-if="modelValue" class="ap-overlay" @click.self="close">
      <div class="ap-modal" role="dialog" aria-modal="true">
        <!-- pastille qui dépasse -->
        <div class="ap-badge" :class="`is-${variant}`" aria-hidden="true">
          <svg v-if="variant==='success'" viewBox="0 0 24 24" class="ap-ico">
            <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="variant==='error'" viewBox="0 0 24 24" class="ap-ico">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="variant==='warning'" viewBox="0 0 24 24" class="ap-ico">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" class="ap-ico">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <h4 class="ap-title">{{ title }}</h4>
        <p class="ap-text">{{ message }}</p>

        <div class="ap-actions">
          <button class="ap-btn" :class="`is-${variant}`" @click="close">{{ primaryText }}</button>
          <button v-if="secondaryText" class="ap-btn ghost" @click="$emit('secondary')">
            {{ secondaryText }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue:  { type: Boolean, default: false },
  variant:     { type: String,  default: 'success' }, // success | error | warning | info
  title:       { type: String,  default: 'Succès' },
  message:     { type: String,  default: '' },
  primaryText: { type: String,  default: 'OK' },
  secondaryText: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue','close'])

function close(){ 
    emit('update:modelValue', false)
    emit('close') }

function onKey(e){ if (e.key === 'Escape') close() }
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

watch(() => props.modelValue, v => {
  
    document.body.style.overflow = v ? 'hidden' : ''
  }
)
</script>

<style scoped>
/* Overlay */
.ap-overlay{
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 999999; animation: ap-fade .15s ease-out;
}
/* Boîte */
.ap-modal{
  width: 380px; max-width: calc(100vw - 32px);
  background: #fff; border-radius: 14px;
  box-shadow: 0 20px 45px rgba(0,0,0,.25);
  padding: 72px 18px 18px; position: relative; text-align: center;
  animation: ap-pop .18s ease-out;
}
/* Pastille */
.ap-badge{
  position: absolute; top: -36px; left: 50%; transform: translateX(-50%);
  width: 72px; height: 72px; border-radius: 50%;
  display: grid; place-items: center; color: #fff; border: 6px solid #fff;
  box-shadow: 0 10px 20px rgba(0,0,0,.12);
}
.ap-ico{ width: 34px; height: 34px; }

/* Variants (couleurs) */
.ap-badge.is-success{ background:#35b34a; }
.ap-badge.is-error{   background:#e53935; }
.ap-badge.is-warning{ background:#f59e0b; }
.ap-badge.is-info{    background:#3b82f6; }

/* Titre/texte */
.ap-title{ font-size: 22px; line-height: 1.25; margin: 6px 0 8px; font-weight: 700; color:#111; }
.ap-text{ margin: 0 auto 16px; color:#5f6368; max-width: 90%; }

/* Boutons */
.ap-actions{ display:flex; gap:8px; }
.ap-btn{
  flex:1 1 auto; background:#35b34a; color:#fff; border:0;
  border-radius: 10px; padding: 12px 14px; font-size: 15px; cursor: pointer;
  transition: transform .06s ease, filter .06s ease;
}
.ap-btn:hover{ filter: brightness(1.05); }
.ap-btn:active{ transform: translateY(1px); }
.ap-btn.is-success{ background:#35b34a; }
.ap-btn.is-error{   background:#e53935; }
.ap-btn.is-warning{ background:#f59e0b; }
.ap-btn.is-info{    background:#3b82f6; }
.ap-btn.ghost{ background:#fff; color:#111; border:1px solid #e5e7eb; }

/* Animations */
@keyframes ap-fade{ from{ opacity:0 } to{ opacity:1 } }
@keyframes ap-pop { from{ transform: translateY(6px) scale(.98); opacity:.9 }
                    to  { transform: translateY(0)  scale(1);    opacity:1 } }
</style>

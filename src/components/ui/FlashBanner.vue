<script setup>
import { computed } from 'vue'
import { useFlash } from '@/composables/useFlash'

const { state, clear } = useFlash()
const isVisible = computed(() => !!state.message)
</script>

<template>
  <transition name="fade">
    <div v-if="isVisible"
         class="flash-banner"
         :class="state.type === 'success' ? 'flash-success' : 'flash-error'">
      <span>{{ state.message }}</span>
      <button class="flash-close" @click="clear" aria-label="Fermer">✕</button>
    </div>
  </transition>
</template>

<style scoped>
.flash-banner{
  position: fixed;
  right: 14px;
  top: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .7rem .9rem;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0,0,0,.12);
  color: #0f172a;
}
.flash-success{ background:#dcfce7; border:1px solid #86efac; }
.flash-error{   background:#fee2e2; border:1px solid #fca5a5; }
.flash-close{
  border:none; background:transparent; cursor:pointer; font-size:14px; color:#334155;
}
.fade-enter-active, .fade-leave-active { transition: opacity .18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

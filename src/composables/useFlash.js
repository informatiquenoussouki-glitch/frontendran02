import { reactive } from 'vue'

const state = reactive({ type: null, message: '', timeoutId: null })

function show(type, message, ms = 3000) {
  if (state.timeoutId) clearTimeout(state.timeoutId)
  state.type = type
  state.message = message
  state.timeoutId = setTimeout(() => {
    state.type = null
    state.message = ''
    state.timeoutId = null
  }, ms)
}

export function useFlash() {
  return {
    state,
    success: (msg, ms) => show('success', msg, ms),
    error:   (msg, ms) => show('error',   msg, ms),
    clear:   ()        => show(null, '', 0),
  }
}

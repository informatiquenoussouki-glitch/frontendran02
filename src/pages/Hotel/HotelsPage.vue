<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'       // ✅ CORRECT
const hotels = ref([])

onMounted(async () => {
  const { data } = await api.get('/hotels')
  hotels.value = data
})
</script>

<template>
  <main style="max-width:900px;margin:2rem auto">
    <h1>Hôtels</h1>
    <ul>
      <li v-for="h in hotels" :key="h.id">{{ h.name }} — {{ h.stars }}★ ({{ h.city || '-' }})</li>
    </ul>
  </main>
</template>

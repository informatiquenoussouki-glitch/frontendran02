<template>
  <div class="hotels-container">
    <h1 class="page-title">{{ post?.title || 'Article' }}</h1>

    <div class="card table-card" v-if="!loading && post">
      <div class="muted">
        {{ labelCat(post.category) }} — {{ formatDate(post.published_at) }} • ~ {{ post.reading_time || 3 }} min
      </div>

      <div v-if="post.cover_url" style="margin:14px 0;">
        <img :src="post.cover_url" alt="" style="max-width:100%; border-radius:12px;">
      </div>

      <div class="post-content" v-html="post.content"></div>

      <div style="margin-top:16px; display:flex; gap:8px;">
        <RouterLink class="btn" to="/blog">← Retour au blog</RouterLink>
        <RouterLink class="btn" to="/omras">Voir nos Omra</RouterLink>
      </div>
    </div>

    <div v-else>Chargement…</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const slug = route.params.slug
const post = ref(null)
const loading = ref(false)

const labelCat = c => ({ omra:'Omra', economique:'Omra économique', confort:'Omra confort', ramadan:'Omra Ramadan' }[c] || c)
const formatDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'

const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/blog/${slug}`)
    post.value = data
    document.title = (data.seo_title || data.title) + ' | Blog'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', data.meta_description || data.excerpt || '')
  } finally { loading.value = false }
}
load()
</script>

<style scoped>
.post-content :deep(img){ max-width:100%; height:auto; border-radius:8px; }
.post-content :deep(h2){ margin-top:1.2rem; }
.post-content :deep(p){ line-height:1.7; }
</style>

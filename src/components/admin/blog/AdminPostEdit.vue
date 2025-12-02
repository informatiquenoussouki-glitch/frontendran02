<template>
  <div class="hotels-container">
    <h1 class="page-title">Éditer l’article</h1>
    <div class="card table-card" v-if="loaded">
      <PostForm :model-value="form" submit-label="Enregistrer" @submit="updatePost" />
    </div>
    <div v-else>Chargement…</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import PostForm from './AdminPostForm.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const loaded = ref(false)
const form = ref({
  title:'', excerpt:'', content:'',
  category:'omra', status:'draft',
  seo_title:'', meta_description:'', cover_url:null
})

onMounted(async () => {
  const { data } = await api.get(`/admin/posts/${id}`)
  form.value = {
    title: data.title ?? '',
    excerpt: data.excerpt ?? '',
    content: data.content ?? '',
    category: data.category ?? 'omra',
    status: data.status ?? 'draft',
    seo_title: data.seo_title ?? '',
    meta_description: data.meta_description ?? '',
    cover_url: data.cover_url ?? null
  }
  loaded.value = true
})

const updatePost = async ({ form, file }) => {
  const fd = new FormData()
  Object.entries(form).forEach(([k,v]) => fd.append(k, v ?? ''))
  if (file) fd.append('cover', file)

  // ⚠️ Spoof PUT pour accepter un fichier (multipart)
  fd.append('_method', 'PUT')
  await api.post(`/admin/posts/${id}`, fd)    // POST + _method=PUT
  router.push('/admin/blog/posts')
}
</script>

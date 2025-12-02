<template>
  <div class="hotels-container">
    <h1 class="page-title">Nouvel article</h1>
    <div class="card table-card">
      <PostForm :model-value="form" submit-label="Créer" @submit="createPost" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import PostForm from './AdminPostForm.vue'

const router = useRouter()

const form = ref({
  title:'', excerpt:'', content:'',
  category:'omra', status:'draft',
  seo_title:'', meta_description:'', cover_url:null
})

const createPost = async ({ form, file }) => {
  const fd = new FormData()
  Object.entries(form).forEach(([k,v]) => fd.append(k, v ?? ''))
  if (file) fd.append('cover', file)

  await api.post('/admin/posts', fd)          // POST normal
  router.push('/admin/blog/posts')
}
</script>

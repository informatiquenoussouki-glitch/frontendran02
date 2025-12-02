<template>
  <main class="blog-page">
    <h1 class="blog-title">Nos articles de blog</h1>

    <!-- Filtres simples -->
    <div class="blog-categories-row">
      <div class="categories">
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          class="cat-btn"
          :class="{ active: filters.category === cat.value }"
          @click="setCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="blog-search-row">
      <div class="search">
        <i class="fa fa-search search-icon"></i>
        <input
          v-model="filters.q"
          @keyup.enter="load(1)"
          class="search-input"
          type="text"
          placeholder="Rechercher un article…"
        />
      </div>
    </div>



    <!-- Grille d’articles -->
    <section class="posts-grid" v-if="posts.length">
      <article
        v-for="post in posts"
        :key="post.id"
        class="post-card"
      >
        <RouterLink :to="`/blog/${post.slug}`" class="card-link">
          <div
            class="card-thumb"
            :style="{ backgroundImage: `url(${post.cover_url || defaultCover})` }"
          ></div>

          <div class="card-overlay">
            <h2 class="card-title">{{ post.title }}</h2>

            <p class="card-meta">
              <i class="fa-regular fa-calendar"></i>
              {{ formatDate(post.published_at || post.created_at) }}
              <span v-if="post.category"> • {{ categoryLabel(post.category) }}</span>
            </p>

            <p class="card-excerpt">
              {{ makeExcerpt(post) }}
            </p>
          </div>
        </RouterLink>
      </article>
    </section>

    <p v-else-if="!loading" class="empty-text">
      Aucun article trouvé pour ces critères.
    </p>

    <!-- Pagination -->
    <!-- Pagination avec numéros -->
    <div class="blog-pagination" v-if="meta.last_page > 1">
      <button
        v-for="page in pages"
        :key="page"
        type="button"
        class="page-btn"
        :class="{ active: page === meta.current_page }"
        @click="load(page)"
      >
        {{ page }}
      </button>
    </div>

  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const posts = ref([])
const loading = ref(false)
const meta = ref({
  current_page: 1,
  last_page: 1,
})

const filters = ref({
  q: '',
  category: '',
})

const categories = [
  { value: '',          label: 'Toutes' },
  { value: 'omra',      label: 'Omra' },
  { value: 'economique',label: 'Omra économique' },
  { value: 'confort',   label: 'Omra confort' },
  { value: 'ramadan',   label: 'Omra Ramadan' },
]

// image par défaut si pas de cover
const defaultCover = '/images/blog-default.jpg' // adapte le chemin

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await api.get('/blog', {
      params: {
        page,
        q: filters.value.q || undefined,
        category: filters.value.category || undefined,
      },
    })

    posts.value = data.data || []
    meta.value = {
      current_page: data.current_page,
      last_page: data.last_page,
    }
  } catch (e) {
    console.error('Erreur chargement blog', e)
  } finally {
    loading.value = false
  }
}

function setCategory(cat) {
  filters.value.category = cat
  load(1)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function categoryLabel(cat) {
  const found = categories.find(c => c.value === cat)
  return found ? found.label : cat
}

onMounted(() => load(1))

function makeExcerpt(post) {
  // 1) Si excerpt existe, on l’utilise
  if (post.excerpt) return post.excerpt

  // 2) Sinon, on prend le début du contenu (en enlevant le HTML)
  if (post.content) {
    const text = String(post.content)
      .replace(/<[^>]+>/g, ' ')   // enlève les balises HTML
      .replace(/\s+/g, ' ')
      .trim()

    if (!text) return ''
    return text.slice(0, 140) + (text.length > 140 ? '…' : '')
  }

  return ''
}

const pages = computed(() => {
  const total = meta.value.last_page || 1
  const current = meta.value.current_page || 1
  const result = []

  // simple : 1..last_page (tu pourras optimiser plus tard si tu as 50 pages)
  for (let i = 1; i <= total; i++) {
    result.push(i)
  }

  return result
})


</script>

<style scoped>
.blog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 15px 40px;
}

.blog-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #c69d11;
  text-align: center;
  margin-bottom: 30px;
  margin-top: 20px;
 
}

/* Filtres */
.blog-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
}

/* 🔍 Recherche centrée, au-dessus des filtres */
.blog-search-row {
  display: flex;
  justify-content: flex-end;   /* ← au centre au lieu de flex-end */
  margin-bottom: -25px;       /* petit espace avec les filtres */
}

.search {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 45%;
  transform: translateY(-50%);
  opacity: .6;
}
.search-input {
  width: 320px;
  height: 40px;
  border: 1px solid #E2E8F0;
  border-radius: 999px;
  padding: 0 14px 0 36px;
  font-size: 15px;
}
.search-input:focus {
  border-color: #b38b00 !important;
  box-shadow: 0 0 0 3px rgba(197, 157, 67, 0.4) !important;
  outline: none !important;
}


/* 🏷️ Filtres centrés */
.blog-categories-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* Catégories */
.categories {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.cat-btn {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 6px 14px;
  font-size: .85rem;
  cursor: pointer;
  transition: background .25s ease, color .25s ease, border-color .25s ease;
}


/* Grille */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 🎯 3 par ligne */
  gap: 20px;
  max-width: 1150px;
  margin-top: 30px;
}

/* Carte article (style proche de ta capture) */
.post-card {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  height: 300px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,.12);
  background: #000;
}
.card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}
.card-thumb {
  width: 100%;
  padding-top: 100%;                 /* ratio d’image */
  background-size: cover;
  background-position: center;
}


.card-meta {
  font-size: 14px;
  opacity: .9;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.card-meta i {
  font-size: 18px;
}



/* Hover */
.post-card:hover .card-thumb {
  filter: brightness(1.05);
}


/* Pagination */
.blog-pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.pager-btn {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  cursor: pointer;
  background: #fff;
}
.pager-btn[disabled] {
  opacity: .5;
  cursor: not-allowed;
}
.pager-info {
  font-size: .9rem;
  color: #4b5563;
}

.empty-text {
  margin-top: 20px;
  text-align: center;
  color: #6b7280;
}

@media (max-width: 768px) {
  .blog-filters {
    flex-direction: column;
    align-items: center;
  }
  .categories {
    justify-content: center;
  }
}

/* ----- Bande verte : ÉTAT NORMAL (bas seulement) ----- */
.card-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 180px; /* ≈ hauteur de la bande en bas */
  padding: 14px 18px 32px;

  /* bande en bas avec dégradé vers le haut, on voit l'image au-dessus */
  background: linear-gradient(
    to top,
    rgba(0, 128, 128, 0.95) 0%,
    rgba(0, 128, 128, 0.95) 40%,
    rgba(0, 128, 128, 0.0) 100%
  );

  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  overflow: hidden;
  transition: height .25s ease, background .25s ease;
}

/* Titre + meta toujours visibles */
.card-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 6px;
}

/* Extrait : caché par défaut */
.card-excerpt {
  font-size: 15px;
  margin: 6px 0 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: opacity .2s ease, max-height .25s ease;
}

/* ----- AU SURVOL : la bande couvre TOUTE l’image ----- */
.post-card:hover .card-overlay {
  height: 100%;                            /* monte jusqu’en haut */
  background: rgba(0, 128, 128, 0.92);     /* couleur pleine comme ta capture */
}

/* On révèle l’extrait */
.post-card:hover .card-excerpt {
  max-height: 90px;   /* 2–3 lignes */
  opacity: 1;
}

/* Optionnel : petit effet sur l’image */
.post-card:hover .card-thumb {
  filter: brightness(0.9);  /* assombrit un peu l’image sous le voile vert */
}

/* Hover sur les catégories */
.cat-btn {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 6px 14px;
  font-size: .85rem;
  cursor: pointer;
  transition: background .25s ease, color .25s ease, border-color .25s ease;
}

.cat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 5px rgba(197, 157, 67, 0.4);
  border-color: #c59d43;
}

/* Bouton actif (catégorie sélectionnée) */
.cat-btn.active {
  transform: translateY(-2px);
  box-shadow: 0 3px 3px rgba(197, 157, 67, 0.4);
  background: #c59d43;
  color: #fff;
  font-weight: 600;
  border-color: #c59d43;
}


/* Responsive mobile */
@media (max-width: 768px) {
  .blog-search-row {
    justify-content: center;
  }
}


.blog-pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* Style d’un bouton de page */
.page-btn {
  min-width: 42px;
  height: 42px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background .2s ease, color .2s ease, border-color .2s ease,
              box-shadow .2s ease, transform .1s ease;
}

/* Hover */
.page-btn:hover {
  border-color: #008080;
  box-shadow: 0 2px 6px rgba(0, 128, 128, 0.15);
}

/* Page active (comme le carré bleu de ta capture, mais en vert/bleu site) */
.page-btn.active {
  background: #008080;
  border-color: #008080;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 128, 128, 0.25);
  font-weight: 600;
}


</style>

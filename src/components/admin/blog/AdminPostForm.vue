<template>
  <form @submit.prevent="save">
  <div class="grid-2col">

    <!-- ░░░ Carte GAUCHE : contenu principal ░░░ -->
    <div class="card form-card">
      <div class="card-title">Contenu</div>

      <label class="lbl">Titre</label>
      <input v-model="local.title" type="text" class="input" required />

      <label class="lbl">Contenu</label>
      <textarea v-model="local.content" class="textarea content" required></textarea>
    </div>

    <!-- ░░░ Carte DROITE : méta & image ░░░ -->
    <div class="card form-card sticky-col">
      <div class="card-title">Paramètres</div>

      <label class="lbl">Catégorie</label>
      <select v-model="local.category" class="input" required>
        <option value="omra">Omra</option>
        <option value="economique">Omra économique</option>
        <option value="confort">Omra confort</option>
        <option value="ramadan">Omra Ramadan</option>
      </select>

      <label class="lbl">Statut</label>
      <select v-model="local.status" class="input" required>
        <option value="draft">Brouillon</option>
        <option value="published">Publié</option>
      </select>

      <label class="lbl">Image à la une</label>
      <input type="file" @change="onFile" accept="image/*" />
      <div v-if="preview" class="cover-preview">
        <img :src="preview" alt="cover">
      </div>

      <label class="lbl">SEO Title</label>
      <input v-model="local.seo_title" type="text" class="search-input" />

      <label class="lbl">Meta Description</label>
      <textarea v-model="local.meta_description" rows="4" class="textarea"></textarea>

      <div class="actions">
        <RouterLink class="btn btn-light" to="/admin/blog/posts">Annuler</RouterLink>
        <button class="btn btn-primary" type="submit">{{ isEdit ? 'Enregistrer' : 'Créer' }}</button>
      </div>
    </div>
  </div>
</form>

</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  // données initiales pour edit (ou valeurs par défaut pour create)
  modelValue: {
    type: Object,
    default: () => ({
      title:'', excerpt:'', content:'',
      category:'omra', status:'draft',
      seo_title:'', meta_description:'', cover_url:null
    })
  },
  submitLabel: { type: String, default: 'Enregistrer' }
})

const emit = defineEmits(['submit'])

const local = ref({ ...props.modelValue })
const file = ref(null)
const preview = ref(props.modelValue?.cover_url || null)

watch(() => props.modelValue, (v) => {
  local.value = { ...v }
  preview.value = v?.cover_url || null
}, { deep: true })

const onFile = (e) => {
  file.value = e.target.files?.[0] || null
  preview.value = file.value ? URL.createObjectURL(file.value) : (props.modelValue?.cover_url || null)
}

const save = () => {
  emit('submit', { form: { ...local.value }, file: file.value })
}
</script>

<style scoped>
/* grille générale */
.form-grid{
  display:grid;
  grid-template-columns: minmax(0, 2fr) 1fr;
  gap:16px;
}

/* colonnes */
.main { min-width: 0; }
.side {
  align-self: start;
  position: sticky;
  top: 16px;            /* la colonne de droite reste visible en scroll */
}

/* champs communs */
label{ display:block; font-weight:600; margin:10px 0 6px; color:#0f172a; }
.input, .textarea{
  width:100%;
  box-sizing:border-box;
  border:1px solid #e5e7eb;
  border-radius:10px;
  padding:10px 12px;
  background:#fff;
  outline:none;
}
.input:focus, .textarea:focus{ border-color:#bfdbfe; box-shadow:0 0 0 3px rgba(191,219,254,.5); }

/* fichiers + aperçu */
.input-file{ width:100%; }
.cover-preview{ margin-top:8px; border:1px solid #e5e7eb; border-radius:10px; padding:6px; }
.cover-preview img{ max-width:100%; border-radius:8px; display:block; }

/* tailles agrandies */
.textarea.excerpt{
  min-height: 140px;    /* + grand qu’avant */
  resize: vertical;
}
.textarea.content{
  min-height: 600px;    /* grande zone d’édition principale */
  resize: vertical;     /* on laisse l’utilisateur étirer si besoin */
}

/* actions */
.form-actions{
  margin-top:14px;
  display:flex;
  gap:8px;
  justify-content:flex-end;
}
/* Boutons — style identique à la capture 1 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  min-width: 110px;
  height: 38px;
  border-radius: 999px;           /* coins très arrondis comme sur la capture 1 */
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;          /* enlève le soulignement du RouterLink */
}



/* responsive */
@media (max-width: 992px){
  .form-grid{ grid-template-columns: 1fr; }
  .side{ position: static; }               /* pas de sticky sur mobile */
  .textarea.content{ min-height: 380px; }  /* un peu plus compact en mobile */
}


/* Grille 2 colonnes (2fr/1fr sur desktop, 1 col sur mobile) */
.grid-2col {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}
@media (max-width: 992px) {
  .grid-2col { grid-template-columns: 1fr; }
}

/* Carte générique */
.card.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,.05);
}

/* Titre de carte */
.card-title {
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 10px;
}

/* Labels et champs */
.lbl { display:block; font-weight:600; margin:10px 0 6px; color:#0f172a; }
.search-input { width:100%; }
.search-input.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* Aperçu cover */
.cover-preview {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.cover-preview img { display:block; width:100%; height:auto; }

/* Actions (dans la carte droite) */
.actions {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Boutons */
.btn { height: 36px; padding: 0 14px; border-radius: 10px; border: 1px solid #e5e7eb; background:#fff; cursor:pointer; }
/* Bouton secondaire (Annuler) */
.btn-light {
  background: #ffffff;
  border-color: #00a7ff;
  color: #00a7ff;
}

.btn-light:hover {
  background: #e6f5ff;
}

/* Bouton principal (Ajouter / Créer) */
.btn-primary {
  background: #00a7ff;           /* adapte au bleu que tu utilises ailleurs si besoin */
  border-color: #00a7ff;
  color: #fff;
}

.btn-primary:hover {
  background: #008fda;
  border-color: #008fda;
}

/* Optionnel: garder la colonne droite visible quand on scrolle du texte long */
.sticky-col { position: sticky; top: 12px; align-self: start; }


</style>
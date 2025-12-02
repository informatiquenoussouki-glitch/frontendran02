<template>
  <main class="temoignage-wrapper">
    <section class="testimonial-card">
      <!-- Titre -->
      <header class="header-area">
        <h2>Laisser un témoignage</h2>
        <p>
          Parlez-nous de votre expérience (Omra, service client...).<br />
          Votre avis peut aider les futurs pèlerins.
        </p>
      </header>

      <!-- Identité -->
      <div class="form-group">
        <div class="row-inline">
          <!-- Nom -->
          <div class="col">
            <label class="form-label">
              <span>Votre nom complet</span>
              <span class="required">*</span>
            </label>
            <input
              class="text-input"
              type="text"
              placeholder="Ex : Mohamed Ali"
              v-model="form.name"
              :readonly="isLoggedIn"
            />
            <p v-if="isLoggedIn" class="autofill-hint">(Pré-rempli depuis votre compte)</p>
          </div>

          <!-- Ville / Pays -->
          <div class="col">
            <label class="form-label">
              <span>Ville / Pays</span>
              <span class="optional">(optionnel)</span>
            </label>
            <input
              class="text-input"
              type="text"
              placeholder="Ex : Paris, France"
              v-model="form.location"
              :readonly="isLoggedIn"
            />
            <p v-if="isLoggedIn && form.location" class="autofill-hint">(Pré-rempli depuis votre compte)</p>
          </div>
        </div>
      </div>

      <!-- Photo profil -->
      <div class="form-group">
        <label class="form-label">
          <span>Photo de profil</span>
          <span class="optional">(optionnel)</span>
        </label>
        <div class="avatar-upload">
          <div
            class="avatar-thumb"
            v-if="form.avatarUrl"
            :style="{ backgroundImage: 'url(' + form.avatarUrl + ')' }"
          ></div>
          <div class="avatar-thumb placeholder" v-else>+<br />Photo</div>
        </div>
      </div>

      <!-- Note étoiles -->
      <div class="form-group">
        <div class="rating-block">
          <div class="rating-row">
            <div class="rating-label">
              <span>Votre note globale</span>
              <span class="required">*</span>
            </div>
            <div class="stars">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="i <= form.rating ? 'active' : 'inactive'"
                @click="setRating(i)"
              >★</span>
            </div>
          </div>
          <div class="rating-hint">1★ Très déçu • 3★ Correct • 5★ Excellent</div>
        </div>
      </div>

      <!-- Titre témoignage -->
      <div class="form-group">
        <label class="form-label">
          <span>Titre de votre avis</span>
          <span class="optional">(optionnel)</span>
        </label>
        <input
          class="text-input"
          type="text"
          placeholder="Ex : Omra parfaite du début à la fin"
          v-model="form.title"
        />
      </div>

      <!-- Témoignage -->
      <div class="form-group">
        <label class="form-label">
          <span>Votre témoignage</span>
          <span class="required">*</span>
        </label>
        <textarea
          class="textarea-input"
          placeholder="Parlez de l'organisation, des hôtels, des transferts, du guide religieux..."
          v-model="form.content"
        ></textarea>
      </div>

      <!-- ✅ Plus de section photos -->

      <!-- Bouton -->
      <div class="submit-wrap">
        <button class="submit-btn" type="button" @click="submitForm" :disabled="submitting">
          <span v-if="submitting">Envoi en cours...</span>
          <span v-else>Envoyer mon témoignage</span>
        </button>
        <p class="legal-note">
          En envoyant, j'autorise la publication de mon avis sur le site (après validation).
        </p>
      </div>
    </section>

    <!-- Popup succès / erreur -->
    <AlertPopup
      v-model="showAlert"
      :variant="alertData.variant"
      :title="alertData.title"
      :message="alertData.message"
      :primary-text="alertData.primaryText"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AlertPopup from '@/components/popups/AlertPopup.vue'

const isLoggedIn = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  location: '',
  avatarUrl: '',
  rating: 5,
  title: '',
  content: ''
})

/* ===== AlertPopup (succès / erreur) ===== */
const showAlert = ref(false)
const alertData = ref({
  variant: 'success',
  title: 'Succès',
  message: '',
  primaryText: 'OK'
})

function openSuccess (msg) {
  alertData.value = {
    variant: 'success',
    title: 'Merci pour votre témoignage',
    message: msg || 'Votre avis a bien été envoyé.',
    primaryText: 'Fermer'
  }
  showAlert.value = true
}

function openError (msg) {
  alertData.value = {
    variant: 'error',
    title: 'Erreur',
    message: msg || 'Une erreur est survenue lors de l’envoi de votre témoignage.',
    primaryText: 'Fermer'
  }
  showAlert.value = true
}

/* ===== Préremplir avec /api/me ===== */
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return

  try {
    const res = await axios.get('http://localhost:8000/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
    const data = res.data
    isLoggedIn.value = true
    form.value.name      = data.full_name || ''
    form.value.location  = data.location || ''
    form.value.avatarUrl = data.avatar_url || ''
  } catch (err) {
    console.error('Erreur chargement utilisateur', err)
  }
})

/* ===== Gestion des étoiles ===== */
function setRating (i) {
  form.value.rating = i
}

/* ===== Soumission ===== */
async function submitForm () {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    openError('Vous devez être connecté pour envoyer un témoignage.')
    return
  }

  if (!form.value.content || !form.value.rating) {
    openError('Merci de renseigner au minimum une note et un témoignage.')
    return
  }

  submitting.value = true

  try {
    const res = await axios.post(
      'http://localhost:8000/api/testimonials',
      {
        rating: form.value.rating,
        title: form.value.title,
        content: form.value.content
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Réponse OK du backend:', res.data)
    openSuccess(res.data.message)

    form.value.title   = ''
    form.value.content = ''
  } catch (err) {
    console.error('--- ERREUR AXIOS ---')
    console.error('status =', err.response?.status)
    console.error('data   =', err.response?.data)

    if (err.response?.status === 422 && err.response.data?.errors) {
      const errors = err.response.data.errors

      let messages = Object.values(errors).flat().map(msg => {
        if (msg.includes('The content field must be at least')) {
          return 'Le témoignage doit contenir au moins 10 caractères.'
        }
        if (msg.includes('The rating field is required')) {
          return 'Veuillez donner une note.'
        }
        return msg
      }).join('\n')

      openError(messages)
      return
    } else if (err.response?.data?.message) {
      openError(err.response.data.message)
    } else {
      openError("Erreur réseau : impossible d’atteindre l’API (CORS, serveur down, etc.)")
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style src="@/assets/styles/Temoignages.css"></style>

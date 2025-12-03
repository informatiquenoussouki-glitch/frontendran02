<template>
  <div class="form-container">
<h2 class="title">
  🕋 Réservation Omra 
  <span v-if="omraTitle" style="color:#967a50;">{{ omraTitle }}</span>
</h2>

    <form @submit.prevent="handleSubmit">
      <!-- 🧍 Nom / Prénom -->
      <div class="grid-2">
        <div class="field">
          <label>Nom <span class="required">*</span></label>
          <input v-model="form.nom" placeholder="Nom" required />
        </div>

        <div class="field">
          <label>Prénom <span class="required">*</span></label>
          <input v-model="form.prenom" placeholder="Prénom" required />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Nom de l’entreprise (facultatif)</label>
          <input v-model="form.entreprise" placeholder="Nom de l’entreprise" />
        </div>

        <div class="field">
          <label>Adresse e-mail <span class="required">*</span></label>
          <input type="email" v-model="form.email" placeholder="Adresse e-mail"   @blur="checkEmail"
   required />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Adresse postale <span class="required">*</span></label>
          <input v-model="form.adresse" placeholder="Adresse postale" required />
        </div>
        <div class="field">
          <label>Chambre <span class="required">*</span></label>
          <select v-model="form.type_chambre" required>
            <option value="">Sélectionner une chambre</option>
            <option
              v-for="chambre in chambresDisponibles"
              :key="chambre.value"
              :value="chambre.value"
            >
              {{ chambre.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 📞 Téléphone + 📅 Naissance -->
      <div class="grid-2">
        <div class="field">
          <label>Numéro de téléphone <span class="required">*</span></label>
<input
  id="phone"
  type="tel"
  v-model="form.telephone"
  placeholder=" Numéro de téléphone "
  required
/>
        </div>


        <div class="field">
          <label>Date de naissance <span class="required">*</span></label>
          <input type="date" v-model="form.naissance" required />
        </div>
      </div>

      <h3 class="section-title">Nombre de voyageurs</h3>

      <div class="grid-3">
        <div class="field">
          <label>Adultes (12 ans et plus) <span class="required">*</span></label>
          <input type="number" v-model="form.adultes" min="1" value="1" />
        </div>

        <div class="field">
          <label>Enfants (2–11 ans)</label>
          <input type="number" v-model="form.enfants" min="0" />
        </div>

        <div class="field">
          <label>Bébés (- de 2 ans)</label>
          <input type="number" v-model="form.bebes" min="0" />
        </div>
      </div>

      <!-- 🔘 Choix devis/paiement -->
      <div class="field radio-block">
        <div class="radio-list">
          <label>
            <input type="radio" value="acompte" v-model="form.option" />
            Réserver et payer un acompte de 200 €
          </label>
          <label>
            <input type="radio" value="devis" v-model="form.option" />
            Recevoir un devis
          </label>
        </div>
      </div>


<!-- 💰 Affichage dynamique du prix total -->
<div v-if="prixTotal > 0" class="total-prix">
  <h3 style="text-align:center; color:#967a50; font-size:1.6em; font-weight:bold;">
    Prix total {{ prixTotal.toLocaleString("fr-FR") }}€
  </h3>
</div>


      <!-- ✅ Bouton validation -->
      <div class="actions">
        <button class="btn-submit" type="submit">Valider</button>
      </div>
    </form>

    <!-- ✅ Message de succès -->
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </div>
</template>





<script setup>


import "intl-tel-input/build/css/intlTelInput.css";

/* -----------------------------------------------------------
🧭 Importations principales
----------------------------------------------------------- */
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import api from "@/services/api";

/* 🌍 Import de la bibliothèque pour le champ téléphone */
import intlTelInput from "intl-tel-input";



/* -----------------------------------------------------------
🔹 Variables principales
----------------------------------------------------------- */
const route = useRoute();
const router = useRouter();
const successMessage = ref("");
const omraId = route.params.id;
const omraTitle = ref("");
const chambresDisponibles = ref([]);
const prixTotal = ref(0); // 💰 total dynamique

/* -----------------------------------------------------------
🧾 Données du formulaire
----------------------------------------------------------- */
const form = ref({
  nom: "",
  prenom: "",
  entreprise: "",
  email: "",
  adresse: "",
  tel: "",
  naissance: "",
  type_chambre: "",
  adultes: 1,
  enfants: 0,
  bebes: 0,
  option: "devis",
});






/* -----------------------------------------------------------
Initialisation lors du montage du composant
----------------------------------------------------------- */
onMounted(async () => {
  /* ✅ Charger les informations de l'Omra */
  if (omraId) {
    try {
      const { data } = await api.get(`/omras/${omraId}`);
      omraTitle.value = data.title || data.data?.title || "Omra";

      //  Types de chambre disponibles
      chambresDisponibles.value = [
        data.price_single ? { value: "simple", label: `Simple (${data.price_single}€ pp)` } : null,
        data.price_double ? { value: "double", label: `Double (${data.price_double}€ pp)` } : null,
        data.price_triple ? { value: "triple", label: `Triple (${data.price_triple}€ pp)` } : null,
        data.price_quadruple ? { value: "quadruple", label: `Quadruple (${data.price_quadruple}€ pp)` } : null,
      ].filter(Boolean);
    } catch (e) {
      console.error("❌ Erreur chargement Omra :", e);
      omraTitle.value = "Omra";
    }
  }





  /* ✅ Rendre le champ date cliquable sans icône */
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput && dateInput.showPicker) {
    dateInput.addEventListener("click", () => dateInput.showPicker());
  }





  /* ✅ Pré-remplir le formulaire si retour depuis l’inscription */
  const emailQuery = route.query.email;
  if (emailQuery) {
    form.value.email = emailQuery;
    await loadUserData(emailQuery);
  }







  /* -----------------------------------------------------------
  📞 Initialisation du champ téléphone avec drapeau + code auto
  ----------------------------------------------------------- */
  const phoneInput = document.querySelector("#phone"); // ton input doit avoir
  //  id="phone"

  if (phoneInput) {
    const iti = intlTelInput(phoneInput, {
      initialCountry: "fr", // par défaut Tunisie 🇹🇳
      preferredCountries: ["tn", "fr", "sa", "ca", "ma"], // pays fréquents
      separateDialCode: true, // affiche +216 séparé du numéro
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
     });

    // ✅ À la sortie du champ, on insère le numéro complet (+216...)
    phoneInput.addEventListener("blur", () => {
      form.value.tel = iti.getNumber(); // format international E.164
    });
  }
});







/* -----------------------------------------------------------
📧 Charger les infos utilisateur via e-mail
----------------------------------------------------------- */
const loadUserData = async (email) => {
  try {
    const { data } = await api.get(`/user-by-email/${email}`);
    if (data.exists) {
      form.value.nom = data.user.nom;
      form.value.prenom = data.user.prenom;
      form.value.tel = data.user.tel;
      form.value.adresse = data.user.adresse;
      form.value.naissance = data.user.naissance?.slice(0, 10) || "";
    }
  } catch (error) {
    console.error("❌ Erreur loadUserData :", error);
  }
};







/* -----------------------------------------------------------
💰 Calcul du prix total selon la chambre et voyageurs
----------------------------------------------------------- */
const getSelectedPrice = () => {
  const chambre = chambresDisponibles.value.find(
    (c) => c.value === form.value.type_chambre
  );
  if (!chambre) return 0;
  const match = chambre.label.match(/(\d+)/);
  return match ? parseFloat(match[1]) : 0;
};

const calculerPrixTotal = () => {
  const prixBase = getSelectedPrice();
  if (!prixBase) {
    prixTotal.value = 0;
    return;
  }

  const nbAdultes = Number(form.value.adultes) || 0;
  const nbEnfants = Number(form.value.enfants) || 0;
  const nbBebes = Number(form.value.bebes) || 0;

  // 💰 Règles de tarification
  const totalAdultes = nbAdultes * prixBase;
  const totalEnfants = nbEnfants * Math.max(prixBase - 70, 0);
  const totalBebes = nbBebes * 400;

  prixTotal.value = totalAdultes + totalEnfants + totalBebes;
};

// 🔁 Recalcul automatique si valeurs changent
watch(
  () => [
    form.value.type_chambre,
    form.value.adultes,
    form.value.enfants,
    form.value.bebes,
  ],
  calculerPrixTotal,
  { deep: true }
);







/* -----------------------------------------------------------
🚨 Validation capacité chambre
----------------------------------------------------------- */
const validateRoomCapacity = () => {
  const total = Number(form.value.adultes) + Number(form.value.enfants);
  const type = form.value.type_chambre;
  const capacity = { simple: 1, double: 2, triple: 3, quadruple: 4 }[type] || 0;

  if (capacity > 0 && total > capacity) {
    Swal.fire({
      icon: "warning",
      title: "Capacité de chambre dépassée ⚠️",
      text: `Une chambre ${type} peut accueillir au maximum ${capacity} personne${capacity > 1 ? "s" : ""}.`,
      confirmButtonText: "OK",
      confirmButtonColor: "#d33",
    });
    return false;
  }
  return true;
};




/* -----------------------------------------------------------
📨 Vérifie si un utilisateur existe (par email)
----------------------------------------------------------- */
let hasAskedToCreate = false; // 🔥 Empêche la double popup

const checkEmail = async () => {
  if (!form.value.email) return;

  try {
    const { data } = await api.get(`/user-by-email/${form.value.email}`);

    if (data.exists) {

      // 🔄 Reset : si un email existe, on peut permettre une future popup
      hasAskedToCreate = false;

      Object.assign(form.value, {
        nom: data.user.nom,
        prenom: data.user.prenom,
        telephone: data.user.tel,

        adresse: data.user.adresse,
        naissance: data.user.naissance?.slice(0, 10) || "",
      });
    } else {

      // ❗ Empêche d'afficher SweetAlert deux fois
      if (hasAskedToCreate) return;
      hasAskedToCreate = true;

      const result = await Swal.fire({
        icon: "question",
        title: "Aucun compte trouvé",
        text: "Souhaitez-vous créer un compte ?",
        showCancelButton: true,
        confirmButtonText: "Oui, créer un compte",
        cancelButtonText: "Non, continuer sans compte",
      });

      if (result.isConfirmed) {
        router.push({
          path: "/register",
          query: { redirectAfter: route.fullPath, email: form.value.email },
        });
      }
    }
  } catch (error) {
    console.error("❌ Erreur checkEmail :", error);
  }
};










/* -----------------------------------------------------------
✅ Soumission du formulaire
----------------------------------------------------------- */
const handleSubmit = async () => {
  if (!validateRoomCapacity()) return;

  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id || null;

    const payload = {
      ...form.value,
      omra_id: omraId,
      user_id: userId,
  tel: form.value.telephone, // ✅ envoi correct

    };

    console.log("Payload envoyé à l’API :", payload);

    /* 🔄 Envoi au backend Laravel */
    const { data } = await api.post("/reservations", payload);

    /* ✅ Message de confirmation */
    Swal.fire({
      icon: "success",
      title: "Réservation enregistrée ✅",
      text: "Votre réservation a été enregistrée avec succès.",
      timer: 2000,
      showConfirmButton: false,
    });





 /* ✅ 3) Si l’utilisateur choisit PAYER un acompte */
    if (form.value.option === "acompte") {
      try {
        const payloadStripe = {
          amount: 20000, // 200€ en centimes
          name: `Acompte réservation Omra #${data.reservation.id}`,
          reservation_id: data.reservation.id,
        };

        const checkout = await api.post("/checkout", payloadStripe);

        if (checkout.data.url) {
          window.location.href = checkout.data.url;  // ✅ redirection Stripe
          return; // stop — pas de génération de devis
        }
      } catch (error) {
        console.error("❌ Erreur Stripe :", error);

        Swal.fire({
          icon: "error",
          title: "Erreur paiement",
          text: "Impossible d’ouvrir la page de paiement Stripe.",
        });

        return;
      }
    }






    /* 🧾 Génération du devis si demandé */
    if (form.value.option === "devis" && data.devis && data.reservation) {
      const omraId = data.reservation.omra_id;
      const devisRef = data.devis.reference;
      const pdfUrl = `http://127.0.0.1:8000/reservation/${omraId}/devis/pdf/${devisRef}`;

      console.log("🔗 URL du devis :", pdfUrl);
      window.open(pdfUrl, "_blank");

      /* 📩 Envoi automatique de l'e-mail au client */
      try {
        await api.post("/send-devis-mail", {
          email: form.value.email,
          nom: form.value.nom,
  omra_id: data.reservation.omra_id, // ✅ on envoie l'ID de l'Omra
          lien: pdfUrl,
        });
        console.log("📧 Email de devis envoyé avec succès !");
      } catch (mailError) {
        console.error("❌ Erreur lors de l'envoi de l'email :", mailError);
      }
    }

    /* 🔄 Réinitialisation du formulaire */
    successMessage.value = "✅ Réservation enregistrée avec succès !";
    setTimeout(() => (successMessage.value = ""), 4000);

    form.value = {
      nom: "",
      prenom: "",
      entreprise: "",
      email: "",
      adresse: "",
        telephone: "", // ✅ ici

       naissance: "",
      type_chambre: "",
      adultes: 1,
      enfants: 0,
      bebes: 0,
      option: "devis",
    };
    prixTotal.value = 0;
  } catch (error) {
    console.error("❌ Erreur :", error);
    Swal.fire({
      icon: "error",
      title: "Erreur de réservation",
      text: "Une erreur est survenue. Veuillez vérifier vos informations.",
      confirmButtonColor: "#d33",
    });
  }
};

</script>









<style scoped>
/* 🎨 Couleurs */
:root {
  --gold: #c9a227;
  --beige: #f8f3e7;
  --green-dark: #0f3d2e;
  --green-hover: #145a40;
  --red: #d93025;
}

/* 🧾 Conteneur */
.form-container {
  max-width: 900px;
  margin: 25px auto;
  background: var(--beige);
  border-radius: 14px;
  padding: 30px 40px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  font-family: "Poppins", sans-serif;
  border: 2px solid var(--gold);
}

.title {
  text-align: center;
  color: #967a50;
  font-weight: 600;
  margin-bottom: 25px;
  font-size: 24px;
}

/* 🧱 Grilles */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  color: var(--green-dark);
  font-weight: normal;
  font-size: 14px;
  margin-bottom: 4px;
}

.required {
  color: #d93025;
}

input,
select {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.2s ease;
  font-size: 14.5px;
  background-color: #fff;
  color: #333;
  height: 36px;
}

input:focus,
select:focus {
  border-color: var(--gold);
  box-shadow: 0 0 3px rgba(201, 162, 39, 0.4);
  outline: none;
}

/* 🧍 Section titre */
.section-title {
  margin: 18px 0 10px;
  color: var(--green-dark);
  font-size: 16px;
  font-weight: 600;
}

/* 🔘 Radios */
.radio-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 5px;
  margin-left: 2px;
}

.radio-list label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--green-dark);
  font-weight: normal;
  font-size: 14.5px;
}

.radio-list input[type="radio"] {
  accent-color: var(--green-dark);
  width: 15px;
  height: 15px;
}



/* ✅ Bouton compact et centré */
.actions {
  margin-top: 15px;
  display: flex;
  justify-content: center; /* ✅ Centrage horizontal */
}

/* 🌼 Bouton clair, élégant et luxueux */
.btn-submit {
  background-color:  #0a7a7a;;     /* fond beige clair */
  color: #fafbfc ;        /* texte vert foncé */
  padding: 12px 26px;
  width: auto;
  border: 1.5px solid var(--gold);  /* fine bordure dorée */
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s ease;
  display: inline-block;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
}

/* ✨ Survol doré */
.btn-submit:hover {
   border-color: var(--gold);
  box-shadow: 0 0 8px rgba(201, 162, 39, 0.4);
}


.success-message {
  text-align: center;
  color: var(--green-dark);
  font-weight: 600;
  margin-top: 15px;
  background: #e9f6f3;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--gold);
}








/* 📱 Responsive */
@media (max-width: 768px) {
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }

  .btn-submit {
    width: 100%;
  }
}
</style>

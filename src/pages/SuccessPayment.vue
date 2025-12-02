<template>
  <div style="padding:40px;text-align:center;">
    <h1 style="color:#28a745;">✅ Paiement réussi !</h1>
    <p>Merci pour votre confiance. Votre acompte a été enregistré.</p>

    <a 
      href="/" 
      style="margin-top:20px;display:inline-block;background:#967a50;color:white;
             padding:10px 20px;border-radius:10px;text-decoration:none;">
      Retour à l’accueil
    </a>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import api from "@/services/api";
import { useRoute } from "vue-router";

const route = useRoute();


onMounted(async () => {
  const sessionId = route.query.session_id;

  if (!sessionId) {
    console.error("⚠️ Aucun session_id reçu");
    return;
  }

  try {
    await api.post("/stripe/confirm-payment", { session_id: sessionId });
    console.log("✅ Paiement confirmé, DB mise à jour !");
  } catch (error) {
    console.error("❌ Erreur confirmation paiement :", error);
  }
});



</script>

<script setup>
import axios from 'axios'

const payerAcompte = async () => {
  try {
    const res = await axios.post('http://localhost:8000/api/checkout', {
      amount: 20000,   // 200€ en centimes
      name: "Acompte séjour Omra"
    })

    // Redirection vers Stripe Checkout
    window.location.href = res.data.url
  } catch (error) {
    console.error(error)
    alert("Erreur lors du paiement")
  }
}
</script>

<template>
  <button 
    @click="payerAcompte"
    style="padding:10px 18px;background:#967a50;color:white;border:none;border-radius:10px;cursor:pointer;font-size:16px;"
  >
    Payer l’acompte 200€
  </button>
</template>

<template>
  <section class="about-page">
    <!-- Section d'en-tête -->
    <div class="about-header">
      <h1>À propos de nous</h1>
      <p>
        Spécialisés dans <strong>l’organisation de la Omra</strong>, nous t’accompagnons dans ton
        voyage spirituel vers La Mecque et Médine, avec confiance, sérénité et excellence.
      </p>
    </div>

    <!-- Bloc principal -->
    <div class="about-content">
      <div class="about-section">
        <h2>🌙 Notre mission</h2>
        <p>
          Chez <strong>MonSiteOmra</strong>, nous croyons que la Omra n’est pas un simple voyage, 
          mais une <strong>expérience spirituelle profonde</strong> qui transforme le cœur du croyant.
          Notre mission est de rendre cette adoration accessible à tous, avec une organisation 
          claire, humaine et bienveillante.
        </p>
      </div>

      <div class="about-section">
        <h2>🕋 Une expertise dédiée à la Omra</h2>
        <p>
          Depuis plusieurs années, notre équipe s’est consacrée exclusivement à la 
          <strong>Omra</strong> et à ses différentes formules :
        </p>
        <ul>
          <li>✨ Omra Confort — pour un séjour paisible et haut de gamme</li>
          <li>💰 Omra Pas Cher — pour voyager sans se ruiner</li>
          <li>🌙 Omra Ramadan — pour vivre des nuits bénies dans les lieux saints</li>
        </ul>
        <p>
          Nous sélectionnons avec soin les hôtels, les vols et les guides pour te garantir
          un <strong>voyage sacré sans stress</strong>.
        </p>
      </div>

      <div class="about-section">
        <h2>✈️ Pourquoi nous choisir ?</h2>
        <ul class="features-list">
          <li><strong>Spécialistes de la Omra uniquement</strong> — notre expertise repose sur des années d’expérience.</li>
          <li><strong>Accompagnement humain et spirituel</strong> — bienveillance et disponibilité avant tout.</li>
          <li><strong>Transparence totale</strong> — pas de frais cachés, des offres claires et adaptées à chaque budget.</li>
          <li><strong>Service client 7j/7</strong> — toujours là pour toi avant, pendant et après ton séjour.</li>
        </ul>
      </div>

      <div class="about-section">
        <h2>💫 Notre vision</h2>
        <p>
          Nous croyons que chaque pèlerin mérite de vivre la Omra dans les meilleures conditions :
          paix, dignité et proximité avec Allah. C’est pourquoi nous mettons tout notre savoir-faire
          au service de ton <strong>voyage spirituel</strong>.
        </p>
      </div>

      <div class="about-section">
        <h2>🤝 Notre engagement</h2>
        <p>
          Notre promesse est simple :
        </p>
        <ul>
          <li>🕌 T’accompagner comme un frère ou une sœur dans la foi</li>
          <li>📋 T’offrir une organisation fluide et sécurisée</li>
          <li>🌍 Faire de ta Omra un souvenir à vie</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
// Aucune logique spécifique nécessaire pour cette page statique
</script>

<style scoped>
.about-page {
  margin-top: 50px;
  margin-bottom: 50px;
  padding: 30px 10%;
  border: 1px solid #f3f3f3;
  border-radius: 18px;
  background: #ffffff;
  color: #555;
  font-family: "Poppins", sans-serif;
}

.about-header {
  text-align: center;
  margin-bottom: 40px;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #c69d11;
  margin-bottom: 20px;
}

.about-header p {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: #777;
}

.about-section {
  background: #f8f8f8;
  margin-bottom: 30px;
  padding: 30px;
  border-radius: 10px;
  border-left: 5px solid #c69d11;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.about-section h2 {
  color: #c69d11;
  margin-bottom: 15px;
}

.about-section p,
.about-section ul {
  font-size: 1rem;
  line-height: 1.7;
  color: #555;
}

.about-section ul {
  list-style: none;
  padding-left: 0;
}

.about-section li {
  margin-bottom: 8px;
  padding-left: 25px;
  position: relative;
}

.about-section li::before {
  content: "•";
  color: #c69d11;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 1.2rem;
}

.features-list li strong {
  color: #333;
}

@media (max-width: 768px) {
  .about-page {
    padding: 20px;
  }

  .about-header h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  /* ✅ Espace avant le bloc blanc */
  .about-page {
    margin-top: 60px; /* ajuste à 70-100px selon la hauteur du header */
  }
}
</style>

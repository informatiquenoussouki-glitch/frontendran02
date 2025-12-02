<template>
  <div class="home">

    <!-- HERO -->
    <section class="hero">
      <!-- Colonne gauche -->
      <div class="hero-left">
        <p class="kicker">Vous voulez partir faire votre Omra ?</p>
        <h1 class="heading">
          <span>Omra et Hajj</span>
          <strong>
            Votre partenaire privilégié<br />
            pour accomplir<br />
            Omra et Hajj
          </strong>
        </h1>
        <p class="lead">
          L’agence Autre Voyage est officiellement agréée pour l’organisation du Hajj et de la Omra
          (agrément saoudien : 1068). Nous attestons organiser ces pèlerinages pour les fidèles musulmans.
        </p>
        <div class="cta-row">
          <button class="btn btn-primary">Explorer nos forfaits Omra</button>
          <button class="btn btn-ghost">Pré-inscription Hajj 2026</button>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="hero-right">
        <div class="arch">
          <img src="@/assets/images/omra5.webp" alt="Illustration Omra" />
          <span class="arch-border" />
        </div>
      </div>
    </section>

    <!-- SECTION FORFAITS -->
    <section class="offers">
      <h2>Omra Économique</h2>
      <h2>Omra Confort</h2>
      <h2>Omra Ramadan</h2>
    </section>
  </div>
</template>

<script>
import PublicHeader from "../components/publicheader.vue";
export default { components: { PublicHeader } };
</script>

<style scoped>
/* ======================= GLOBAL ======================= */
.home {
  width: 100%;
  min-height: 100vh;
  background: #f7fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 60px;
}

/* ======================= HERO ======================= */
.hero {
  width: 100%;
  max-width: 1200px; /* ✅ même largeur que le contenu central */
  
  background: #fff;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  padding: 60px 70px;
  gap: 50px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
}

/* Colonne gauche */
.hero-left {
  position:relative; z-index:1; padding:0px 0 80px; 
}
.kicker {
  color: #8a8f99;
  font-size: 0.95rem;
  margin-bottom: 6px;
}
.heading > span {
  display: block;
  font-weight: 800;
  font-size: 1.5rem;
  color: #008080;
}
.heading > strong {
  display: block;
  margin-top: 6px;
  line-height: 1.1;
  font-size: clamp(1.8rem, 3.8vw, 2.6rem);
}
.lead {
  color: #5b6575;
  max-width: 550px;
  margin: 12px 0 20px;
}
.cta-row {
  display: flex;
  flex-direction: row;       /* ✅ côte à côte */
  align-items: center;       /* ✅ alignés verticalement */
  gap: 10px;                 /* ✅ espace régulier */
  flex-wrap: nowrap;         /* ✅ empêche le retour à la ligne */
  margin-top: 16px;
}

/* Boutons */
.btn {
  flex: 1;                    /* ✅ les deux prennent la même largeur */
  max-width: 230px;           /* ✅ largeur maximale propre */
  height: 45px;               /* ✅ même hauteur */
  display: flex;
  align-items: center;
  justify-content: center;    /* ✅ texte centré verticalement et horizontalement */
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid #008080;
  cursor: pointer;
  transition: 0.2s ease;
  white-space: nowrap;        /* ✅ évite les retours à la ligne */
}

.btn-primary {
  background: #008080;
  color: #fff;
}
.btn-ghost {
  background: #fff;
  color: #008080;
}
.btn-ghost:hover {
  background: #1f777775;
  color: #fff;
}

.btn-primary:hover {
  background: rgba(0, 128, 128, 0.06);
  color: #008080;
}

/* Colonne droite */
.hero-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.arch {
  position: relative;
  width: 400px;
  aspect-ratio: 3/4;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}
.arch img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.arch-border {
  position: absolute;
  inset: 0;
  border-radius: 28px;
  box-shadow: 0 0 0 4px #e7e0cf inset, 0 0 0 1px rgba(0, 0, 0, 0.06) inset;
}

/* ======================= SECTIONS OFFRES ======================= */
.offers {
  margin-top: 60px;
  width: 100%;
  max-width: 1200px; /* ✅ même largeur que le hero */
  text-align: left;
}
.offers h2 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #083e3e;
}

/* ======================= RESPONSIVE ======================= */
/* ----------------- Mode Mobile ------------------------ */
/* ========== Correction d'affichage mobile (≤950px) ========== */
@media (max-width: 950px) {

  /* Le conteneur principal centré */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 25px 16px 40px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  /* Bloc texte */
  .hero-left {
    width: 100%;
    max-width: 480px;
    padding: 0;
  }

  /* Empêche le texte de se couper */
  .hero-left p,
  .kicker,
  .heading,
  .lead {
    white-space: normal !important;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .kicker {
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .heading > span {
    display: block;
    font-size: 1.4rem;
    color: #008080;
    font-weight: 700;
  }

  .heading > strong {
    display: block;
    font-size: 1.3rem;
    color: #000;
    font-weight: 700;
    line-height: 1.3;
    margin-top: 6px;
  }

  .lead {
    font-size: 0.9rem;
    color: #444;
    line-height: 1.5;
    margin: 12px auto 18px;
  }

  /* Boutons */
  .cta-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .btn {
    width: 100%;
    max-width: 320px;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 12px 16px;
    border-radius: 10px;
  }

  .btn-primary {
    background: #008080;
    color: #fff;
    border: none;
  }

  .btn-ghost {
    background: transparent;
    color: #008080;
    border: 2px solid #008080;
  }

  /* Image de la Kaaba */
  .hero-right {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .arch {
    width: 90%;
    max-width: 350px;
    border-radius: 20px;
    overflow: hidden;
  }

  .arch img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

}

/* === Espacement autour de la page sur mobile === */
@media (max-width: 950px) {
  body {
    background-color: #f9fbff; /* même fond doux */
  }

  .home {
    padding-left: 18px;
    padding-right: 18px;
    padding-top: 50px;
  }

  .hero {
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    margin: 10px 0 25px;
  }
}



</style>

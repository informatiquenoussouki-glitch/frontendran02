<template>
  <footer class="footer-noussouki">
    <div class="footer-noussouki__inner">

      <!-- ===================== -->
      <!-- LIGNE 1 : AGENCE + NEWSLETTER -->
      <!-- ===================== -->
      <div class="footer-noussouki__top">
        <!-- Colonne 1 : logo + infos agence -->
        <div class="footer-noussouki__col footer-noussouki__col--brand">
          <div class="footer-noussouki__logo">
            <!-- <img src="..." alt="Noussouki Travel" /> -->
          </div>

          <div class="footer-noussouki__block">
            <h4>Agence Omra</h4>
            <p><strong>Courriel Demande spécifique :</strong> reservation.noussouki@gmail.com</p>
            <p><strong>Numéro de téléphone :</strong> +33 1 79 36 01 66</p>
            <p><strong>Instagram :</strong> Noussoukitravel.com</p>
            <p><strong>LinkedIn :</strong> Noussoukitravel.com</p>
          </div>

          <div class="footer-noussouki__socials">
            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        <!-- Colonne 2 : Newsletter -->
        <div style="text-align: center;" class="footer-noussouki__col footer-noussouki__col--newsletter">
          <h4>Inscrivez-vous à notre Newsletter</h4>
          <p>Et recevez les dernières nouvelles concernant votre agence.</p>

          <form class="footer-noussouki__newsletter-form">
            <i class="fa fa-paper-plane icon-mail"></i>
            <input type="email" placeholder="Votre e-mail" />
            <button type="submit">S’inscrire</button>
          </form>
        </div>
      </div>

      <!-- ===================== -->
      <!-- LIGNE 2 : 4 COLONNES ÉGALES -->
      <!-- ===================== -->
      <div class="footer-noussouki__links">
        <div class="footer-noussouki__col">
          <h4>Rubrique religion</h4>
          <ul>
            <li><a href="#">Ramadan 2026</a></li>
            <li><a href="#">Fatwas</a></li>
            <li><a href="#">Préparez votre séjour en apprenant l’histoire de Médine et ses mérites.</a></li>
            <li><a href="#">Préparez votre séjour en apprenant l’histoire de La Mecque et ses mérites.</a></li>
            <li><a href="#">Prévoyez un voyage touristique en Arabie Saoudite</a></li>
          </ul>
        </div>

        <div class="footer-noussouki__col">
          <h4>Hajj et Omra</h4>
          <ul>
            <li><a href="#">Omra 2025</a></li>
            <li><a href="#">Omra 2026</a></li>
            <li><a href="#">Omra septembre 2025</a></li>
            <li><a href="#">Omra octobre 2025</a></li>
            <li><a href="#">Omra novembre 2025</a></li>
            <li><a href="#">Omra janvier 2026</a></li>
            <li><a href="#">Omra pas cher</a></li>
            <li><a href="#">Hajj 2026</a></li>
          </ul>
        </div>

        <div class="footer-noussouki__col">
          <h4>Agences partenaires</h4>
          <ul>
            <li><a href="#">Omra Luxembourg</a></li>
            <li><a href="#">Nice Voyager di Filippo Fatone</a></li>
            <li><a href="#">Click And Travel</a></li>
            <li><a href="#">Travel To Arabia</a></li>
            <li><a href="#">Rawaf Mina</a></li>
            <li><a href="#">Nusuk Hajj 2026</a></li>
          </ul>
        </div>

        <div class="footer-noussouki__col">
          <h4>Utiles</h4>
          <ul>
            <li><a href="#">Notre concept</a></li>
            <li><a href="#">Centres de vaccination</a></li>
            <li><a href="#">VISA Hajj 2026 &amp; Omra 2025</a></li>
            <li><a href="#">Le voyage halal</a></li>
            <li><a href="#">Annuaire agences</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-noussouki__bottom">
      <p>© {{ new Date().getFullYear?.() || '2025' }} Noussouki Travel – Tous droits réservés.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "PublicFooter",
};
</script>

<style scoped>
.footer-noussouki {
  width: 100%;
  background: #006b70;
  color: #fff;
  padding: 50px 0 20px;
  margin-top: 80px;
}

.footer-noussouki__inner {
  width: min(1400px, 90%);
  margin: 0 auto;
}

/* =========================
   LIGNE 1 : AGENCE + NEWSLETTER
   ========================= */
.footer-noussouki__top {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 2fr); /* 2 colonnes égales */
  gap: 40px;
  align-items: flex-start;
  margin-bottom: 40px;
}

/* =========================
   LIGNE 2 : 4 COLONNES ÉGALES
   ========================= */
.footer-noussouki__links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)); /* ⭐ 4 cellules même largeur */
  gap: 40px;
}

/* Logo + social */
.footer-noussouki__logo img {
  max-width: 190px;
  height: auto;
  margin-bottom: 20px;
}

.footer-noussouki__block p {
  margin: 2px 0;
}

.footer-noussouki__block p strong {
  font-size: 15px;
}


.footer-noussouki__socials {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.footer-noussouki__socials a {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
}

.footer-noussouki__socials a i {
  font-size: 15px;
}

/* Titres colonnes */
.footer-noussouki h4 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
  
}

/* Listes de liens */
.footer-noussouki ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-noussouki li + li {
  margin-top: 4px;
}

.footer-noussouki a {
  color: #e5f7f7;
  text-decoration: none;
}

.footer-noussouki a:hover {
  text-decoration: underline;
}

/* =========================
   NEWSLETTER
   ========================= */
.footer-noussouki__newsletter-form {
  margin-top: 14px;
  display: flex;
  width: 100%;
  max-width: 500px;
  background: #ffffff36;
  border-radius: 50px;
  overflow: hidden;
  align-items: center;
  padding: 0 10px 0 16px;
}

.footer-noussouki__newsletter-form .icon-mail {
  font-size: 18px;
  color: #fff;
  margin-right: 10px;
}

.footer-noussouki__newsletter-form input[type="email"] {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 10px;
  margin-right: 10px;
  outline: none;
  font-size: 15px;
  color: #fff !important;
}

.footer-noussouki__newsletter-form input[type="email"]:focus {
  background: #d8d3d30a !important;
  border-color: rgba(255, 255, 255, 0.7) !important;
  box-shadow: 0 0 0 2px rgba(245, 245, 245, 0.767) !important;
}

.footer-noussouki__newsletter-form input::placeholder {
  color: #fff;
}

.footer-noussouki__newsletter-form button {
  background: #d39e23;
  color: #ffff;
  border: none;
  padding: 12px 26px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  white-space: nowrap;
}

.footer-noussouki__newsletter-form button:hover {
  opacity: 0.9;
}

/* Bas de footer */
.footer-noussouki__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  margin-top: 30px;
  padding-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #e2f4f4;
}

/* =========================
   RESPONSIVE
   ========================= */
@media (max-width: 1100px) {
  .footer-noussouki__top {
    grid-template-columns: 1fr; /* Agence + newsletter l’un sous l’autre */
  }

  .footer-noussouki__links {
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* 2 colonnes égales */
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .footer-noussouki {
    padding: 28px 16px 20px;
  }

  .footer-noussouki__links {
    grid-template-columns: 1fr; /* 1 colonne sur mobile */
    gap: 18px;
  }
}

/* Centrer le formulaire newsletter */
.footer-noussouki__col--newsletter {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centre tous les éléments */
}

.footer-noussouki__newsletter-form {
  margin-left: auto;
  margin-right: auto;
}

</style>

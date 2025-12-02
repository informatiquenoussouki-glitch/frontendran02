<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Section gauche : logo + description -->
      <div class="footer-about">
        <div class="footer-logo">
          <img src="/logo.jpg" alt="Logo" class="logo-img" />
          <h2 class="logo-text">MonSite<span class="highlight">Omra</span></h2>
        </div>
        <p>
          Votre partenaire de confiance pour des voyages spirituels sereins et
          inoubliables. Découvrez nos formules Omra adaptées à chaque besoin.
        </p>
      </div>

      <!-- Section liens -->
      <div class="footer-links">
        <h3>Liens utiles</h3>
        <ul>
          <li><router-link to="/">Accueil</router-link></li>
          <li><router-link to="/omra">Omra</router-link></li>
          <li><router-link to="/omra-ramadan">Omra Ramadan</router-link></li>
          <li><router-link to="/about">À propos</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>
      </div>

      <!-- Section contact -->
      <div class="footer-contact">
        <h3>Contact</h3>
        <p><i class="fas fa-phone"></i> +33 1 42 36 23 29</p>
        <p><i class="fas fa-envelope"></i> contact@noussoukitravel.com</p>
        <p><i class="fas fa-map-marker-alt"></i> Hammamet , Tunisie</p>
        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook-f"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 MonSiteOmra — Tous droits réservés.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "PublicFooter",
};
</script>

<style scoped>
/* === FOOTER GLOBAL === */
.footer {
  background: linear-gradient(90deg, #00737f, #00737f);
  color: white;
  padding-top: 40px;
  padding-bottom: 10px;
  font-family: "Poppins", sans-serif;
}

/* === CONTAINER PRINCIPAL === */
.footer-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1200px;
  margin: auto;
  padding: 0 40px;
}

/* === LOGO + DESCRIPTION === */
.footer-about {
  flex: 1 1 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.logo-img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #c9e265;
  background: white;
}

.logo-text {
  font-weight: 700;
  font-size: 22px;
  color: white;
}

.highlight {
  color: #c9e265;
}

.footer-about p {
  line-height: 1.6;
  font-size: 14px;
  color: #f1f1f1;
}

/* === LIENS === */
.footer-links {
  flex: 1 1 200px;
}

.footer-links h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #c9e265;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #f1f1f1;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #c9e265;
}

/* === CONTACT === */
.footer-contact {
  flex: 1 1 250px;
}

.footer-contact h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #c9e265;
}

.footer-contact p {
  margin: 6px 0;
  font-size: 14px;
}

.footer-contact i {
  margin-right: 8px;
  color: #c9e265;
}

/* === RÉSEAUX SOCIAUX === */
.social-icons {
  margin-top: 10px;
}

.social-icons a {
  display: inline-block;
  margin-right: 12px;
  color: white;
  font-size: 18px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.social-icons a:hover {
  color: #c9e265;
  transform: scale(1.1);
}

/* === BAS DE PAGE === */
.footer-bottom {
  text-align: center;
  padding: 15px 0 5px;
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 13px;
  color: #e0e0e0;
}

/* === RESPONSIVE === */
@media (max-width: 900px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer-about,
  .footer-links,
  .footer-contact {
    width: 100%;
  }

  .footer-contact i {
    display: none; /* optionnel sur mobile */
  }
}
</style>

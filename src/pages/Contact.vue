<template>
  <div class="contact-page">
    <!-- Section Intro -->
    <section class="intro">
      <h2>Pour plus d'information</h2>
      <h3>N’HÉSITEZ PAS À NOUS CONTACTER !</h3>
      <p class="subtext">
        Notre équipe se réjouit d’avance de pouvoir vous renseigner.
      </p>
      <p class="quote">
        « Découvrez la sérénité de <span class="gold">Omra</span>
        code  notre agence dédiée, orchestrant chaque détail pour offrir une expérience spirituelle
        inoubliable, où votre parcours sacré est notre priorité absolue. »
      </p>
    </section>

    <!-- Section coordonnées -->
    <section class="info-section">
      <div class="info-box">
        <i class="fas fa-phone-alt icon"></i>
        <h4>Téléphone</h4>
        <p>+33 1 79 36 01 66</p>
      </div>

      <div class="info-box">
        <i class="fas fa-envelope icon"></i>
        <h4>E-mail</h4>
        <p>informatique.noussouki@gmail.com</p>
        
      </div>

      <div class="info-box">
        <i class="fas fa-location-arrow icon"></i>
        <h4>Adresse</h4>
        <p>119 C28, Hammamet Sud 8050 <br />7050 en face hotel ribat </p>
      </div>
    </section>

    <!-- Section Carte + Formulaire -->
    <section class="map-form-section">
      <div class="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d251.3921489543606!2d10.583160143449598!3d36.406058308751824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd61d161e88177%3A0xfaa31298cdf57285!2sA-STORE!5e1!3m2!1sfr!2stn!4v1759827593124!5m2!1sfr!2stn"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
        ></iframe>
      </div>

      <div class="form-container">
        <h3>FORMULAIRE DE CONTACT</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <input v-model="form.name" type="text" placeholder="Nom complet*" required />
            <input v-model="form.email" type="email" placeholder="Email*" required />
          </div>

          <div class="form-row">
            <input v-model="form.phone" type="text" placeholder="Téléphone*" required />
            <input v-model="form.address" type="text" placeholder="Adresse" />
          </div>

          <div class="form-row">
            <input v-model="form.zip" type="text" placeholder="Code postal*" required />
            <input v-model="form.city" type="text" placeholder="Ville*" required />
          </div>

          <input v-model="form.subject" type="text" placeholder="Objet*" required />
          <textarea v-model="form.message" rows="5" placeholder="Message*" required></textarea>

          <div class="form-row">
            <label>Que font 6 + 1 ?</label>
            <input v-model="form.captcha" type="text" required />
          </div>

          <label class="checkbox">
            <input type="checkbox" v-model="form.subscribe" />
            Souhaitez-vous recevoir des informations régulières par mail sur nos offres ?
          </label>

          <button type="submit" class="submit-btn">ENVOYER</button>
        </form>
      </div>
    </section>

    <!-- Section Points de vente -->
    <section class="locations">
      <div class="locations-grid">
       

    

        <div>
          <h5>AUTRE détails</h5>
          <p><strong>Jours et heures d’ouverture :</strong><br />
            du lundi au vendredi de 08H00 à 17H00<br />
            </p>
          <p>
           Sur notre site, nous sommes bien plus qu’une simple agence — nous sommes vos accompagnateurs spirituels vers la Mecque et Médine.
Animés par la foi et le sens du service, nous faisons de chaque Omra une expérience apaisante, authentique et mémorable.
Notre engagement : vous offrir un voyage sacré empreint de sérénité, de foi et d’émotion.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import axios from "axios"; // ✅ On importe Axios

export default {
  name: "Contact",
  data() {
    return {
      form: {
        name: "",
        email: "",
        phone: "",
        address: "",
        zip: "",
        city: "",
        subject: "",
        message: "",
        captcha: "",
        subscribe: false,
      },
      isSending: false, // état pour gérer le chargement
    };
  },
  methods: {
    async submitForm() {
      // Vérification du captcha
      if (this.form.captcha !== "7") {
        alert("Captcha incorrect !");
        return;
      }

      this.isSending = true;

      try {
        // ✅ Envoi des données du formulaire à Laravel
        const response = await axios.post(
          "http://127.0.0.1:8000/api/contact",
          this.form
        );

        if (response.data.success) {
          alert("✅ Votre message a bien été envoyé !");
          // Réinitialisation du formulaire
          this.form = {
            name: "",
            email: "",
            phone: "",
            address: "",
            zip: "",
            city: "",
            subject: "",
            message: "",
            captcha:"",
            subscribe:"",
        
          };
        } else {
          alert("⚠️ Erreur : " + response.data.message);
        }
      } catch (error) {
        console.error("Erreur Axios :", error);
        alert("❌ Erreur de connexion au serveur Laravel !");
      } finally {
        this.isSending = false;
      }
    },
  },
};
</script>


<style scoped>
.contact-page {
  font-family: "Poppins", sans-serif;
  color: #222;
  background-color: #fff;
  margin-top: 50px;
  margin-bottom: 50px;
  border: 1px solid #f3f3f3;
  border-radius: 18px;
  color: #555;
  font-family: "Poppins", sans-serif;
}

/* ---- Intro ---- */
.intro {
  text-align: center;
  padding: 50px 20px;
}
.intro h2 {
  color: #b38b00;
  font-weight: 700;
}
.intro h3 {
  color: #b38b00;
  margin-top: 10px;
  font-weight: 700;
}
.subtext {
  color: #777;
  font-style: italic;
}
.quote {
  max-width: 900px;
  margin: 20px auto;
  font-size: 16px;
}
.gold {
  color: #b38b00;
  font-weight: bold;
}

/* ---- Coordonnées ---- */
.info-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  padding: 40px 0;
}
.info-box {
  text-align: center;
  width: 250px;
}
.icon {
  font-size: 28px;
  color: #b38b00;
  margin-bottom: 10px;
}

/* ---- Map + Form ---- */
.map-form-section {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  padding: 40px 5%;
}
.map-container {
  flex: 1;
  min-width: 300px;
  height: 400px;
}
.form-container {
  flex: 1;
  min-width: 320px;
}
.form-container h3 {
  color: #b38b00;
  margin-bottom: 20px;
}
.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.checkbox {
  display: flex;
  align-items: center;
  font-size: 13px;
  margin: 10px 0;
}
.submit-btn {
  width: 100%;
  background-color: #b38b00;
  color: #fff;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}
.submit-btn:hover {
  background-color: #967300;
}

/* ---- Points de vente ---- */
.locations {
  background: #fafafa;
  padding: 60px 5%;
}
.locations h3 {
  text-align: left;
  color: #b38b00;
  margin-bottom: 30px;
}
.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}
.locations-grid h5 {
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #555;
}


@media (max-width: 768px) {
  /* ✅ Espace avant le bloc blanc */
  .contact-page {
    margin-top: 60px; /* ajuste à 70-100px selon la hauteur du header */
  }
}
</style>

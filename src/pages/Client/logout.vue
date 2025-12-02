<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"; // ⬅️ Import router
import api from "../services/api";

const email = ref("");
const password = ref("");
const router = useRouter(); // ⬅️ Initialisation

const login = async () => {
  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    console.log("Réponse backend :", res.data);

    // ✅ Sauvegarder le token
    localStorage.setItem("token", res.data.token);

    alert("Connexion réussie ✅");

    // ✅ Rediriger vers la page d’accueil
    router.push({ name: "Home" });

  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Erreur lors de la connexion ❌");
  }
};
</script>

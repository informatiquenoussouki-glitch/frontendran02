import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  // withCredentials: false  // (tu es en Bearer, donc false)
});

// ✅ Ajoute le token (gère 'auth_token' OU 'token')
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Logger d'erreurs utile (tu verras le vrai message dans la console)
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (!error.response) {
      console.error("Network/JS error:", {
        message: error.message,
        config: { url: error.config?.url, method: error.config?.method },
      });
    } else {
      console.error("API error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export default api;

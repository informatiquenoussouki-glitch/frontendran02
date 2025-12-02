import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


import axios from "axios";



import './assets/styles/styles.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
// 🟢 Font Awesome (version Vue)
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faPenToSquare, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'

import "@fortawesome/fontawesome-free/css/all.min.css";


import "intl-tel-input/build/css/intlTelInput.css";


// Ajoute ici toutes les icônes dont tu as besoin
library.add(faMagnifyingGlass, faPenToSquare, faTrash, faUser)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')

axios.defaults.baseURL = 'http://localhost:8000';














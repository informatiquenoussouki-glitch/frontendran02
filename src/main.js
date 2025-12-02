import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ✅ styles globaux (alias @ pointe vers ./src)
import '@/assets/styles/styles.css'
// (optionnel si tu en as besoin partout)
import '@/assets/styles/AdminOmra.css'



import '@fortawesome/fontawesome-free/css/all.min.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faPenToSquare, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'

library.add(faMagnifyingGlass, faPenToSquare, faTrash, faUser)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')

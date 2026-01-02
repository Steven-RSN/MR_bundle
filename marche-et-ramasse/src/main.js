import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { syncPending } from './services/sync'
import { createPinia } from 'pinia'
import  piniaPersistedState  from 'pinia-plugin-persistedstate'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersistedState)
app.use(pinia)
app.use(router)

app.mount('#app')



// Tentative de sync au démarrage (si l'utilisateur ouvre l'app avec du réseau)
syncPending().then(res => {
  if (res && res.synced) console.log(`Sync au démarrage : ${res.synced} éléments envoyés`);
});

window.addEventListener('online', () => {
  console.log('Connexion Internet détectée, synchronisation…')
  syncPending()
})

// Ou synchronisation toutes les H
//setInterval(syncWithServer, 60 * 60 * 1000) // toutes les heures

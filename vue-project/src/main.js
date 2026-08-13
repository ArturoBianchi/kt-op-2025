import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/css/main.css'
import App from './App.vue'
import router from './router'
import ui from '@nuxt/ui/vue-plugin'
import { pruneExpiredStores } from './stores/plugins/persistExpiry.js'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(ui)

// Remove already-expired session-scoped localStorage entries before any
// store hydrates, so stale data is never even transiently loaded.
pruneExpiredStores()

app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './assets/styles/main.css'

const params = new URLSearchParams(globalThis.location.search)
const redirect = params.get('redirect')

if (redirect) {
  globalThis.history.replaceState(null, '', `/orquestra-frontend${redirect}`)
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)
app.mount('#app')
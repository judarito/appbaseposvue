import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { useSupabase } from './composables/useSupabase'
import './assets/styles/main.css'

async function initializeApp() {
  const app = createApp(App)

  app.use(vuetify)
  app.use(router)

  // Inicializar Supabase auth antes de montar la app
  const { initAuth } = useSupabase()
  await initAuth()

  // Montar la aplicación
  app.mount('#app')
}

// Inicializar la aplicación
initializeApp().catch(console.error)
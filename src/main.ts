import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { useSupabase } from './composables/useSupabase'
import './assets/styles/main.css'

const app = createApp(App)

app.use(vuetify)
app.use(router)

// Inicializar Supabase
const { initAuth } = useSupabase()
initAuth()

app.mount('#app')
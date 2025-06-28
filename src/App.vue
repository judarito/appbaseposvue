<template>
  <v-app>
    <!-- Layout de autenticación para login -->
    <AuthLayout v-if="isAuthRoute">
      <router-view />
    </AuthLayout>
    
    <!-- Layout principal para páginas autenticadas -->
    <DefaultLayout v-else-if="isAuthenticated">
      <router-view />
    </DefaultLayout>
    
    <!-- Loading mientras se verifica autenticación -->
    <v-main v-else class="d-flex align-center justify-center">
      <v-progress-circular
        size="64"
        color="primary"
        indeterminate
      />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from './composables/useSupabase'
import { useAuth } from './composables/useAuth'
import DefaultLayout from './layouts/default.vue'
import AuthLayout from './layouts/auth.vue'

const route = useRoute()
const { user, loading } = useSupabase()
const { restoreUserInfo } = useAuth()

// Verificar si estamos en una ruta de autenticación
const isAuthRoute = computed(() => route.name === 'Login')

// Verificar si el usuario está autenticado
const isAuthenticated = computed(() => !loading.value && !!user.value)

// Intentar restaurar información del usuario al montar
onMounted(async () => {
  // Esperar un poco para que se complete la inicialización de auth
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (user.value) {
    console.log('🔄 App montada con usuario autenticado, restaurando información...')
    await restoreUserInfo()
  }
})
</script>
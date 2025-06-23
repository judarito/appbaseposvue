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
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from './composables/useSupabase'
import DefaultLayout from './layouts/default.vue'
import AuthLayout from './layouts/auth.vue'

const route = useRoute()
const { user, loading, initAuth } = useSupabase()

// Verificar si estamos en una ruta de autenticación
const isAuthRoute = computed(() => route.name === 'Login')

// Verificar si el usuario está autenticado
const isAuthenticated = computed(() => !loading.value && !!user.value)

// Inicializar autenticación al cargar la app
initAuth()
</script>
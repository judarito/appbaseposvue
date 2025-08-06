<template>
  <div>
    <!-- Mensaje de error por permisos insuficientes -->
    <v-alert
      v-if="showPermissionError"
      type="warning"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="showPermissionError = false"
    >
      <v-icon size="large">mdi-shield-alert</v-icon>
      <div class="ml-3">
        <h4>Acceso Restringido</h4>
        <p>No tienes permisos suficientes para acceder a la sección solicitada.</p>
      </div>
    </v-alert>

    <!-- Mensaje de error por usuario no encontrado -->
    <v-alert
      v-if="showUserNotFoundError"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="showUserNotFoundError = false"
    >
      <v-icon size="large">mdi-account-alert</v-icon>
      <div class="ml-3">
        <h4>Usuario No Encontrado</h4>
        <p>No se pudo cargar la información de tu usuario. Intenta cerrar sesión e iniciar sesión nuevamente.</p>
      </div>
    </v-alert>

    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 text-sm-h4 mb-4">Dashboard</h1>
        
        <!-- Cards de estadísticas responsivas -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="4" lg="3" v-for="stat in filteredStats" :key="stat.title">
            <v-card 
              :color="cardColor" 
              :theme="currentTheme"
              elevation="3"
              class="stat-card h-100"
              @click="navigateToSection(stat.route)"
              style="cursor: pointer;"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-icon 
                    :icon="stat.icon"
                    :color="iconColor"
                    size="large" 
                    class="mr-3"
                  />
                  <div>
                    <div class="text-h6" :class="textClass">{{ stat.value }}</div>
                    <div class="text-subtitle-2" :class="subtitleClass">{{ stat.title }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Contenido principal -->
        <v-card :theme="currentTheme" elevation="2">
          <v-card-title>Bienvenido a la Aplicación</v-card-title>
          <v-card-text>
            <p>Esta es la página principal de la aplicación Vue 3 + Vuetify.</p>
            <p>Características del layout:</p>
            <ul>
              <li>Header con menú de usuario</li>
              <li>Sidebar colapsible con navegación</li>
              <li>Contenido principal responsivo</li>
              <li>Iconos Material Design</li>
              <li>Modo oscuro/claro con mejor contraste</li>
              <li>Sistema de routing con Vue Router</li>
              <li>Gestión de Tenants con CRUD completo</li>
              <li>Autenticación con Supabase</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppTheme } from '../composables/useTheme'
import { useAuth } from '../composables/useAuth'
import type { DashboardStat } from '../types'

const router = useRouter()
const route = useRoute()

// Usar el composable del tema
const { currentTheme, isDarkMode } = useAppTheme()

// Usar el composable de autenticación para filtrar stats
const { isSuperAdmin } = useAuth()

// Estado para mensajes de error
const showPermissionError = ref(false)
const showUserNotFoundError = ref(false)

// Datos de ejemplo para las estadísticas
const stats = ref<DashboardStat[]>([
  { title: 'Usuarios', value: '1,234', icon: 'mdi-account-group', route: '/users' },
  { title: 'Ventas Chat', value: '89', icon: 'mdi-cart', route: '/ventas-chat' },
  { title: 'Productos', value: '567', icon: 'mdi-package-variant', route: '/products' },
  { title: 'Tenants', value: '0', icon: 'mdi-domain', route: '/tenants', requiredRole: 'SUPERADMIN' },
])

// Filtrar stats basado en roles (solo para Tenants por ahora)
const filteredStats = computed(() => {
  return stats.value.filter(stat => {
    if (!stat.requiredRole) return true
    
    switch (stat.requiredRole) {
      case 'SUPERADMIN':
        return isSuperAdmin.value
      default:
        return true
    }
  })
})

// Colores dinámicos para las cards con mejor contraste
const cardColor = computed(() => {
  return isDarkMode.value ? 'surface-bright' : 'primary'
})

const iconColor = computed(() => {
  return isDarkMode.value ? '#64b5f6' : 'white' // Azul más brillante en modo oscuro
})

const textClass = computed(() => {
  return isDarkMode.value ? 'text-blue-lighten-2' : 'text-white'
})

const subtitleClass = computed(() => {
  return isDarkMode.value ? 'text-blue-lighten-3' : 'text-white'
})

// Verificar si hay parámetros de error en la URL
onMounted(() => {
  const error = route.query.error
  
  if (error === 'insufficient_permissions') {
    showPermissionError.value = true
    // Limpiar el query parameter
    router.replace({ name: 'Dashboard' })
  } else if (error === 'user_not_found') {
    showUserNotFoundError.value = true
    // Limpiar el query parameter
    router.replace({ name: 'Dashboard' })
  }
})

// Navegar a sección específica
const navigateToSection = (route: string) => {
  router.push(route)
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* Estilos específicos para modo oscuro con mejor contraste */
.v-theme--dark .stat-card {
  background-color: #424242 !important; /* Superficie más brillante */
  border: 1px solid rgba(100, 181, 246, 0.2); /* Borde sutil azul */
}

.v-theme--dark .text-blue-lighten-2 {
  color: #64b5f6 !important; /* Azul brillante para números */
}

.v-theme--dark .text-blue-lighten-3 {
  color: #90caf9 !important; /* Azul más claro para subtítulos */
}
</style>
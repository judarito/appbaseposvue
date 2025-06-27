<template>
  <v-app-bar 
    app 
    :color="headerColor"
    :theme="currentTheme"
    elevation="2"
  >
    <v-app-bar-nav-icon 
      @click="$emit('toggle-sidebar')"
      :color="iconColor"
    />
    <v-toolbar-title :class="titleClass">Mi Aplicación</v-toolbar-title>
    <v-spacer />
    
    <!-- Theme Toggle Button -->
    <v-btn 
      icon 
      @click="toggleTheme" 
      class="mr-2"
      :color="iconColor"
      variant="text"
    >
      <v-icon>{{ isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
    
    <!-- User Menu -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          :color="iconColor"
          variant="text"
        >
          <v-avatar size="32" color="primary">
            <v-icon v-if="!user">mdi-account-circle</v-icon>
            <span v-else>{{ user.username.charAt(0).toUpperCase() }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-list :theme="currentTheme" min-width="250">
        <v-list-item v-if="user">
          <template v-slot:prepend>
            <v-avatar color="primary">
              <span>{{ user.username.charAt(0).toUpperCase() }}</span>
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.username }}</v-list-item-title>
          <v-list-item-subtitle>
            <div class="d-flex flex-column">
              <span v-if="currentTenant">
                <v-icon size="small">mdi-domain</v-icon>
                {{ currentTenant.name }}
              </span>
              <span v-if="currentRole">
                <v-icon size="small">mdi-account-key</v-icon>
                {{ currentRole.name }}
              </span>
            </div>
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-else>
          <v-list-item-title>Usuario no identificado</v-list-item-title>
          <v-list-item-subtitle>Sin información de sesión</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-list-item @click="goToProfile">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Mi Perfil</v-list-item-title>
        </v-list-item>
        <v-list-item @click="goToSettings">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Configuración</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Cerrar Sesión</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppTheme } from '../composables/useTheme'
import { useAuth } from '../composables/useAuth'

// Definir los eventos que emite este componente
defineEmits<{
  'toggle-sidebar': []
}>()

const router = useRouter()
const { isDarkMode, toggleTheme, currentTheme } = useAppTheme()
const { user, currentTenant, currentRole, logout } = useAuth()

// Colores dinámicos basados en el tema
const headerColor = computed(() => {
  return isDarkMode.value ? 'surface-variant' : 'primary'
})

const iconColor = computed(() => {
  return isDarkMode.value ? 'white' : 'white'
})

const titleClass = computed(() => {
  return isDarkMode.value ? 'text-white' : 'text-white'
})

// Navegación
const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/settings')
}

// Función de logout
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
.v-app-bar {
  transition: background-color 0.3s ease;
}

.v-btn {
  transition: color 0.3s ease;
}
</style>
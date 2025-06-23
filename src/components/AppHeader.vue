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
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list :theme="currentTheme">
        <v-list-item>
          <v-list-item-title>Mi Perfil</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Configuración</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item @click="logout">
          <v-list-item-title>
            <v-icon left>mdi-logout</v-icon>
            Cerrar Sesión
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppTheme } from '../composables/useTheme'

// Definir los eventos que emite este componente
defineEmits<{
  'toggle-sidebar': []
}>()

// Usar el composable del tema
const { isDarkMode, toggleTheme, currentTheme } = useAppTheme()

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

// Función de logout
const logout = () => {
  console.log('Cerrando sesión...')
  // Aquí puedes agregar la lógica de logout
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
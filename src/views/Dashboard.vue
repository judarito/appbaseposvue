<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
        
        <!-- Cards de estadísticas -->
        <v-row class="mb-4">
          <v-col cols="12" md="3" v-for="stat in stats" :key="stat.title">
            <v-card 
              :color="cardColor" 
              :theme="currentTheme"
              elevation="3"
              class="stat-card"
            >
              <v-card-text>
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
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppTheme } from '../composables/useTheme'

// Usar el composable del tema
const { currentTheme, isDarkMode } = useAppTheme()

// Datos de ejemplo para las estadísticas
const stats = ref([
  { title: 'Usuarios', value: '1,234', icon: 'mdi-account-group' },
  { title: 'Ventas', value: '$45,678', icon: 'mdi-currency-usd' },
  { title: 'Productos', value: '567', icon: 'mdi-package-variant' },
  { title: 'Pedidos', value: '89', icon: 'mdi-shopping' },
])

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
<template>
  <v-app>
    <!-- Header Component -->
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <!-- Sidebar Component -->
    <AppSidebar 
      :visible="sidebarVisible"
      @menu-select="handleMenuSelect"
    />

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import { useAppTheme } from '../composables/useTheme'

interface MenuItem {
  title: string
  icon: string
  route: string
}

// Estado del sidebar
const sidebarVisible = ref(true)

// Inicializar tema
const { initTheme } = useAppTheme()

// Función para toggle del sidebar
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// Manejar selección de menú
const handleMenuSelect = (item: MenuItem) => {
  console.log('Elemento seleccionado en layout:', item)
}

// Inicializar tema al montar el componente
onMounted(() => {
  initTheme()
})
</script>
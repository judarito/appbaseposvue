<template>
  <v-app>
    <!-- Header Component -->
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <!-- Sidebar Component -->
    <AppSidebar 
      :visible="sidebarVisible"
      :mobile="isMobile"
      @menu-select="handleMenuSelect"
      @close="handleSidebarClose"
    />

    <!-- Main Content -->
    <v-main>
      <v-container 
        fluid 
        :class="containerClasses"
        class="pa-2 pa-sm-4 pa-md-6"
      >
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import { useAppTheme } from '../composables/useTheme'

interface MenuItem {
  title: string
  icon: string
  route: string
}

// Usar Vuetify display para responsividad
const { mobile, smAndDown, mdAndDown } = useDisplay()

// Estado del sidebar
const sidebarVisible = ref(true)

// Computed para detectar dispositivos móviles
const isMobile = computed(() => smAndDown.value)

// Computed para clases del container
const containerClasses = computed(() => ({
  'container-mobile': mobile.value,
  'container-tablet': mdAndDown.value && !mobile.value,
  'container-desktop': !mdAndDown.value
}))

// Inicializar tema
const { initTheme } = useAppTheme()

// Función para toggle del sidebar
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// Manejar cierre del sidebar
const handleSidebarClose = () => {
  sidebarVisible.value = false
}

// Manejar selección de menú
const handleMenuSelect = (item: MenuItem) => {
  console.log('Elemento seleccionado en layout:', item)
  
  // En móvil, cerrar sidebar después de seleccionar
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

// Controlar sidebar automáticamente en cambios de tamaño de pantalla
const handleResize = () => {
  if (isMobile.value) {
    sidebarVisible.value = false
  } else {
    sidebarVisible.value = true
  }
}

// Watcher para cambios en el tamaño de pantalla
watch(isMobile, (newIsMobile) => {
  if (newIsMobile) {
    sidebarVisible.value = false
  } else {
    sidebarVisible.value = true
  }
}, { immediate: true })

// Inicializar tema al montar el componente
onMounted(() => {
  initTheme()
  handleResize()
  
  // Listener para cambios de tamaño de ventana
  window.addEventListener('resize', handleResize)
})

// Limpiar event listeners al desmontar
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Estilos responsivos para el container */
.container-mobile {
  max-width: 100% !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.container-tablet {
  max-width: 100% !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.container-desktop {
  max-width: 1200px !important;
}

/* Espaciado responsivo */
@media (max-width: 599px) {
  :deep(.v-container) {
    padding: 8px !important;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  :deep(.v-container) {
    padding: 16px !important;
  }
}

@media (min-width: 960px) {
  :deep(.v-container) {
    padding: 24px !important;
  }
}
</style>
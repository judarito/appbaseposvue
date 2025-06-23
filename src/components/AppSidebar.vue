<template>
  <v-navigation-drawer
    :model-value="visible"
    app
    :color="sidebarColor"
    :theme="currentTheme"
    elevation="2"
  >
    <!-- Logo o título del sidebar -->
    <div class="pa-4 text-center" :class="headerBorderClass">
      <h3 class="text-h6" :class="titleTextClass">Menú</h3>
    </div>
    
    <v-divider />
    
    <!-- Componente de menú -->
    <AppMenu @menu-select="handleMenuSelect" />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppMenu from './AppMenu.vue'
import { useAppTheme } from '../composables/useTheme'

interface MenuItem {
  title: string
  icon: string
  route: string
}

// Props
interface Props {
  visible: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'menu-select': [item: MenuItem]
}>()

// Usar el composable del tema
const { currentTheme, isDarkMode } = useAppTheme()

// Colores dinámicos del sidebar
const sidebarColor = computed(() => {
  return isDarkMode.value ? 'surface' : 'grey-lighten-4'
})

const titleTextClass = computed(() => {
  return isDarkMode.value ? 'text-white' : 'text-grey-darken-2'
})

const headerBorderClass = computed(() => {
  return isDarkMode.value ? 'border-b-dark' : 'border-b-light'
})

// Manejar selección de menú
const handleMenuSelect = (item: MenuItem) => {
  emit('menu-select', item)
}
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background-color 0.3s ease;
}

.border-b-light {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.border-b-dark {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
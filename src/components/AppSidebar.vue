<template>
  <v-navigation-drawer
    :model-value="visible"
    app
    :temporary="mobile"
    :permanent="!mobile && visible"
    :width="drawerWidth"
    :color="sidebarColor"
    :theme="currentTheme"
    elevation="2"
    @update:model-value="handleDrawerUpdate"
  >
    <!-- Logo o título del sidebar -->
    <div 
      class="pa-2 pa-sm-4 text-center" 
      :class="headerBorderClass"
    >
      <h3 
        :class="[titleTextClass, titleSizeClass]"
      >
        {{ mobile ? 'Menu' : 'Menú Principal' }}
      </h3>
    </div>
    
    <v-divider />
    
    <!-- Componente de menú -->
    <AppMenu 
      :compact="mobile"
      @menu-select="handleMenuSelect" 
    />
    
    <!-- Footer del sidebar (solo en desktop) -->
    <template v-if="!mobile" #append>
      <div class="pa-2 text-center">
        <v-chip 
          size="small" 
          variant="text" 
          class="text-caption"
        >
          v1.0.0
        </v-chip>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
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
  mobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mobile: false
})

// Emits
const emit = defineEmits<{
  'menu-select': [item: MenuItem]
  'close': []
}>()

// Usar Vuetify display para responsividad
const { xs, sm, md } = useDisplay()

// Usar el composable del tema
const { currentTheme, isDarkMode } = useAppTheme()

// Computed para ancho del drawer responsivo
const drawerWidth = computed(() => {
  if (xs.value) return 250
  if (sm.value) return 280
  if (md.value) return 300
  return 320
})

// Colores dinámicos del sidebar
const sidebarColor = computed(() => {
  return isDarkMode.value ? 'surface' : 'grey-lighten-4'
})

const headerBorderClass = computed(() => {
  return isDarkMode.value ? 'border-b-sm border-grey-darken-2' : 'border-b-sm border-grey-lighten-2'
})

const titleTextClass = computed(() => {
  return isDarkMode.value ? 'text-grey-lighten-1' : 'text-grey-darken-2'
})

const titleSizeClass = computed(() => {
  if (xs.value) return 'text-subtitle-1'
  if (sm.value) return 'text-h6'
  return 'text-h6'
})

// Manejar selección de menú
const handleMenuSelect = (item: MenuItem) => {
  emit('menu-select', item)
}

// Manejar actualización del drawer
const handleDrawerUpdate = (value: boolean) => {
  // Siempre emitir el evento close cuando el drawer se cierra
  if (!value) {
    emit('close')
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background-color 0.3s ease;
}

/* Responsividad para diferentes tamaños de pantalla */
@media (max-width: 599px) {
  :deep(.v-navigation-drawer__content) {
    padding: 0;
  }
}

/* Asegurar que el drawer se oculte completamente en móvil cuando no está visible */
@media (max-width: 959px) {
  .v-navigation-drawer:not(.v-navigation-drawer--active) {
    transform: translateX(-100%) !important;
  }
}
</style>
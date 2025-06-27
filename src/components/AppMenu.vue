<template>
  <v-list nav :theme="currentTheme">
    <v-list-item
      v-for="item in filteredMenuItems"
      :key="item.title"
      :prepend-icon="item.icon"
      :title="item.title"
      @click="selectMenuItem(item)"
      :class="{ 'menu-item-active': isActive(item.route) }"
      class="menu-item"
    />
  </v-list>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppTheme } from '../composables/useTheme'
import { useAuth } from '../composables/useAuth'
import type { MenuItem } from '../types'

// Emits
const emit = defineEmits<{
  'menu-select': [item: MenuItem]
}>()

// Router
const router = useRouter()
const route = useRoute()

// Usar el composable del tema
const { currentTheme } = useAppTheme()

// Usar el composable de autenticación para verificar roles
const { isSuperAdmin, hasRole } = useAuth()

// Items del menú con roles requeridos
const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/' },
  { title: 'Usuarios', icon: 'mdi-account-group', route: '/users' },
  { title: 'Productos', icon: 'mdi-package-variant', route: '/products' },
  { title: 'Tenants', icon: 'mdi-domain', route: '/tenants', requiredRole: 'SUPERADMIN' },
  { title: 'Reportes', icon: 'mdi-chart-bar', route: '/reports' },
  { title: 'Configuración', icon: 'mdi-cog', route: '/settings' },
]

// Filtrar items del menú basado en roles
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => {
    // Si no tiene rol requerido, siempre mostrar
    if (!item.requiredRole) return true
    
    // Verificar rol específico
    switch (item.requiredRole) {
      case 'SUPERADMIN':
        return isSuperAdmin.value
      case 'ADMIN':
        return hasRole.value('ADMIN') || isSuperAdmin.value
      case 'TENANT_ADMIN':
        return hasRole.value('TENANT_ADMIN') || hasRole.value('ADMIN') || isSuperAdmin.value
      default:
        return hasRole.value(item.requiredRole)
    }
  })
})

// Verificar si la ruta está activa
const isActive = (itemRoute: string) => {
  return route.path === itemRoute
}

// Función para seleccionar item del menú
const selectMenuItem = (item: MenuItem) => {
  emit('menu-select', item)
  router.push(item.route)
  console.log('Navegando a:', item.title)
}
</script>

<style scoped>
.menu-item {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
}

/* Estados activos con mejor contraste */
.menu-item-active {
  background-color: rgba(var(--v-theme-primary), 0.16) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.menu-item-active .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Estilos específicos para modo oscuro - Mayor contraste */
.v-theme--dark .menu-item:hover {
  background-color: rgba(66, 165, 245, 0.20) !important;
}

.v-theme--dark .menu-item-active {
  background-color: rgba(66, 165, 245, 0.25) !important;
  color: #64b5f6 !important;
}

.v-theme--dark .menu-item-active .v-icon {
  color: #64b5f6 !important;
}

/* Modo claro */
.v-theme--light .menu-item-active {
  background-color: rgba(25, 118, 210, 0.12) !important;
  color: #1976d2 !important;
}

.v-theme--light .menu-item-active .v-icon {
  color: #1976d2 !important;
}
</style>
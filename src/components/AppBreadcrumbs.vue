<template>
  <v-breadcrumbs
    v-if="breadcrumbItems.length > 1"
    :items="breadcrumbItems"
    class="pa-0"
  >
    <template v-slot:prepend>
      <v-icon size="small">mdi-home</v-icon>
    </template>
    <template v-slot:divider>
      <v-icon size="small">mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const routeNames: Record<string, string> = {
  'Dashboard': 'Dashboard',
  'Users': 'Usuarios',
  'Products': 'Productos',
  'Tenants': 'Tenants',
  'Reports': 'Reportes',
  'Settings': 'Configuración'
}

const breadcrumbItems = computed(() => {
  const items = [
    {
      title: 'Inicio',
      disabled: false,
      href: '/'
    }
  ]

  if (route.name && route.name !== 'Dashboard') {
    items.push({
      title: routeNames[route.name as string] || route.name as string,
      disabled: true,
      href: route.path
    })
  }

  return items
})
</script>
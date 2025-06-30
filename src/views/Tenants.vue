<template>
  <div class="pa-2 pa-sm-4">
    <!-- Verificación de permisos -->
    <v-alert
      v-if="!isSuperAdmin && !userLoading"
      type="error"
      variant="tonal"
      class="mb-4"
      prominent
    >
      <v-icon size="large">mdi-shield-alert</v-icon>
      <div class="ml-3">
        <h3>Acceso Denegado</h3>
        <p>No tienes permisos para acceder a la gestión de tenants. Se requiere rol SUPERADMIN.</p>
      </div>
    </v-alert>

    <!-- Contenido principal -->
    <template v-if="isSuperAdmin">
      <h1 class="text-h5 text-sm-h4 mb-4">Gestión de Tenants</h1>
      <TenantsListNew />
    </template>

    <!-- Loading state -->
    <v-progress-circular
      v-if="userLoading"
      indeterminate
      color="primary"
      class="mx-auto d-block my-8"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import TenantsListNew from '../components/TenantsListNew.vue'

const router = useRouter()
const { isSuperAdmin, userLoading, user } = useAuth()

// Verificar permisos al montar el componente
onMounted(() => {
  // Si no hay usuario cargado todavía, esperar un poco
  if (!user.value && !userLoading.value) {
    console.warn('Usuario no encontrado en Tenants view, redirigiendo...')
    router.push({ name: 'Dashboard', query: { error: 'user_not_found' } })
    return
  }

  // Si el usuario está cargado pero no es SUPERADMIN, mostrar error pero no redirigir
  // (el alert se encarga de mostrar el mensaje de error)
})
</script>
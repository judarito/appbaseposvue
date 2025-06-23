<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-domain</v-icon>
        Gestión de Tenants
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn
          icon="mdi-refresh"
          variant="text"
          @click="refreshData"
          :loading="loading"
          size="small"
        />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nuevo Tenant
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <!-- Barra de búsqueda -->
      <v-text-field
        v-model="searchTerm"
        label="Buscar tenants..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        @input="debouncedSearch"
        class="mb-4"
      />

      <!-- Estadísticas -->
      <v-row class="mb-4">
        <v-col>
          <v-chip color="primary" variant="tonal">
            <v-icon start>mdi-counter</v-icon>
            Total: {{ tenantsCount }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- Loading -->
      <v-progress-linear v-if="loading" indeterminate class="mb-4" />

      <!-- Error -->
      <v-alert
        v-if="hasError"
        type="error"
        variant="tonal"
        closable
        @click:close="clearError"
        class="mb-4"
      >
        {{ error }}
      </v-alert>

      <!-- Lista de tenants -->
      <v-data-table
        :headers="headers"
        :items="tenants"
        :loading="loading"
        item-key="id"
        class="elevation-1"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-icon color="white">mdi-domain</v-icon>
            </v-avatar>
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="openEditDialog(item)"
            class="mr-2"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="openDeleteDialog(item)"
          />
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-4">
            <v-icon size="64" color="grey">mdi-domain-off</v-icon>
            <p class="text-h6 mt-2">No hay tenants</p>
            <p class="text-body-2">Crea tu primer tenant para comenzar</p>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Dialog para crear/editar tenant -->
    <TenantDialog
      :visible="dialogVisible"
      :tenant="selectedTenant"
      :mode="dialogMode"
      @close="closeDialog"
      @saved="handleTenantSaved"
    />

    <!-- Dialog de confirmación de eliminación -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar el tenant "{{ tenantToDelete?.name }}"?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="deleteDialog = false"
            :disabled="saving"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="saving"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTenants } from '../composables/useTenants'
import TenantDialog from './TenantDialog.vue'
import type { Tenant } from '../services/tenantService'

// Debounce function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const {
  tenants,
  loading,
  saving,
  error,
  hasError,
  tenantsCount,
  loadTenants,
  deleteTenant,
  searchTenants,
  clearError,
  refreshTenants
} = useTenants()

// Estado local
const searchTerm = ref('')
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedTenant = ref<Tenant | null>(null)
const deleteDialog = ref(false)
const tenantToDelete = ref<Tenant | null>(null)

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'name', align: 'start' as const },
  { title: 'Fecha de Creación', key: 'created_at', align: 'start' as const },
  { title: 'Acciones', key: 'actions', align: 'center' as const, sortable: false }
]

// Búsqueda con debounce
const debouncedSearch = debounce((term: string) => {
  searchTenants(term || '')
}, 300)

// Refrescar datos manualmente
const refreshData = async () => {
  await refreshTenants()
}

// Formatear fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Abrir dialog para crear
const openCreateDialog = () => {
  selectedTenant.value = null
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// Abrir dialog para editar
const openEditDialog = (tenant: Tenant) => {
  selectedTenant.value = tenant
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Cerrar dialog
const closeDialog = () => {
  dialogVisible.value = false
  selectedTenant.value = null
}

// Manejar tenant guardado - AQUÍ ESTÁ LA CLAVE
const handleTenantSaved = async () => {
  closeDialog()
  // Forzar refresh de la lista después de guardar
  await refreshTenants()
}

// Abrir dialog de eliminación
const openDeleteDialog = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  deleteDialog.value = true
}

// Confirmar eliminación
const confirmDelete = async () => {
  if (tenantToDelete.value) {
    const success = await deleteTenant(tenantToDelete.value.id!)
    if (success) {
      deleteDialog.value = false
      tenantToDelete.value = null
    }
  }
}

// Cargar tenants al montar el componente
onMounted(() => {
  loadTenants()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
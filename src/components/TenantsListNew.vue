<template>
  <DataTablePaginated
    title="Gestión de Tenants"
    icon="mdi-domain"
    :headers="headers"
    :items="items"
    :loading="loading"
    :error="error"
    :has-error="hasError"
    :current-page="currentPage"
    :total-pages="totalPages"
    :items-per-page="itemsPerPage"
    :total-count="totalItems"
    :search-term="searchTerm"
    search-label="Buscar tenants..."
    no-data-icon="mdi-domain-off"
    no-data-title="No hay tenants"
    no-data-subtitle="Crea tu primer tenant para comenzar"
    @refresh="refresh"
    @clear-error="clearError"
    @search="search"
    @change-page="loadPage"
    @change-items-per-page="changeItemsPerPage"
  >
    <!-- Slot para acciones del header -->
    <template #actions>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
      >
        Nuevo Tenant
      </v-btn>
    </template>

    <!-- Slot personalizado para la columna de nombre -->
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white">mdi-domain</v-icon>
        </v-avatar>
        <span class="font-weight-medium">{{ item.name }}</span>
      </div>
    </template>

    <!-- Slot personalizado para la fecha -->
    <template #item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>

    <!-- Slot personalizado para las acciones -->
    <template #item.actions="{ item }">
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
  </DataTablePaginated>

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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePagination } from '../composables/usePagination'
import { tenantService } from '../services/tenantService'
import type { Tenant } from '../services/tenantService'
import DataTablePaginated from './DataTablePaginated.vue'
import TenantDialog from './TenantDialog.vue'

// Usar el composable genérico de paginación
const {
  items,
  loading,
  saving,
  error,
  hasError,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  searchTerm,
  loadPage,
  changeItemsPerPage,
  search,
  remove,
  refresh,
  initialize,
  clearError
} = usePagination<Tenant>(tenantService)

// Estado local para dialogs
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedTenant = ref<Tenant | null>(null)
const deleteDialog = ref(false)
const tenantToDelete = ref<Tenant | null>(null)

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'name', align: 'start' as const, sortable: true },
  { title: 'Fecha de Creación', key: 'created_at', align: 'start' as const, sortable: true },
  { title: 'Acciones', key: 'actions', align: 'center' as const, sortable: false }
]

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

// Manejar tenant guardado
const handleTenantSaved = async () => {
  closeDialog()
  await refresh()
}

// Abrir dialog de eliminación
const openDeleteDialog = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  deleteDialog.value = true
}

// Confirmar eliminación
const confirmDelete = async () => {
  if (tenantToDelete.value) {
    const success = await remove(tenantToDelete.value.id!)
    if (success) {
      deleteDialog.value = false
      tenantToDelete.value = null
    }
  }
}

// Inicializar datos al montar el componente
onMounted(() => {
  console.log('🚀 Montando TenantsListNew...')
  initialize()
})
</script>

<style scoped>
/* Estilos específicos del componente si es necesario */
</style>

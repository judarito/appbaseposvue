<template>
  <div class="pa-2 pa-sm-4">
    <h1 class="text-h5 text-sm-h4 mb-4">Gestión de Tenants</h1>
    
    <DataTableSelfContained
      title="Administrar Tenants"
      icon="mdi-domain"
      :headers="headers"
      :service="tenantServicePaginated"
      search-label="Buscar tenants..."
      no-data-icon="mdi-domain-off"
      no-data-title="No hay tenants"
      no-data-subtitle="No se encontraron tenants en el sistema"
      ref="dataTableRef"
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

      <!-- Slot personalizado para el nombre -->
      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" color="primary" class="mr-3">
            <v-icon color="white">mdi-domain</v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <!-- Slot personalizado para fecha de creación -->
      <template #item.created_at="{ item }">
        <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
      </template>

      <!-- Slot personalizado para las acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="openEditDialog(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="openDeleteDialog(item)"
          />
        </div>
      </template>
    </DataTableSelfContained>

    <!-- Dialog para crear/editar tenant -->
    <TenantDialog
      :visible="dialogVisible"
      :tenant="selectedTenant"
      :mode="dialogMode"
      @close="closeDialog"
      @saved="handleTenantSaved"
    />

    <!-- Dialog de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el tenant 
          <strong>{{ tenantToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn 
            color="error" 
            @click="confirmDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { tenantService, tenantServicePaginated } from '../services/tenantService'
import type { Tenant, CreateTenantData, UpdateTenantData } from '../services/tenantService'
import DataTableSelfContained from './DataTableSelfContained.vue'
import TenantDialog from './TenantDialog.vue'

// Estado local para dialogs
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedTenant = ref<Tenant | null>(null)
const deleteDialog = ref(false)
const tenantToDelete = ref<Tenant | null>(null)
const dataTableRef = ref()

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

// Manejar tenant guardado (callback del TenantDialog)
const handleTenantSaved = async () => {
  closeDialog()
  await dataTableRef.value?.refresh()
}

// Abrir dialog de eliminación
const openDeleteDialog = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  deleteDialog.value = true
}

// Confirmar eliminación
const confirmDelete = async () => {
  if (tenantToDelete.value) {
    const success = await dataTableRef.value?.deleteItem(tenantToDelete.value.id!)
    if (success) {
      deleteDialog.value = false
      tenantToDelete.value = null
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente si es necesario */
</style>

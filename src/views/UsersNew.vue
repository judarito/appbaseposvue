<template>
  <div class="pa-4">
    <h1 class="text-h4 mb-4">Usuarios</h1>
    
    <!-- Ejemplo usando el componente reutilizable -->
    <DataTablePaginated
      title="Gestión de Usuarios"
      icon="mdi-account-group"
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
      search-label="Buscar usuarios..."
      no-data-icon="mdi-account-off"
      no-data-title="No hay usuarios"
      no-data-subtitle="No se encontraron usuarios en el sistema"
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
          Nuevo Usuario
        </v-btn>
      </template>

      <!-- Slot personalizado para la columna de nombre -->
      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" color="success" class="mr-3">
            <v-icon color="white">mdi-account</v-icon>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
          </div>
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

    <!-- Placeholder dialogs -->
    <v-dialog v-model="dialogVisible" max-width="500">
      <v-card>
        <v-card-title>{{ dialogMode === 'create' ? 'Crear Usuario' : 'Editar Usuario' }}</v-card-title>
        <v-card-text>
          <p>Dialog de usuario aquí...</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialogVisible = false">Cancelar</v-btn>
          <v-btn color="primary" @click="dialogVisible = false">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTablePaginated from '../components/DataTablePaginated.vue'

// Simulamos datos de usuarios para el ejemplo
const items = ref([])
const loading = ref(false)
const error = ref(null)
const hasError = ref(false)
const totalItems = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchTerm = ref('')

// Estado para dialogs
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// Headers de la tabla
const headers = [
  { title: 'Usuario', key: 'name', align: 'start' as const, sortable: true },
  { title: 'Fecha de Registro', key: 'created_at', align: 'start' as const, sortable: true },
  { title: 'Acciones', key: 'actions', align: 'center' as const, sortable: false }
]

// Funciones placeholder
const refresh = () => console.log('Refresh users')
const clearError = () => error.value = null
const search = (term: string) => console.log('Search users:', term)
const loadPage = (page: number) => console.log('Load page:', page)
const changeItemsPerPage = (size: number) => console.log('Change items per page:', size)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

const openEditDialog = (user: any) => {
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

const openDeleteDialog = (user: any) => {
  console.log('Delete user:', user)
}

onMounted(() => {
  // Simular carga de datos
  console.log('Users component mounted')
})
</script>

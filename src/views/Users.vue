<template>
  <div class="pa-2 pa-sm-4">
    <h1 class="text-h5 text-sm-h4 mb-4">Usuarios del Sistema</h1>
    
    <DataTableSelfContained
      title="Gestión de Usuarios"
      icon="mdi-account-group"
      :headers="headers"
      :service="userServicePaginated"
      search-label="Buscar usuarios..."
      no-data-icon="mdi-account-off"
      no-data-title="No hay usuarios"
      no-data-subtitle="No se encontraron usuarios en el sistema"
      ref="dataTableRef"
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

      <!-- Slot personalizado para el nombre de usuario -->
      <template #item.username="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" color="primary" class="mr-3">
            <span class="text-white">{{ item.username.charAt(0).toUpperCase() }}</span>
          </v-avatar>
          <span class="font-weight-medium">{{ item.username }}</span>
        </div>
      </template>

      <!-- Slot personalizado para el tenant -->
      <template #item.tenant="{ item }">
        <v-chip color="info" size="small" v-if="item.tenant">
          <v-icon start>mdi-domain</v-icon>
          {{ item.tenant.name }}
        </v-chip>
        <span v-else class="text-medium-emphasis">Sin tenant</span>
      </template>

      <!-- Slot personalizado para el rol -->
      <template #item.role="{ item }">
        <v-chip color="success" size="small" v-if="item.role">
          <v-icon start>mdi-account-key</v-icon>
          {{ item.role.name }}
        </v-chip>
        <span v-else class="text-medium-emphasis">Sin rol</span>
      </template>

      <!-- Slot personalizado para la fecha -->
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <!-- Slot personalizado para acciones -->
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="openEditDialog(item)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="openDeleteDialog(item)"
        />
      </template>
    </DataTableSelfContained>

    <!-- Dialog para crear/editar usuario - Responsivo -->
    <v-dialog 
      v-model="dialogVisible" 
      :max-width="$vuetify.display.xs ? '95vw' : '800px'"
      :fullscreen="$vuetify.display.xs"
      persistent 
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon class="mr-3">
            {{ dialogMode === 'create' ? 'mdi-account-plus' : 'mdi-account-edit' }}
          </v-icon>
          <span class="text-h5 text-sm-h4">{{ dialogMode === 'create' ? 'Crear Usuario' : 'Editar Usuario' }}</span>
        </v-card-title>
        
        <v-card-text>
          <UserForm
            ref="userFormRef"
            :mode="dialogMode"
            :initial-data="selectedUser"
            :loading="saving"
            @submit="handleUserSubmit"
            @cancel="closeDialog"
          />
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn 
            text 
            @click="closeDialog"
            :disabled="saving"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="submitForm"
            :loading="saving"
            :disabled="saving"
          >
            <v-icon start>
              {{ dialogMode === 'create' ? 'mdi-plus' : 'mdi-content-save' }}
            </v-icon>
            {{ dialogMode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar al usuario 
          <strong>{{ userToDelete?.username }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userService, userServicePaginated } from '../services/userService'
import type { UserWithRelations, CreateUserData, UpdateUserData } from '../services/userService'
import DataTableSelfContained from '../components/DataTableSelfContained.vue'
import UserForm from '../components/UserForm.vue'

// Estado local para dialogs
const saving = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedUser = ref<UserWithRelations | null>(null)
const deleteDialog = ref(false)
const userToDelete = ref<UserWithRelations | null>(null)
const userFormRef = ref()
const dataTableRef = ref()

// Headers de la tabla
const headers = [
  { title: 'Usuario', key: 'username', align: 'start' as const, sortable: true },
  { title: 'Tenant', key: 'tenant', align: 'start' as const, sortable: false },
  { title: 'Rol', key: 'role', align: 'start' as const, sortable: false },
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
  selectedUser.value = null
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// Abrir dialog para editar
const openEditDialog = (user: UserWithRelations) => {
  selectedUser.value = user
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Cerrar dialog
const closeDialog = () => {
  dialogVisible.value = false
  selectedUser.value = null
  // Resetear el formulario si existe
  if (userFormRef.value) {
    userFormRef.value.resetForm()
  }
}

// Manejar envío del formulario desde UserForm
const handleUserSubmit = async (userData: CreateUserData | UpdateUserData) => {
  console.log('📝 Enviando datos del usuario:', userData)
  
  try {
    if (dialogMode.value === 'create') {
      console.log('🆕 Creando nuevo usuario...')
      await userService.createUser(userData as CreateUserData)
      console.log('✅ Usuario creado exitosamente')
    } else if (selectedUser.value) {
      console.log('✏️ Actualizando usuario existente...')
      await userService.updateUser(selectedUser.value.id, userData as UpdateUserData)
      console.log('✅ Usuario actualizado exitosamente')
    }
    
    // Cerrar dialog y refrescar datos
    closeDialog()
    await dataTableRef.value?.refresh()
  } catch (error: any) {
    console.error('❌ Error guardando usuario:', error)
    // El error se manejará en el UserForm
  }
}

// Enviar formulario (llamado desde el botón del dialog)
const submitForm = async () => {
  if (userFormRef.value) {
    // Trigger the submit method on the UserForm
    await userFormRef.value.handleSubmit()
  }
}

// Manejar usuario guardado (legacy, puede ser eliminado)
const handleUserSaved = async () => {
  closeDialog()
  await dataTableRef.value?.refresh()
}

// Abrir dialog de eliminación
const openDeleteDialog = (user: UserWithRelations) => {
  userToDelete.value = user
  deleteDialog.value = true
}

// Confirmar eliminación
const confirmDelete = async () => {
  if (userToDelete.value) {
    const success = await dataTableRef.value?.deleteItem(userToDelete.value.id)
    if (success) {
      deleteDialog.value = false
      userToDelete.value = null
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente si es necesario */
</style>
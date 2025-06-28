<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Email (solo para crear) -->
      <v-col cols="12" md="6" v-if="mode === 'create'">
        <v-text-field
          v-model="formData.email"
          label="Email *"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          :rules="emailRules"
          :error-messages="errors.email"
          required
          :disabled="loading"
        />
      </v-col>

      <!-- Password (solo para crear) -->
      <v-col cols="12" md="6" v-if="mode === 'create'">
        <v-text-field
          v-model="formData.password"
          label="Contraseña *"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          :rules="passwordRules"
          :error-messages="errors.password"
          required
          :disabled="loading"
        />
      </v-col>

      <!-- Username -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.username"
          label="Nombre de Usuario *"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          :rules="usernameRules"
          :error-messages="errors.username"
          required
          :disabled="loading"
        />
      </v-col>

      <!-- Tenant -->
      <v-col cols="12" md="6">
        <v-select
          v-model="formData.tenant_id"
          label="Tenant *"
          :items="tenants"
          item-title="name"
          item-value="id"
          prepend-inner-icon="mdi-domain"
          variant="outlined"
          :rules="tenantRules"
          :error-messages="errors.tenant_id"
          :loading="tenantsLoading"
          required
          :disabled="loading"
        />
      </v-col>

      <!-- Rol -->
      <v-col cols="12" md="6">
        <v-select
          v-model="formData.role_id"
          label="Rol *"
          :items="roles"
          item-title="name"
          item-value="id"
          prepend-inner-icon="mdi-account-key"
          variant="outlined"
          :rules="roleRules"
          :error-messages="errors.role_id"
          :loading="rolesLoading"
          required
          :disabled="loading"
        />
      </v-col>

      <!-- Información adicional para editar -->
      <v-col cols="12" v-if="mode === 'edit' && initialData">
        <v-alert type="info" variant="tonal">
          <v-icon>mdi-information</v-icon>
          <div class="ml-3">
            <strong>ID:</strong> {{ initialData.id }}<br>
            <strong>Creado:</strong> {{ formatDate(initialData.created_at) }}<br>
            <small class="text-medium-emphasis">
              Nota: Para cambiar el email, el usuario debe hacerlo desde su perfil.
            </small>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Mensaje de error general -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { userService } from '../services/userService'
import type { CreateUserData, UpdateUserData, UserWithRelations } from '../services/userService'

interface Props {
  mode: 'create' | 'edit'
  initialData?: UserWithRelations | null
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: CreateUserData | UpdateUserData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  initialData: null
})

const emit = defineEmits<Emits>()

// Refs del formulario
const formRef = ref()
const showPassword = ref(false)

// Estado del formulario
const formData = ref({
  email: '',
  password: '',
  username: '',
  tenant_id: '',
  role_id: ''
})

// Estado de listas desplegables
const tenants = ref<Array<{ id: string, name: string }>>([])
const roles = ref<Array<{ id: string, name: string }>>([])
const tenantsLoading = ref(false)
const rolesLoading = ref(false)

// Estado de errores
const error = ref('')
const errors = ref({
  email: '',
  password: '',
  username: '',
  tenant_id: '',
  role_id: ''
})

// Reglas de validación
const emailRules = [
  (v: string) => !!v || 'El email es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Email debe ser válido'
]

const passwordRules = computed(() => {
  if (props.mode === 'edit') return [] // No requerido para editar
  return [
    (v: string) => !!v || 'La contraseña es requerida',
    (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
  ]
})

const usernameRules = [
  (v: string) => !!v || 'El nombre de usuario es requerido',
  (v: string) => v.length >= 3 || 'El nombre de usuario debe tener al menos 3 caracteres',
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || 'Solo se permiten letras, números y guiones bajos'
]

const tenantRules = [
  (v: string) => !!v || 'El tenant es requerido'
]

const roleRules = [
  (v: string) => !!v || 'El rol es requerido'
]

// Cargar datos iniciales cuando se edita
watch(() => props.initialData, (newData) => {
  if (newData && props.mode === 'edit') {
    formData.value = {
      email: '', // No se puede editar email aquí
      password: '', // No se requiere para editar
      username: newData.username,
      tenant_id: newData.tenant_id,
      role_id: newData.role_id
    }
  }
}, { immediate: true })

// Limpiar formulario cuando cambia el modo
watch(() => props.mode, (newMode) => {
  if (newMode === 'create') {
    resetForm()
  }
})

// Función para resetear el formulario
const resetForm = () => {
  formData.value = {
    email: '',
    password: '',
    username: '',
    tenant_id: '',
    role_id: ''
  }
  error.value = ''
  errors.value = {
    email: '',
    password: '',
    username: '',
    tenant_id: '',
    role_id: ''
  }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// Cargar listas de tenants y roles
const loadTenants = async () => {
  try {
    tenantsLoading.value = true
    tenants.value = await userService.getTenantsList()
  } catch (error: any) {
    console.error('Error cargando tenants:', error)
  } finally {
    tenantsLoading.value = false
  }
}

const loadRoles = async () => {
  try {
    rolesLoading.value = true
    roles.value = await userService.getRolesList()
  } catch (error: any) {
    console.error('Error cargando roles:', error)
  } finally {
    rolesLoading.value = false
  }
}

// Manejar envío del formulario
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    error.value = '' // Limpiar errores previos
    
    if (props.mode === 'create') {
      const createData: CreateUserData = {
        email: formData.value.email,
        password: formData.value.password,
        username: formData.value.username,
        tenant_id: formData.value.tenant_id,
        role_id: formData.value.role_id
      }
      emit('submit', createData)
    } else {
      const updateData: UpdateUserData = {
        username: formData.value.username,
        tenant_id: formData.value.tenant_id,
        role_id: formData.value.role_id
        // Nota: email no se puede actualizar sin permisos admin o sesión del usuario
      }
      emit('submit', updateData)
    }
  } catch (error: any) {
    console.error('Error en formulario:', error)
    error.value = error.message || 'Error en el formulario'
  }
}

// Formatear fecha
const formatDate = (dateString?: string) => {
  if (!dateString) return 'No disponible'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Inicializar datos al montar
onMounted(() => {
  loadTenants()
  loadRoles()
})

// Exponer funciones para el componente padre
defineExpose({
  resetForm,
  validate: () => formRef.value?.validate(),
  handleSubmit
})
</script>

<style scoped>
/* Estilos específicos del formulario si es necesario */
</style>

<template>
  <v-dialog
    :model-value="visible"
    @update:model-value="$emit('close')"
    :max-width="$vuetify.display.xs ? '95vw' : '500px'"
    :fullscreen="$vuetify.display.xs"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ mode === 'create' ? 'mdi-plus' : 'mdi-pencil' }}</v-icon>
        {{ mode === 'create' ? 'Crear Nuevo Tenant' : 'Editar Tenant' }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit" ref="formRef">
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Nombre del Tenant"
            variant="outlined"
            :rules="nameRules"
            :error-messages="nameError"
            required
            autofocus
          />

          <!-- Información adicional para modo edición -->
          <div v-if="mode === 'edit' && tenant">
            <v-divider class="my-4" />
            <div class="text-caption text-medium-emphasis">
              <p><strong>ID:</strong> {{ tenant.id }}</p>
              <p><strong>Creado:</strong> {{ formatDate(tenant.created_at) }}</p>
            </div>
          </div>

          <!-- Error message -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="$emit('close')"
            :disabled="saving"
          >
            Cancelar
          </v-btn>
          <v-btn
            type="submit"
            color="primary"
            :loading="saving"
          >
            {{ mode === 'create' ? 'Crear' : 'Actualizar' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTenants } from '../composables/useTenants'
import type { Tenant } from '../services/tenantService'

interface Props {
  visible: boolean
  tenant?: Tenant | null
  mode: 'create' | 'edit'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createTenant, updateTenant, saving, error } = useTenants()

// Formulario
const formRef = ref()
const form = ref({
  name: ''
})

const errorMessage = ref('')
const nameError = ref('')

// Reglas de validación
const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
  (v: string) => v.length <= 100 || 'El nombre no puede tener más de 100 caracteres',
  (v: string) => /^[a-zA-Z0-9\s\-_.]+$/.test(v) || 'El nombre contiene caracteres no válidos'
]

// Observar cambios en el tenant prop
watch(() => props.tenant, (newTenant) => {
  if (newTenant && props.mode === 'edit') {
    form.value.name = newTenant.name
  } else {
    form.value.name = ''
  }
  errorMessage.value = ''
  nameError.value = ''
}, { immediate: true })

// Observar errores del composable
watch(() => error.value, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
}, { immediate: true })

// Limpiar formulario cuando se cierra
watch(() => props.visible, (isVisible) => {
  if (!isVisible) {
    form.value.name = ''
    errorMessage.value = ''
    nameError.value = ''
    if (formRef.value) {
      formRef.value.resetValidation()
    }
  }
})

// Formatear fecha
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Manejar envío del formulario
const handleSubmit = async () => {
  errorMessage.value = ''
  nameError.value = ''

  // Validar formulario
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    let result = null

    if (props.mode === 'create') {
      result = await createTenant({ name: form.value.name.trim() })
    } else if (props.tenant) {
      result = await updateTenant(props.tenant.id!, { name: form.value.name.trim() })
    }

    if (result) {
      // Emitir evento de guardado exitoso
      emit('saved')
      console.log('Tenant guardado exitosamente:', result)
    }
  } catch (err: any) {
    console.error('Error saving tenant:', err)
    errorMessage.value = err.message || 'Error al guardar el tenant'
  }
}
</script>
<template>
  <v-dialog :model-value="visible" max-width="600px" @update:model-value="$emit('close')">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon class="mr-2">mdi-cart</v-icon>
        {{ mode === 'create' ? 'Nueva Venta' : 'Editar Venta' }}
      </v-card-title>
      
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <!-- Usuario -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.user"
                label="Usuario *"
                :rules="[(v: any) => !!v || 'Usuario es requerido']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-account"
              />
            </v-col>

            <!-- Comprador -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.comprador"
                label="Comprador *"
                :rules="[(v: any) => !!v || 'Comprador es requerido']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-account-circle"
              />
            </v-col>

            <!-- Producto/Mensaje -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.productomsj"
                label="Producto/Mensaje *"
                :rules="[(v: any) => !!v || 'Producto/Mensaje es requerido']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-package-variant"
                rows="3"
                auto-grow
              />
            </v-col>

            <!-- Cantidad -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.cantidad"
                label="Cantidad *"
                type="number"
                :rules="[
                  (v: any) => !!v || 'Cantidad es requerida',
                  (v: any) => v > 0 || 'Cantidad debe ser mayor a 0'
                ]"
                required
                variant="outlined"
                prepend-inner-icon="mdi-counter"
                min="0"
                step="0.01"
              />
            </v-col>

            <!-- Precio Unitario -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.preciounitario"
                label="Precio Unitario *"
                type="number"
                :rules="[
                  (v: any) => !!v || 'Precio unitario es requerido',
                  (v: any) => v > 0 || 'Precio debe ser mayor a 0'
                ]"
                required
                variant="outlined"
                prepend-inner-icon="mdi-currency-usd"
                min="0"
                step="0.01"
              />
            </v-col>

            <!-- Total Neto (calculado automáticamente) -->
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="totalNeto"
                label="Total Neto"
                variant="outlined"
                prepend-inner-icon="mdi-calculator"
                readonly
                :color="totalNeto > 0 ? 'success' : 'default'"
              />
            </v-col>

            <!-- Fecha -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.fecha"
                label="Fecha *"
                type="date"
                :rules="[(v: any) => !!v || 'Fecha es requerida']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>

            <!-- Estado -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.estado"
                label="Estado *"
                :items="estadoOptions"
                :rules="[(v: any) => !!v || 'Estado es requerido']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-flag"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="$emit('close')"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="save"
          :loading="loading"
          :disabled="!valid"
        >
          {{ mode === 'create' ? 'Crear' : 'Actualizar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ventasChatService } from '../services/ventasChatService'
import type { VentaChat, CreateVentaChatData, UpdateVentaChatData, EstadoVenta } from '../types'

interface Props {
  visible: boolean
  venta?: VentaChat | null
  mode: 'create' | 'edit'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  saved: [venta: VentaChat]
}>()

// Estado del formulario
const form = ref()
const valid = ref(false)
const loading = ref(false)

// Opciones para el select de estado
const estadoOptions = [
  { title: 'Por Pagar', value: 'POR PAGAR' },
  { title: 'Pago Parcial', value: 'PAGO PARCIAL' },
  { title: 'Pagado', value: 'PAGADO' }
]

// Datos del formulario
const defaultFormData = (): CreateVentaChatData => ({
  user: '',
  productomsj: '',
  cantidad: 0,
  preciounitario: 0,
  fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
  comprador: '',
  estado: 'POR PAGAR'
})

const formData = ref<CreateVentaChatData>(defaultFormData())

// Computed para calcular total neto
const totalNeto = computed(() => {
  const cantidad = formData.value.cantidad || 0
  const precio = formData.value.preciounitario || 0
  return (cantidad * precio).toFixed(2)
})

// Watch para cargar datos cuando se edita
watch(() => props.venta, (newVenta) => {
  if (newVenta && props.mode === 'edit') {
    formData.value = {
      user: newVenta.user,
      productomsj: newVenta.productomsj,
      cantidad: newVenta.cantidad,
      preciounitario: newVenta.preciounitario,
      fecha: newVenta.fecha,
      comprador: newVenta.comprador,
      estado: newVenta.estado
    }
  } else {
    formData.value = defaultFormData()
  }
}, { immediate: true })

// Watch para resetear validación cuando se abre el dialog
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      form.value?.resetValidation()
    })
  }
})

// Función para guardar
const save = async () => {
  // Validar formulario antes de continuar
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  loading.value = true

  try {
    let savedVenta: VentaChat

    if (props.mode === 'create') {
      savedVenta = await ventasChatService.create(formData.value)
    } else {
      if (!props.venta?.id) {
        throw new Error('ID de venta no encontrado')
      }
      savedVenta = await ventasChatService.update(props.venta.id.toString(), formData.value as UpdateVentaChatData)
    }

    emit('saved', savedVenta)
  } catch (error: any) {
    console.error('Error saving venta:', error)
    // Aquí podrías mostrar un snackbar o alert con el error
    alert(`Error al guardar: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card-title {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>

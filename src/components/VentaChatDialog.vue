<template>
  <v-dialog :model-value="visible" max-width="600px" @update:model-value="$emit('close')">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon class="mr-2">mdi-cart-plus</v-icon>
        {{ mode === 'create' ? 'Nueva Venta Chat' : 'Editar Venta Chat' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <!-- Comprador -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.comprador"
                label="Comprador *"
                :rules="[(v: any) => !!v || 'Comprador es requerido']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-account"
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

            <!-- Total Neto (solo lectura) -->
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="totalNeto"
                label="Total Neto"
                readonly
                variant="outlined"
                prepend-inner-icon="mdi-calculator"
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
                :items="estadoOptions"
                label="Estado *"
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
        <v-btn text @click="$emit('close')">Cancelar</v-btn>
        <v-btn 
          color="primary" 
          @click="save"
          :disabled="!valid"
          :loading="loading"
        >
          {{ mode === 'create' ? 'Crear' : 'Actualizar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ventasChatService } from '../services/ventasChatService'
import type { VentaChat, CreateVentaChatData } from '../types'

// Props
interface Props {
  visible: boolean
  venta?: VentaChat | null
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  venta: null
})

// Emits
const emit = defineEmits<{
  close: []
  saved: []
}>()

// Estado local
const valid = ref(false)
const loading = ref(false)
const form = ref()

// Datos por defecto del formulario
const defaultFormData = (): CreateVentaChatData => ({
  comprador: '',
  productomsj: '',
  cantidad: 0,
  preciounitario: 0,
  fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
  estado: 'POR PAGAR'
})

const formData = ref<CreateVentaChatData>(defaultFormData())

// Computed para calcular total neto
const totalNeto = computed(() => {
  return (formData.value.cantidad * formData.value.preciounitario).toFixed(2)
})

// Opciones para el select de estado
const estadoOptions = [
  { title: 'Por Pagar', value: 'POR PAGAR' },
  { title: 'Pago Parcial', value: 'PAGO PARCIAL' },
  { title: 'Pagado', value: 'PAGADO' }
]

// Observar cambios en la prop venta
watch(() => props.venta, (newVenta) => {
  if (newVenta) {
    formData.value = {
      comprador: newVenta.comprador,
      productomsj: newVenta.productomsj,
      cantidad: newVenta.cantidad,
      preciounitario: newVenta.preciounitario,
      fecha: newVenta.fecha,
      estado: newVenta.estado
    }
  } else {
    formData.value = defaultFormData()
  }
}, { immediate: true })

// Función para guardar
const save = async () => {
  if (!form.value?.validate()) return

  loading.value = true
  try {
    if (props.mode === 'create') {
      await ventasChatService.create(formData.value)
    } else if (props.venta?.id) {
      await ventasChatService.update(props.venta.id.toString(), formData.value)
    }
    
    emit('saved')
    formData.value = defaultFormData()
    
    // Reset form validation
    form.value?.resetValidation()
  } catch (error) {
    console.error('Error al guardar venta:', error)
  } finally {
    loading.value = false
  }
}

// Resetear formulario cuando se cierra
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    formData.value = defaultFormData()
    form.value?.resetValidation()
  }
})
</script>

<style scoped>
.v-card-title {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>

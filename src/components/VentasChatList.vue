<template>
  <DataTableSelfContained
    :service="ventasChatServicePaginated"
    title="Gestión de Ventas Chat"
    icon="mdi-cart"
    :headers="headers"
    search-label="Buscar ventas..."
    no-data-icon="mdi-cart-off"
    no-data-title="No hay ventas"
    no-data-subtitle="Crea tu primera venta para comenzar"
    ref="dataTableRef"
  >
    <!-- Slot para acciones del header -->
    <template #actions>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
      >
        Nueva Venta
      </v-btn>
    </template>

    <!-- Slot personalizado para la columna de usuario -->
    <template #item.user="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white">mdi-account</v-icon>
        </v-avatar>
        <span class="font-weight-medium">{{ item.user }}</span>
      </div>
    </template>

    <!-- Slot personalizado para producto/mensaje -->
    <template #item.productomsj="{ item }">
      <div class="text-truncate" style="max-width: 200px;" :title="item.productomsj">
        {{ item.productomsj }}
      </div>
    </template>

    <!-- Slot personalizado para cantidad -->
    <template #item.cantidad="{ item }">
      <v-chip color="info" variant="tonal" size="small">
        {{ item.cantidad }}
      </v-chip>
    </template>

    <!-- Slot personalizado para precio unitario con edición inline -->
    <template #item.preciounitario="{ item }">
      <v-text-field
        :model-value="item.preciounitario"
        @update:model-value="(value: any) => updatePrecioUnitario(item, value)"
        @blur="savePrecioUnitario(item)"
        type="number"
        variant="plain"
        density="compact"
        min="0"
        step="0.01"
        hide-details
        class="precio-editable"
        prefix="$"
      />
    </template>

    <!-- Slot personalizado para total neto -->
    <template #item.totalneto="{ item }">
      <v-chip color="success" variant="tonal" size="small">
        ${{ (item.cantidad * item.preciounitario).toFixed(2) }}
      </v-chip>
    </template>

    <!-- Slot personalizado para fecha -->
    <template #item.fecha="{ item }">
      <span class="text-body-2">{{ formatDate(item.fecha) }}</span>
    </template>

    <!-- Slot personalizado para estado con edición inline -->
    <template #item.estado="{ item }">
      <v-select
        :model-value="item.estado"
        @update:model-value="(value: any) => updateEstado(item, value)"
        :items="estadoOptions"
        variant="plain"
        density="compact"
        hide-details
        class="estado-editable"
        :color="getEstadoColor(item.estado)"
      >
        <template #selection="{ item: selectedItem }">
          <v-chip 
            :color="getEstadoColor(selectedItem.value)" 
            variant="tonal" 
            size="small"
          >
            {{ getEstadoText(selectedItem.value) }}
          </v-chip>
        </template>
        <template #item="{ props: itemProps, item: selectItem }">
          <v-list-item v-bind="itemProps">
            <template #prepend>
              <v-chip 
                :color="getEstadoColor(selectItem.value)" 
                variant="tonal" 
                size="small"
                class="mr-2"
              >
                {{ getEstadoText(selectItem.value) }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-select>
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

  <!-- Dialog para crear/editar venta -->
  <VentaChatDialog
    :visible="dialogVisible"
    :venta="selectedVenta"
    :mode="dialogMode"
    @close="closeDialog"
    @saved="handleVentaSaved"
  />

  <!-- Dialog de confirmación de eliminación -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
      <v-card-text>
        ¿Estás seguro de que quieres eliminar esta venta?
        <br><strong>Usuario:</strong> {{ ventaToDelete?.user }}
        <br><strong>Comprador:</strong> {{ ventaToDelete?.comprador }}
        <br>Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="deleteDialog = false"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          @click="confirmDelete"
        >
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ventasChatService, ventasChatServicePaginated } from '../services/ventasChatService'
import type { VentaChat } from '../types'
import DataTableSelfContained from './DataTableSelfContained.vue'
import VentaChatDialog from './VentaChatDialog.vue'

// Emits
const emit = defineEmits<{
  'estado-changed': []
}>()

// Estado local para dialogs
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedVenta = ref<VentaChat | null>(null)
const deleteDialog = ref(false)
const ventaToDelete = ref<VentaChat | null>(null)
const dataTableRef = ref()

// Estado para edición inline
const editingPrices = ref<Map<number, number>>(new Map())

// Opciones para el select de estado
const estadoOptions = [
  { title: 'Por Pagar', value: 'POR PAGAR' },
  { title: 'Pago Parcial', value: 'PAGO PARCIAL' },
  { title: 'Pagado', value: 'PAGADO' }
]

// Headers de la tabla
const headers = [
  { title: 'Usuario', key: 'user', align: 'start' as const, sortable: true },
  { title: 'Producto/Mensaje', key: 'productomsj', align: 'start' as const, sortable: true },
  { title: 'Cantidad', key: 'cantidad', align: 'center' as const, sortable: true, width: '100px' },
  { title: 'Precio Unit.', key: 'preciounitario', align: 'end' as const, sortable: true, width: '120px' },
  { title: 'Total Neto', key: 'totalneto', align: 'end' as const, sortable: true, width: '120px' },
  { title: 'Fecha', key: 'fecha', align: 'center' as const, sortable: true, width: '110px' },
  { title: 'Comprador', key: 'comprador', align: 'start' as const, sortable: true },
  { title: 'Estado', key: 'estado', align: 'center' as const, sortable: true, width: '140px' },
  { title: 'Acciones', key: 'actions', align: 'center' as const, sortable: false, width: '100px' }
]

// Formatear fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Obtener color del estado
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'POR PAGAR': return 'error'
    case 'PAGO PARCIAL': return 'warning'
    case 'PAGADO': return 'success'
    default: return 'default'
  }
}

// Obtener texto del estado
const getEstadoText = (estado: string) => {
  switch (estado) {
    case 'POR PAGAR': return 'Por Pagar'
    case 'PAGO PARCIAL': return 'Pago Parcial'
    case 'PAGADO': return 'Pagado'
    default: return estado
  }
}

// Abrir dialog para crear
const openCreateDialog = () => {
  selectedVenta.value = null
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// Abrir dialog para editar
const openEditDialog = (venta: VentaChat) => {
  selectedVenta.value = venta
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Cerrar dialog
const closeDialog = () => {
  dialogVisible.value = false
  selectedVenta.value = null
}

// Manejar venta guardada
const handleVentaSaved = async () => {
  closeDialog()
  await dataTableRef.value?.refresh()
}

// Abrir dialog de eliminación
const openDeleteDialog = (venta: VentaChat) => {
  ventaToDelete.value = venta
  deleteDialog.value = true
}

// Confirmar eliminación
const confirmDelete = async () => {
  if (ventaToDelete.value) {
    const success = await dataTableRef.value?.deleteItem(ventaToDelete.value.id!)
    if (success) {
      deleteDialog.value = false
      ventaToDelete.value = null
    }
  }
}

// Funciones para edición inline del precio
const updatePrecioUnitario = (item: VentaChat, value: any) => {
  const numericValue = parseFloat(value) || 0
  if (item.id) {
    editingPrices.value.set(item.id, numericValue)
    // Actualizar el precio inmediatamente para feedback visual
    item.preciounitario = numericValue
  }
}

const savePrecioUnitario = async (item: VentaChat) => {
  if (!item.id || !editingPrices.value.has(item.id)) return

  const newPrice = editingPrices.value.get(item.id)!
  const newTotal = item.cantidad * newPrice // Calcular nuevo total
  
  try {
    await ventasChatService.update(item.id.toString(), {
      preciounitario: newPrice
      // No necesitamos enviar totalneto ya que se calcula automáticamente en la base de datos
    })
    
    // Actualizar el item localmente
    item.preciounitario = newPrice
    item.totalneto = newTotal
    
    // Limpiar el estado de edición
    editingPrices.value.delete(item.id)
    
    // Refrescar la tabla para mostrar cambios
    await dataTableRef.value?.refresh()
  } catch (error) {
    console.error('Error updating price:', error)
    alert('Error al actualizar el precio')
    // Revertir el cambio
    editingPrices.value.delete(item.id)
  }
}

// Función para actualizar el estado
const updateEstado = async (item: VentaChat, newEstado: string) => {
  if (!item.id) return

  const oldEstado = item.estado

  try {
    // Actualizar inmediatamente para feedback visual
    item.estado = newEstado

    await ventasChatService.update(item.id.toString(), {
      estado: newEstado
    })

    // Refrescar la tabla para asegurar consistencia
    await dataTableRef.value?.refresh()
    
    // Emitir evento para actualizar estadísticas
    emit('estado-changed')
    
  } catch (error) {
    console.error('Error updating estado:', error)
    alert('Error al actualizar el estado')
    // Revertir el cambio
    item.estado = oldEstado
  }
}
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.precio-editable :deep(.v-field__input) {
  font-weight: 500;
  color: rgb(var(--v-theme-success));
  text-align: right;
  min-height: 32px;
}

.precio-editable :deep(.v-field) {
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.precio-editable:hover :deep(.v-field) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.precio-editable:focus-within :deep(.v-field) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgb(var(--v-theme-primary));
}

.estado-editable :deep(.v-field) {
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-height: 32px;
}

.estado-editable:hover :deep(.v-field) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.estado-editable :deep(.v-field__input) {
  padding: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.estado-editable :deep(.v-field__append-inner) {
  padding-top: 0;
  margin-left: 4px;
}

/* Personalizar el dropdown del estado */
.estado-editable :deep(.v-overlay__content) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.estado-editable :deep(.v-list-item) {
  padding: 8px 16px;
}

.estado-editable :deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>

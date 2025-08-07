<template>
  <v-card elevation="2" class="data-list-view">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon v-if="icon" :icon="icon" class="mr-3" />
        <span class="text-h6">{{ title }}</span>
      </div>
      <div class="d-flex align-center gap-2">
        <slot name="actions" />
        <v-btn
          v-if="showRefreshButton"
          icon="mdi-refresh"
          variant="text"
          @click="refresh"
          :loading="loading"
        />
      </div>
    </v-card-title>

    <v-card-text class="pa-0">
      <!-- Búsqueda -->
      <div v-if="showSearch" class="pa-4 pb-0">
        <v-text-field
          :model-value="searchTerm"
          @update:model-value="handleSearch"
          :label="searchLabel"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </div>

      <!-- Estadísticas y Debug Info - Responsivas -->
      <v-row class="ma-0 pa-4 pb-0">
        <v-col cols="12">
          <div class="d-flex flex-wrap gap-2">
            <v-chip color="primary" variant="tonal" size="small">
              <v-icon start>mdi-counter</v-icon>
              <span class="d-none d-sm-inline">Mostrando: </span>{{ items.length }} de {{ totalItems }}
            </v-chip>
            <v-chip color="info" variant="tonal" size="small">
              <v-icon start>mdi-file-multiple</v-icon>
              <span class="d-none d-sm-inline">Página: </span>{{ currentPage }} de {{ totalPages }}
            </v-chip>
            <v-chip color="success" variant="tonal" size="small">
              <v-icon start>mdi-format-list-numbered</v-icon>
              <span class="d-none d-sm-inline">Por página: </span>{{ itemsPerPage }}
            </v-chip>
          </div>
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
        class="ma-4"
      >
        {{ error }}
      </v-alert>

      <!-- Vista de tabla para pantallas grandes -->
      <div v-show="!$vuetify.display.mobile" class="table-container pa-4 pt-0">
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :item-key="itemKey"
          class="elevation-1"
          hide-default-footer
          :density="$vuetify.display.xs ? 'compact' : 'default'"
        >
          <!-- Slots dinámicos para columnas personalizadas -->
          <template
            v-for="slot in customSlots"
            :key="slot"
            #[slot]="slotProps"
          >
            <slot :name="slot" v-bind="slotProps" />
          </template>

          <!-- Slot para no-data personalizable -->
          <template v-slot:no-data>
            <div class="text-center pa-4">
              <v-icon size="64" color="grey">{{ noDataIcon }}</v-icon>
              <p class="text-h6 mt-2">{{ noDataTitle }}</p>
              <p class="text-body-2">{{ noDataSubtitle }}</p>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Vista de lista/cards para pantallas móviles -->
      <div v-show="$vuetify.display.mobile" class="list-container pa-4 pt-0">
        <div v-if="items.length === 0 && !loading" class="text-center pa-8">
          <v-icon size="64" color="grey">{{ noDataIcon }}</v-icon>
          <p class="text-h6 mt-2">{{ noDataTitle }}</p>
          <p class="text-body-2">{{ noDataSubtitle }}</p>
        </div>
        
        <v-card
          v-for="item in items"
          :key="item[itemKey]"
          class="mb-3"
          elevation="1"
          :loading="loading"
        >
          <v-card-text class="pa-3">
            <!-- Slot personalizable para el contenido de cada tarjeta -->
            <slot name="mobile-item" :item="item">
              <!-- Contenido por defecto si no se proporciona slot -->
              <div v-for="header in displayHeaders" :key="header.key" class="mb-2">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis font-weight-bold">
                    {{ header.title }}:
                  </span>
                  <div class="text-body-2">
                    <!-- Usar slots dinámicos si están disponibles -->
                    <slot 
                      v-if="customSlots.includes(`item.${header.key}`)"
                      :name="`item.${header.key}`" 
                      :item="item"
                    />
                    <!-- Valor por defecto -->
                    <span v-else>{{ getItemValue(item, header.key) }}</span>
                  </div>
                </div>
                <v-divider v-if="header.key !== displayHeaders[displayHeaders.length - 1].key" class="mt-2" />
              </div>
            </slot>
          </v-card-text>
        </v-card>
      </div>

      <!-- Footer de paginación personalizado - Responsivo -->
      <v-card-actions class="justify-center pa-4 mt-2 border-t">
        <v-row align="center" justify="center" no-gutters class="align-center">
          <!-- Select de elementos por página -->
          <v-col cols="12" sm="auto" class="d-flex justify-center mb-2 mb-sm-0">
            <v-select
              :model-value="itemsPerPage"
              :items="itemsPerPageOptions"
              label="Elementos por página"
              @update:model-value="changeItemsPerPage"
              density="compact"
              variant="outlined"
              :style="{ width: $vuetify.display.xs ? '100%' : '200px' }"
              hide-details
              :menu-props="{ offset: 8, zIndex: 2000 }"
            />
          </v-col>
          
          <!-- Paginación -->
          <v-col cols="12" sm="auto" class="d-flex justify-center mb-2 mb-sm-0">
            <v-pagination
              :model-value="currentPage"
              :length="totalPages"
              :total-visible="$vuetify.display.xs ? 3 : totalVisible"
              @update:model-value="loadPage"
              :disabled="loading"
              :show-first-last-page="!$vuetify.display.xs"
              density="comfortable"
            />
          </v-col>
          
          <!-- Texto de paginación -->
          <v-col cols="12" sm="auto" class="d-flex justify-center">
            <span class="text-body-2 text-center">
              {{ getPaginationText() }}
            </span>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, useSlots, onMounted } from 'vue'
import { usePagination } from '../composables/usePagination'
import type { PaginatedService } from '../composables/usePagination'

// Interfaces
interface Header {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: string | number
  mobile?: boolean // Nueva propiedad para controlar si se muestra en móvil
}

interface Props {
  // Configuración del servicio
  service: PaginatedService<any>
  initialItemsPerPage?: number
  
  // Datos principales
  title: string
  icon?: string
  headers: Header[]
  itemKey?: string
  
  // Configuración de búsqueda
  showSearch?: boolean
  searchLabel?: string
  
  // Configuración de paginación
  itemsPerPageOptions?: number[]
  totalVisible?: number
  
  // Configuración de UI
  showRefreshButton?: boolean
  noDataIcon?: string
  noDataTitle?: string
  noDataSubtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemKey: 'id',
  showSearch: true,
  searchLabel: 'Buscar...',
  itemsPerPageOptions: () => [5, 10, 25, 50],
  totalVisible: 5,
  showRefreshButton: true,
  noDataIcon: 'mdi-database-off',
  noDataTitle: 'No hay datos',
  noDataSubtitle: 'No se encontraron registros'
})

// Emits para operaciones CRUD
const emit = defineEmits<{
  'item-created': [item: any]
  'item-updated': [item: any]
  'item-deleted': [id: string]
}>()

// Usar el composable de paginación con el servicio proporcionado
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
  create,
  update,
  remove,
  refresh,
  initialize,
  clearError
} = usePagination(props.service, props.initialItemsPerPage)

// Slots dinámicos - detectar automáticamente los slots personalizados
const slots = useSlots()
const customSlots = computed(() => {
  const slotNames = Object.keys(slots)
  return slotNames.filter(name => 
    name.startsWith('item.') || 
    name === 'actions' ||
    name.startsWith('header.')
  )
})

// Headers para mostrar en vista móvil (excluir 'actions' por defecto)
const displayHeaders = computed(() => {
  return props.headers.filter(header => 
    header.key !== 'actions' && 
    (header.mobile !== false) // Solo excluir si mobile está explícitamente en false
  )
})

// Función para obtener valor de un item por key
const getItemValue = (item: any, key: string) => {
  const value = item[key]
  if (value === null || value === undefined) return '-'
  
  // Formatear fechas automáticamente
  if (key.includes('date') || key.includes('_at')) {
    try {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return value
    }
  }
  
  // Formatear números si es precio o cantidad
  if (key.includes('precio') || key.includes('total')) {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      return `$${num.toFixed(2)}`
    }
  }
  
  return value
}

// Debounce function para búsqueda
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

// Búsqueda con debounce
const debouncedSearch = debounce((term: string) => {
  search(term || '')
}, 300)

// Manejar búsqueda
const handleSearch = (value: string) => {
  debouncedSearch(value)
}

// Texto de paginación
const getPaginationText = () => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, totalItems.value)
  return `${start}-${end} de ${totalItems.value}`
}

// Métodos CRUD expuestos
const createItem = async (data: any) => {
  const newItem = await create(data)
  if (newItem) {
    emit('item-created', newItem)
  }
  return newItem
}

const updateItem = async (id: string, data: any) => {
  const updatedItem = await update(id, data)
  if (updatedItem) {
    emit('item-updated', updatedItem)
  }
  return updatedItem
}

const deleteItem = async (id: string) => {
  const success = await remove(id)
  if (success) {
    emit('item-deleted', id)
  }
  return success
}

// Inicializar al montar
onMounted(async () => {
  await initialize()
})

// Exponer métodos para uso externo
defineExpose({
  refresh,
  createItem,
  updateItem,
  deleteItem,
  clearError,
  // Datos reactivos
  items,
  loading,
  saving,
  error,
  hasError,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage
})
</script>

<style scoped>
.data-list-view {
  width: 100%;
}

.gap-2 {
  gap: 8px;
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-card-actions .v-row {
  align-items: center !important;
}

.v-card-actions .v-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Asegurar que el dropdown del select aparezca correctamente */
.v-card-actions .v-select :deep(.v-menu) {
  z-index: 2001 !important;
}

.v-card-actions .v-select :deep(.v-overlay__content) {
  z-index: 2001 !important;
  margin-top: 4px;
}

/* Contenedor responsivo para la tabla */
.table-container {
  overflow-x: auto;
  width: 100%;
}

/* Cards en vista móvil */
.list-container .v-card {
  transition: transform 0.2s ease-in-out;
}

.list-container .v-card:hover {
  transform: translateY(-1px);
}

/* Espaciado responsivo */
@media (max-width: 600px) {
  .v-card-title {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px;
  }
  
  .v-card-title > div:last-child {
    width: 100%;
    justify-content: flex-end;
  }
  
  .v-card-actions {
    padding-top: 16px !important;
  }
  
  .v-card-actions .v-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .v-card-actions .v-col {
    width: 100%;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .v-card-actions .v-col + .v-col {
    margin-left: 16px;
  }
}

@media (min-width: 961px) {
  .v-card-actions .v-col + .v-col {
    margin-left: 24px;
  }
}

/* Mejorar visibilidad en dispositivos pequeños */
@media (max-width: 600px) {
  .text-caption {
    font-size: 0.75rem;
  }
  
  .text-body-2 {
    font-size: 0.875rem;
  }
}
</style>

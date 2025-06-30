<template>
  <v-card>
    <!-- Header responsivo -->
    <v-card-title class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between pa-4 pb-2 pb-sm-4">
      <div class="d-flex align-center mb-2 mb-sm-0">
        <v-icon v-if="icon" class="mr-2">{{ icon }}</v-icon>
        <span class="text-h5 text-sm-h4">{{ title }}</span>
      </div>
      <div class="d-flex align-center gap-2 align-self-stretch align-self-sm-center">
        <v-btn
          v-if="showRefreshButton"
          icon="mdi-refresh"
          variant="text"
          @click="$emit('refresh')"
          :loading="loading"
          size="small"
        />
        <slot name="actions" />
      </div>
    </v-card-title>

    <v-card-text>
      <!-- Barra de búsqueda -->
      <v-text-field
        v-if="showSearch"
        :model-value="searchTerm"
        :label="searchLabel"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        @update:model-value="handleSearch"
        class="mb-4"
      />

      <!-- Estadísticas y Debug Info - Responsivas -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex flex-wrap gap-2">
            <v-chip color="primary" variant="tonal" size="small">
              <v-icon start>mdi-counter</v-icon>
              <span class="d-none d-sm-inline">Mostrando: </span>{{ items.length }} de {{ totalCount }}
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
        @click:close="$emit('clear-error')"
        class="mb-4"
      >
        {{ error }}
      </v-alert>

      <!-- Tabla de datos - Responsiva -->
      <div class="table-container">
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :item-key="itemKey"
          class="elevation-1"
          hide-default-footer
          :mobile-breakpoint="0"
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
              <p class="text-h6 mt-2">
                {{ noDataTitle }}
              </p>
              <p class="text-body-2">
                {{ noDataSubtitle }}
              </p>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Footer de paginación personalizado - Responsivo -->
      <v-card-actions class="justify-center pa-2 pa-md-4 mt-2">
        <v-row align="center" justify="center" no-gutters class="align-center">
          <!-- Select de elementos por página -->
          <v-col cols="12" sm="auto" class="d-flex justify-center mb-2 mb-sm-0">
            <v-select
              :model-value="itemsPerPage"
              :items="itemsPerPageOptions"
              label="Elementos por página"
              density="compact"
              variant="outlined"
              @update:model-value="$emit('change-items-per-page', $event)"
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
              @update:model-value="$emit('change-page', $event)"
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
import { computed, useSlots } from 'vue'

// Interfaces
interface Header {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: string | number
}

interface Props {
  // Datos principales
  title: string
  icon?: string
  headers: Header[]
  items: any[]
  itemKey?: string
  
  // Estado de carga y errores
  loading?: boolean
  error?: string | null
  hasError?: boolean
  
  // Configuración de búsqueda
  showSearch?: boolean
  searchTerm?: string
  searchLabel?: string
  
  // Configuración de paginación
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalCount: number
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
  loading: false,
  error: null,
  hasError: false,
  showSearch: true,
  searchTerm: '',
  searchLabel: 'Buscar...',
  itemsPerPageOptions: () => [5, 10, 25, 50],
  totalVisible: 5,
  showRefreshButton: true,
  noDataIcon: 'mdi-database-off',
  noDataTitle: 'No hay datos',
  noDataSubtitle: 'No se encontraron registros'
})

// Emits
const emit = defineEmits<{
  'refresh': []
  'clear-error': []
  'search': [term: string]
  'change-page': [page: number]
  'change-items-per-page': [itemsPerPage: number]
}>()

// Slots dinámicos - detectar automáticamente los slots personalizados
const slots = useSlots()
const customSlots = computed(() => {
  const slotNames = Object.keys(slots)
  // Filtrar slots estándar de Vue y solo devolver slots de items
  return slotNames.filter(name => 
    name.startsWith('item.') || 
    name === 'actions' ||
    name.startsWith('header.')
  )
})

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
  emit('search', term || '')
}, 300)

// Manejar búsqueda
const handleSearch = (value: string) => {
  debouncedSearch(value)
}

// Texto de paginación
const getPaginationText = () => {
  const start = (props.currentPage - 1) * props.itemsPerPage + 1
  const end = Math.min(props.currentPage * props.itemsPerPage, props.totalCount)
  return `${start}-${end} de ${props.totalCount}`
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.v-data-table {
  border-radius: 8px;
}

.v-chip {
  font-weight: 500;
}

/* Contenedor responsivo para la tabla */
.table-container {
  overflow-x: auto;
  width: 100%;
  margin-bottom: 8px; /* Espacio entre tabla y paginación */
}

/* Asegurar alineamiento perfecto de elementos de paginación */
.v-card-actions {
  position: relative;
  z-index: 1;
  background-color: rgba(var(--v-theme-surface), 1);
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

/* Ajuste específico para el select de elementos por página */
.v-card-actions .v-select {
  margin-bottom: 0 !important;
}

/* Asegurar que el dropdown del select aparezca correctamente */
.v-card-actions .v-select :deep(.v-menu) {
  z-index: 2001 !important;
}

.v-card-actions .v-select :deep(.v-overlay__content) {
  z-index: 2001 !important;
  margin-top: 4px;
}

/* Espaciado responsivo */
@media (max-width: 600px) {
  .v-card-title {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  
  .v-card-title > div:last-child {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
  
  .table-container {
    margin: -8px;
    padding: 8px;
    margin-bottom: 0; /* Sin margen inferior en móvil */
  }
  
  /* Footer de paginación con más separación en móvil */
  .v-card-actions {
    margin-top: 12px !important;
    padding-top: 16px !important;
    border-top: 2px solid rgba(var(--v-border-color), 0.2) !important;
  }
  
  /* Elementos de paginación apilados en móvil */
  .v-card-actions .v-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .v-card-actions .v-col {
    width: 100%;
  }
  
  /* Select con más espacio en móvil */
  .v-card-actions .v-select {
    margin-bottom: 8px !important;
  }
  
  /* Chips más pequeños en móvil */
  .v-chip {
    font-size: 0.75rem;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  /* Ajustes para tablet */
  .v-card-actions .v-col + .v-col {
    margin-left: 16px;
  }
}

@media (min-width: 961px) {
  /* Ajustes para desktop */
  .v-card-actions .v-col + .v-col {
    margin-left: 24px;
  }
}

/* Responsividad de la búsqueda */
@media (max-width: 600px) {
  .v-text-field {
    font-size: 14px;
  }
}

/* Mejorar visibilidad de la tabla en dispositivos pequeños */
@media (max-width: 600px) {
  :deep(.v-data-table) {
    font-size: 0.875rem;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12) !important;
    margin-bottom: 8px;
  }
  
  :deep(.v-data-table-header) {
    font-size: 0.8rem;
  }
  
  :deep(.v-btn) {
    min-width: 32px !important;
  }
}

/* Mejorar dropdown del select para evitar superposición */
.v-card-actions .v-select :deep(.v-overlay__content) {
  margin-top: 8px !important;
  box-shadow: 0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12) !important;
}
</style>

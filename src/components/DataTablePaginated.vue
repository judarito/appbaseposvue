<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon v-if="icon" class="mr-2">{{ icon }}</v-icon>
        {{ title }}
      </div>
      <div class="d-flex align-center gap-2">
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

      <!-- Estadísticas y Debug Info -->
      <v-row class="mb-4">
        <v-col>
          <v-chip color="primary" variant="tonal">
            <v-icon start>mdi-counter</v-icon>
            Mostrando: {{ items.length }} de {{ totalCount }}
          </v-chip>
          <v-chip color="info" variant="tonal" class="ml-2">
            <v-icon start>mdi-file-multiple</v-icon>
            Página: {{ currentPage }} de {{ totalPages }}
          </v-chip>
          <v-chip color="success" variant="tonal" class="ml-2">
            <v-icon start>mdi-format-list-numbered</v-icon>
            Por página: {{ itemsPerPage }}
          </v-chip>
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

      <!-- Tabla de datos -->
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :item-key="itemKey"
        class="elevation-1"
        hide-default-footer
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

      <!-- Footer de paginación personalizado -->
      <v-card-actions class="justify-center">
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <v-select
              :model-value="itemsPerPage"
              :items="itemsPerPageOptions"
              label="Elementos por página"
              density="compact"
              variant="outlined"
              @update:model-value="$emit('change-items-per-page', $event)"
              style="width: 200px"
            />
          </v-col>
          <v-col cols="auto">
            <v-pagination
              :model-value="currentPage"
              :length="totalPages"
              :total-visible="totalVisible"
              @update:model-value="$emit('change-page', $event)"
              :disabled="loading"
            />
          </v-col>
          <v-col cols="auto">
            <span class="text-body-2">
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
</style>

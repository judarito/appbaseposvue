# Componentes Reutilizables de Paginación

Esta documentación explica cómo usar los componentes reutilizables para crear tablas con paginación server-side.

## 🧩 Componentes Principales

### 1. `DataTablePaginated.vue`
Componente de tabla genérico con paginación server-side, búsqueda y manejo de estados.

### 2. `usePagination.ts` 
Composable genérico para manejar lógica de paginación con cualquier servicio.

## 🚀 Uso Básico

### Paso 1: Crear un Servicio

Tu servicio debe implementar la interfaz `PaginatedService<T>`:

```typescript
// services/myService.ts
import type { PaginatedService, PaginationOptions, PaginatedResponse } from '../composables/usePagination'

export class MyService implements PaginatedService<MyModel> {
  async getPaginated(options: PaginationOptions): Promise<PaginatedResponse<MyModel>> {
    // Implementar lógica de paginación
    return {
      data: [], // Array de elementos
      total: 0, // Total de elementos en el servidor
      page: options.page,
      itemsPerPage: options.itemsPerPage,
      totalPages: Math.ceil(total / options.itemsPerPage)
    }
  }

  async create(data: any): Promise<MyModel> {
    // Implementar creación
  }

  async update(id: string, data: any): Promise<MyModel> {
    // Implementar actualización
  }

  async delete(id: string): Promise<void> {
    // Implementar eliminación
  }
}
```

### Paso 2: Usar en un Componente

```vue
<template>
  <DataTablePaginated
    title="Mi Lista"
    icon="mdi-my-icon"
    :headers="headers"
    :items="items"
    :loading="loading"
    :error="error"
    :has-error="hasError"
    :current-page="currentPage"
    :total-pages="totalPages"
    :items-per-page="itemsPerPage"
    :total-count="totalItems"
    @refresh="refresh"
    @clear-error="clearError"
    @search="search"
    @change-page="loadPage"
    @change-items-per-page="changeItemsPerPage"
  >
    <!-- Slot para acciones del header -->
    <template #actions>
      <v-btn color="primary" @click="openCreateDialog">
        Nuevo Elemento
      </v-btn>
    </template>

    <!-- Slots personalizados para columnas -->
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <v-avatar class="mr-3">{{ item.name[0] }}</v-avatar>
        {{ item.name }}
      </div>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon="mdi-pencil" @click="edit(item)" />
      <v-btn icon="mdi-delete" @click="remove(item)" />
    </template>
  </DataTablePaginated>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePagination } from '../composables/usePagination'
import { myService } from '../services/myService'
import DataTablePaginated from '../components/DataTablePaginated.vue'

// Usar el composable
const {
  items,
  loading,
  error,
  hasError,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  loadPage,
  changeItemsPerPage,
  search,
  refresh,
  initialize,
  clearError
} = usePagination(myService, 10)

// Headers de la tabla
const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Fecha', key: 'created_at', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

onMounted(() => {
  initialize()
})
</script>
```

## 📋 Props del DataTablePaginated

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `title` | string | Título de la tabla | ✅ |
| `headers` | Header[] | Configuración de columnas | ✅ |
| `items` | any[] | Array de elementos | ✅ |
| `currentPage` | number | Página actual | ✅ |
| `totalPages` | number | Total de páginas | ✅ |
| `itemsPerPage` | number | Elementos por página | ✅ |
| `totalCount` | number | Total de elementos | ✅ |
| `icon` | string | Icono del título | ❌ |
| `loading` | boolean | Estado de carga | ❌ |
| `error` | string | Mensaje de error | ❌ |
| `showSearch` | boolean | Mostrar búsqueda | ❌ (default: true) |
| `searchLabel` | string | Label del campo búsqueda | ❌ |
| `showRefreshButton` | boolean | Mostrar botón refresh | ❌ (default: true) |

## 🎯 Eventos Emitidos

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `refresh` | - | Solicita refrescar datos |
| `clear-error` | - | Solicita limpiar errores |
| `search` | term: string | Buscar por término |
| `change-page` | page: number | Cambiar página |
| `change-items-per-page` | size: number | Cambiar tamaño página |

## 🎨 Slots Disponibles

### Slots del Header
- `actions`: Botones adicionales en el header

### Slots de Columnas
- `item.{columnKey}`: Personalizar contenido de columna
- `header.{columnKey}`: Personalizar header de columna

### Ejemplo de Slots Personalizados

```vue
<!-- Columna personalizada con avatar -->
<template #item.user="{ item }">
  <div class="d-flex align-center">
    <v-avatar size="32" :color="item.status === 'active' ? 'success' : 'grey'">
      {{ item.name.charAt(0) }}
    </v-avatar>
    <div class="ml-3">
      <div class="font-weight-medium">{{ item.name }}</div>
      <div class="text-caption">{{ item.email }}</div>
    </div>
  </div>
</template>

<!-- Acciones personalizadas -->
<template #item.actions="{ item }">
  <v-btn-group variant="text" density="compact">
    <v-btn icon="mdi-eye" @click="view(item)" />
    <v-btn icon="mdi-pencil" @click="edit(item)" />
    <v-btn icon="mdi-delete" color="error" @click="remove(item)" />
  </v-btn-group>
</template>
```

## 🔧 Configuración Avanzada

### Headers con Configuración Completa

```typescript
const headers = [
  {
    title: 'Usuario',
    key: 'name',
    align: 'start',
    sortable: true,
    width: '300px'
  },
  {
    title: 'Estado',
    key: 'status',
    align: 'center',
    sortable: false,
    width: '120px'
  },
  {
    title: 'Fecha',
    key: 'created_at',
    align: 'end',
    sortable: true
  }
]
```

### Personalización de Textos

```vue
<DataTablePaginated
  title="Mi Lista Personalizada"
  search-label="Buscar en mi lista..."
  no-data-icon="mdi-emoticon-sad"
  no-data-title="¡Ups! No hay datos"
  no-data-subtitle="Intenta agregar algunos elementos"
  :items-per-page-options="[10, 25, 50, 100]"
/>
```

## 📚 Ejemplos Incluidos

1. **TenantsListNew.vue**: Implementación completa con CRUD
2. **UsersNew.vue**: Ejemplo básico con datos simulados

## 🎛️ Ventajas

- ✅ **Reutilizable**: Un componente para todas las tablas
- ✅ **Paginación Server-side**: Eficiente con grandes datasets
- ✅ **Búsqueda integrada**: Con debounce automático
- ✅ **Manejo de estados**: Loading, errores, vacío
- ✅ **Personalizable**: Slots para cualquier contenido
- ✅ **TypeScript**: Totalmente tipado
- ✅ **Responsive**: Funciona en móviles y desktop

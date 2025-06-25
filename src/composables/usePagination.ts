import { ref, computed } from 'vue'

export interface PaginationOptions {
  page: number
  itemsPerPage: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  itemsPerPage: number
  totalPages: number
}

export interface PaginatedService<T> {
  getPaginated(options: PaginationOptions): Promise<PaginatedResponse<T>>
  create?(data: any): Promise<T>
  update?(id: string, data: any): Promise<T>
  delete?(id: string): Promise<void>
}

export function usePagination<T>(
  service: PaginatedService<T>,
  initialItemsPerPage: number = 10
) {
  // Estado de datos
  const items = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  // Estado de paginación
  const totalItems = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(initialItemsPerPage)
  const sortBy = ref<string>('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const searchTerm = ref('')

  // Computed
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  const hasError = computed(() => !!error.value)
  const itemsCount = computed(() => items.value.length)

  // Limpiar error
  const clearError = () => {
    error.value = null
  }

  // Cargar datos con paginación
  const loadData = async (options?: Partial<PaginationOptions>) => {
    loading.value = true
    error.value = null
    
    try {
      // Actualizar opciones de paginación
      if (options?.page !== undefined) currentPage.value = options.page
      if (options?.itemsPerPage !== undefined) itemsPerPage.value = options.itemsPerPage
      if (options?.sortBy !== undefined) sortBy.value = options.sortBy
      if (options?.sortOrder !== undefined) sortOrder.value = options.sortOrder
      if (options?.search !== undefined) searchTerm.value = options.search

      const result = await service.getPaginated({
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        search: searchTerm.value
      })

      items.value = result.data
      totalItems.value = result.total
    } catch (err: any) {
      error.value = err.message || 'Error al cargar datos'
      console.error('Error loading data:', err)
    } finally {
      loading.value = false
    }
  }

  // Cargar página específica
  const loadPage = async (page: number) => {
    await loadData({ page })
  }

  // Cambiar tamaño de página
  const changeItemsPerPage = async (newItemsPerPage: number) => {
    currentPage.value = 1 // Reset a primera página
    await loadData({ page: 1, itemsPerPage: newItemsPerPage })
  }

  // Cambiar orden
  const changeSorting = async (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    await loadData({ sortBy: newSortBy, sortOrder: newSortOrder })
  }

  // Buscar con paginación
  const search = async (searchTerm: string) => {
    currentPage.value = 1 // Reset a primera página al buscar
    await loadData({ page: 1, search: searchTerm })
  }

  // Crear nuevo elemento
  const create = async (data: any): Promise<T | null> => {
    if (!service.create) {
      throw new Error('Create method not implemented in service')
    }

    saving.value = true
    error.value = null
    
    try {
      const newItem = await service.create(data)
      
      // Recargar datos para mostrar el nuevo elemento
      await loadData()
      
      return newItem
    } catch (err: any) {
      error.value = err.message || 'Error al crear elemento'
      console.error('Error creating item:', err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Actualizar elemento
  const update = async (id: string, data: any): Promise<T | null> => {
    if (!service.update) {
      throw new Error('Update method not implemented in service')
    }

    saving.value = true
    error.value = null
    
    try {
      const updatedItem = await service.update(id, data)
      
      // Recargar datos para mostrar los cambios
      await loadData()
      
      return updatedItem
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar elemento'
      console.error('Error updating item:', err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Eliminar elemento
  const remove = async (id: string): Promise<boolean> => {
    if (!service.delete) {
      throw new Error('Delete method not implemented in service')
    }

    saving.value = true
    error.value = null
    
    try {
      await service.delete(id)
      
      // Recargar datos para reflejar la eliminación
      await loadData()
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar elemento'
      console.error('Error deleting item:', err)
      return false
    } finally {
      saving.value = false
    }
  }

  // Refrescar datos
  const refresh = async () => {
    await loadData()
  }

  // Inicializar datos
  const initialize = async (options?: Partial<PaginationOptions>) => {
    await loadData({ page: 1, itemsPerPage: initialItemsPerPage, ...options })
  }

  return {
    // Estado
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    saving: computed(() => saving.value),
    error: computed(() => error.value),
    hasError,
    itemsCount,
    
    // Paginación
    totalItems: computed(() => totalItems.value),
    totalPages,
    currentPage: computed(() => currentPage.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    sortBy: computed(() => sortBy.value),
    sortOrder: computed(() => sortOrder.value),
    searchTerm: computed(() => searchTerm.value),

    // Métodos
    loadData,
    loadPage,
    changeItemsPerPage,
    changeSorting,
    search,
    create,
    update,
    remove,
    refresh,
    initialize,
    clearError
  }
}

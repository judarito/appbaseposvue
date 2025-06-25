import { ref, computed } from 'vue'
import { tenantService, type Tenant, type CreateTenantData, type UpdateTenantData, type PaginationOptions, type PaginatedResponse } from '../services/tenantService'

export type { PaginationOptions, PaginatedResponse }

export function useTenants() {
  const tenants = ref<Tenant[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Estado para tenant individual
  const currentTenant = ref<Tenant | null>(null)
  const saving = ref(false)

  // Estado de paginación
  const totalTenants = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const sortBy = ref<string>('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const searchTerm = ref('')

  // Computed
  const tenantsCount = computed(() => tenants.value.length)
  const totalCount = computed(() => totalTenants.value)
  const totalPages = computed(() => Math.ceil(totalTenants.value / itemsPerPage.value))
  const hasError = computed(() => !!error.value)

  // Limpiar error
  const clearError = () => {
    error.value = null
  }

  // Cargar tenants con paginación
  const loadTenants = async (options?: Partial<PaginationOptions>) => {
    loading.value = true
    error.value = null
    
    try {
      // Actualizar opciones de paginación
      if (options?.page !== undefined) currentPage.value = options.page
      if (options?.itemsPerPage !== undefined) itemsPerPage.value = options.itemsPerPage
      if (options?.sortBy !== undefined) sortBy.value = options.sortBy
      if (options?.sortOrder !== undefined) sortOrder.value = options.sortOrder
      if (options?.search !== undefined) searchTerm.value = options.search

      const result = await tenantService.getTenantsPaginated({
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        search: searchTerm.value
      })

      console.log('Pagination result:', result) // Debug
      
      tenants.value = result.data
      totalTenants.value = result.total
      
      console.log('State updated - tenants count:', tenants.value.length, 'total:', totalTenants.value, 'page:', currentPage.value) // Debug
    } catch (err: any) {
      error.value = err.message || 'Error al cargar tenants'
      console.error('Error loading tenants:', err)
    } finally {
      loading.value = false
    }
  }

  // Cargar página específica
  const loadPage = async (page: number) => {
    await loadTenants({ page })
  }

  // Cambiar tamaño de página
  const changeItemsPerPage = async (newItemsPerPage: number) => {
    currentPage.value = 1 // Reset a primera página
    await loadTenants({ page: 1, itemsPerPage: newItemsPerPage })
  }

  // Cambiar orden
  const changeSorting = async (sortBy: string, sortOrder: 'asc' | 'desc') => {
    await loadTenants({ sortBy, sortOrder })
  }

  // Buscar con paginación
  const searchTenants = async (searchTerm: string) => {
    currentPage.value = 1 // Reset a primera página al buscar
    await loadTenants({ page: 1, search: searchTerm })
  }

  // Cargar tenant por ID
  const loadTenant = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      currentTenant.value = await tenantService.getTenantById(id)
      if (!currentTenant.value) {
        throw new Error('Tenant no encontrado')
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar tenant'
      console.error('Error loading tenant:', err)
    } finally {
      loading.value = false
    }
  }

  // Crear tenant
  const createTenant = async (tenantData: CreateTenantData): Promise<Tenant | null> => {
    saving.value = true
    error.value = null
    
    try {
      // Verificar si ya existe un tenant con el mismo nombre
      const nameExists = await tenantService.checkTenantNameExists(tenantData.name)
      if (nameExists) {
        throw new Error('Ya existe un tenant con este nombre')
      }

      const newTenant = await tenantService.createTenant(tenantData)
      
      // Recargar la página actual para mostrar el nuevo tenant
      await loadTenants()
      
      return newTenant
    } catch (err: any) {
      error.value = err.message || 'Error al crear tenant'
      console.error('Error creating tenant:', err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Actualizar tenant
  const updateTenant = async (id: string, tenantData: UpdateTenantData): Promise<Tenant | null> => {
    saving.value = true
    error.value = null
    
    try {
      // Verificar si el nuevo nombre ya existe (excluyendo el tenant actual)
      if (tenantData.name) {
        const nameExists = await tenantService.checkTenantNameExists(tenantData.name, id)
        if (nameExists) {
          throw new Error('Ya existe un tenant con este nombre')
        }
      }

      const updatedTenant = await tenantService.updateTenant(id, tenantData)
      
      // Recargar la página actual para mostrar los cambios
      await loadTenants()
      
      // Actualizar tenant actual si es el mismo
      if (currentTenant.value?.id === id) {
        currentTenant.value = updatedTenant
      }
      
      return updatedTenant
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar tenant'
      console.error('Error updating tenant:', err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Eliminar tenant
  const deleteTenant = async (id: string): Promise<boolean> => {
    saving.value = true
    error.value = null
    
    try {
      await tenantService.deleteTenant(id)
      
      // Recargar la página actual para reflejar la eliminación
      await loadTenants()
      
      // Limpiar tenant actual si es el mismo
      if (currentTenant.value?.id === id) {
        currentTenant.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar tenant'
      console.error('Error deleting tenant:', err)
      return false
    } finally {
      saving.value = false
    }
  }

  // Refrescar datos - recargar página actual
  const refreshTenants = async () => {
    await loadTenants()
  }

  return {
    // Estado
    tenants: computed(() => tenants.value),
    currentTenant: computed(() => currentTenant.value),
    loading: computed(() => loading.value),
    saving: computed(() => saving.value),
    error: computed(() => error.value),
    hasError,
    tenantsCount,
    totalCount,
    totalPages,
    currentPage: computed(() => currentPage.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    sortBy: computed(() => sortBy.value),
    sortOrder: computed(() => sortOrder.value),
    searchTerm: computed(() => searchTerm.value),

    // Métodos
    loadTenants,
    loadTenant,
    loadPage,
    changeItemsPerPage,
    changeSorting,
    searchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    clearError,
    refreshTenants
  }
}
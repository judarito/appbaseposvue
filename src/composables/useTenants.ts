import { ref, computed } from 'vue'
import { tenantService, type Tenant, type CreateTenantData, type UpdateTenantData } from '../services/tenantService'

export function useTenants() {
  const tenants = ref<Tenant[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Estado para tenant individual
  const currentTenant = ref<Tenant | null>(null)
  const saving = ref(false)

  // Computed
  const tenantsCount = computed(() => tenants.value.length)
  const hasError = computed(() => !!error.value)

  // Limpiar error
  const clearError = () => {
    error.value = null
  }

  // Cargar todos los tenants
  const loadTenants = async () => {
    loading.value = true
    error.value = null
    
    try {
      tenants.value = await tenantService.getAllTenants()
    } catch (err: any) {
      error.value = err.message || 'Error al cargar tenants'
      console.error('Error loading tenants:', err)
    } finally {
      loading.value = false
    }
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
      
      // Recargar la lista completa para asegurar datos frescos
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
      
      // Recargar la lista completa para asegurar datos frescos
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
      
      // Recargar la lista completa para asegurar datos frescos
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

  // Buscar tenants
  const searchTenants = async (searchTerm: string) => {
    loading.value = true
    error.value = null
    
    try {
      if (searchTerm.trim()) {
        tenants.value = await tenantService.searchTenantsByName(searchTerm)
      } else {
        await loadTenants()
      }
    } catch (err: any) {
      error.value = err.message || 'Error al buscar tenants'
      console.error('Error searching tenants:', err)
    } finally {
      loading.value = false
    }
  }

  // Refrescar datos - método público para forzar actualización
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

    // Métodos
    loadTenants,
    loadTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    searchTenants,
    clearError,
    refreshTenants
  }
}
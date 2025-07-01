import { supabase } from '../lib/supabase'
import type { PaginationOptions, PaginatedResponse, PaginatedService } from '../composables/usePagination'

export interface Tenant {
  id?: string
  name: string
  created_at?: string
}

export interface CreateTenantData {
  name: string
}

export interface UpdateTenantData {
  name?: string
}

export class TenantService implements PaginatedService<Tenant> {
  private client = supabase

  constructor() {
    // No necesario ya que importamos directamente el cliente
  }

  // Obtener tenants con paginación (método requerido por la interfaz)
  async getPaginated(options: PaginationOptions): Promise<PaginatedResponse<Tenant>> {
    const { page, itemsPerPage, sortBy = 'created_at', sortOrder = 'desc', search } = options
    
    // Calcular offset para la paginación
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Construir query base
    let query = this.client
      .from('tenants')
      .select('*', { count: 'exact' })

    // Aplicar filtro de búsqueda si existe
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`)
    }

    // Aplicar ordenamiento
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Aplicar paginación
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const total = count || 0
    const totalPages = Math.ceil(total / itemsPerPage)

    return {
      data: data || [],
      total,
      page,
      itemsPerPage,
      totalPages
    }
  }

  // Obtener todos los tenants (mantener para compatibilidad)
  async getAllTenants(): Promise<Tenant[]> {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Obtener tenant por ID
  async getTenantById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      throw error
    }
    return data
  }

  // Crear nuevo tenant (método requerido por la interfaz)
  async create(tenantData: CreateTenantData): Promise<Tenant> {
    const { data, error } = await this.client
      .from('tenants')
      .insert({
        name: tenantData.name,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Actualizar tenant (método requerido por la interfaz)
  async update(id: string, tenantData: UpdateTenantData): Promise<Tenant> {
    const { data, error } = await this.client
      .from('tenants')
      .update(tenantData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Eliminar tenant (método requerido por la interfaz)
  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('tenants')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Buscar tenants por nombre
  async searchTenantsByName(name: string): Promise<Tenant[]> {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Verificar si existe un tenant con el mismo nombre
  async checkTenantNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.client
      .from('tenants')
      .select('id')
      .eq('name', name)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data?.length || 0) > 0
  }

  // Métodos legacy para compatibilidad hacia atrás
  async getTenantsPaginated(options: PaginationOptions): Promise<PaginatedResponse<Tenant>> {
    return this.getPaginated(options)
  }

  async createTenant(tenantData: CreateTenantData): Promise<Tenant> {
    return this.create(tenantData)
  }

  async updateTenant(id: string, tenantData: UpdateTenantData): Promise<Tenant> {
    return this.update(id, tenantData)
  }

  async deleteTenant(id: string): Promise<void> {
    return this.delete(id)
  }
}

// Exportar instancia singleton
export const tenantService = new TenantService()

// Para compatibilidad con el sistema de paginación genérico
export const tenantServicePaginated = {
  getPaginated: (options: PaginationOptions) => tenantService.getPaginated(options),
  create: async (data: CreateTenantData) => {
    const result = await tenantService.create(data)
    return result
  },
  update: async (id: string, data: UpdateTenantData) => {
    const result = await tenantService.update(id, data)
    return result
  },
  delete: async (id: string) => {
    await tenantService.delete(id)
    // No retornar nada para coincidir con Promise<void>
  }
}
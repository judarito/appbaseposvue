import { useSupabase } from '../composables/useSupabase'

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

export class TenantService {
  private supabase

  constructor() {
    const { supabase: client } = useSupabase()
    this.supabase = client
  }

  // Obtener todos los tenants
  async getAllTenants(): Promise<Tenant[]> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Obtener tenant por ID
  async getTenantById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
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

  // Crear nuevo tenant
  async createTenant(tenantData: CreateTenantData): Promise<Tenant> {
    const { data, error } = await this.supabase
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

  // Actualizar tenant
  async updateTenant(id: string, tenantData: UpdateTenantData): Promise<Tenant> {
    const { data, error } = await this.supabase
      .from('tenants')
      .update(tenantData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Eliminar tenant
  async deleteTenant(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tenants')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Buscar tenants por nombre
  async searchTenantsByName(name: string): Promise<Tenant[]> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Verificar si existe un tenant con el mismo nombre
  async checkTenantNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
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
}

// Exportar instancia singleton
export const tenantService = new TenantService()
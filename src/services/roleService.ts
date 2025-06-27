import { supabase } from '../lib/supabase'

export interface Role {
  id: string
  name: string
  description?: string
  permissions?: string[]
  created_at?: string
  updated_at?: string
}

export interface CreateRoleData {
  name: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
}

class RoleService {
  private readonly table = 'roles'

  // Obtener todos los roles
  async getAllRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw new Error('Error al obtener roles')
    }
  }

  // Obtener rol por ID
  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', roleId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching role:', error)
      throw new Error('Error al obtener rol')
    }
  }

  // Crear nuevo rol
  async createRole(roleData: CreateRoleData): Promise<Role> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .insert(roleData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating role:', error)
      throw new Error('Error al crear rol')
    }
  }

  // Actualizar rol
  async updateRole(roleId: string, roleData: UpdateRoleData): Promise<Role> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update(roleData)
        .eq('id', roleId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating role:', error)
      throw new Error('Error al actualizar rol')
    }
  }

  // Eliminar rol
  async deleteRole(roleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', roleId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      throw new Error('Error al eliminar rol')
    }
  }
}

// Instancia singleton del servicio
export const roleService = new RoleService()

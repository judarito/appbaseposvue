import { supabase } from '../lib/supabase'

export interface User {
  id: string // UUID del usuario de autenticación
  tenant_id: string // UUID del tenant asociado
  username: string // Username del usuario
  role_id: string // UUID del rol asociado
  created_at?: string
  updated_at?: string
}

export interface UserWithRelations extends User {
  tenant?: {
    id: string
    name: string
  }
  role?: {
    id: string
    name: string
    permissions?: string[]
  }
}

export interface CreateUserData {
  id: string // UUID del usuario de autenticación
  tenant_id: string
  username: string
  role_id: string
}

export interface UpdateUserData {
  tenant_id?: string
  username?: string
  role_id?: string
}

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

class UserService {
  private readonly table = 'users'

  // Obtener usuario por ID de autenticación
  async getUserById(authUserId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', authUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el usuario
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Error al obtener usuario')
    }
  }

  // Obtener usuario con información de tenant y rol
  async getUserWithRelations(authUserId: string): Promise<UserWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select(`
          *,
          tenant:tenants!tenant_id (
            id,
            name
          ),
          role:roles!role_id (
            id,
            name
          )
        `)
        .eq('id', authUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el usuario
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user with relations:', error)
      throw new Error('Error al obtener usuario con relaciones')
    }
  }

  // Obtener usuarios paginados (para administración)
  async getUsersPaginated(options: PaginationOptions): Promise<PaginatedResponse<UserWithRelations>> {
    try {
      const { page, itemsPerPage, sortBy = 'created_at', sortOrder = 'desc', search } = options
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      let query = supabase
        .from(this.table)
        .select(`
          *,
          tenant:tenants!tenant_id (
            id,
            name
          ),
          role:roles!role_id (
            id,
            name
          )
        `, { count: 'exact' })

      // Aplicar búsqueda si se proporciona
      if (search && search.trim()) {
        query = query.or(`username.ilike.%${search}%`)
      }

      // Aplicar ordenamiento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Aplicar paginación
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalPages = Math.ceil((count || 0) / itemsPerPage)

      return {
        data: data || [],
        total: count || 0,
        page,
        itemsPerPage,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching paginated users:', error)
      throw new Error('Error al obtener usuarios paginados')
    }
  }

  // Crear nuevo usuario
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .insert(userData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Error al crear usuario')
    }
  }

  // Actualizar usuario
  async updateUser(authUserId: string, userData: UpdateUserData): Promise<User> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update(userData)
        .eq('id', authUserId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Error al actualizar usuario')
    }
  }

  // Eliminar usuario
  async deleteUser(authUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', authUserId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Error al eliminar usuario')
    }
  }

  // Verificar si un usuario existe
  async userExists(authUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('id')
        .eq('id', authUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return false
        }
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking user existence:', error)
      return false
    }
  }

  // Obtener usuarios por tenant (para administradores de tenant)
  async getUsersByTenant(tenantId: string): Promise<UserWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select(`
          *,
          tenant:tenants!tenant_id (
            id,
            name
          ),
          role:roles!role_id (
            id,
            name
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching users by tenant:', error)
      throw new Error('Error al obtener usuarios del tenant')
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService()

// Para compatibilidad con el sistema de paginación genérico
export const userServicePaginated = {
  getPaginated: (options: PaginationOptions) => userService.getUsersPaginated(options),
  create: (data: CreateUserData) => userService.createUser(data),
  update: (id: string, data: UpdateUserData) => userService.updateUser(id, data),
  delete: (id: string) => userService.deleteUser(id)
}
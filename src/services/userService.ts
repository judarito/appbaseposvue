import { supabase } from '../lib/supabase'

export interface User {
  id: string // UUID del usuario de autenticación
  tenant_id: string // UUID del tenant asociado
  username: string // Username del usuario
  role_id: string // UUID del rol asociado
  email?: string // Email del usuario (para mostrar, no se almacena en users)
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
  email: string // Email para crear en Supabase Auth
  password: string // Password para crear en Supabase Auth
  username: string // Username para la tabla users
  tenant_id: string
  role_id: string
}

export interface UpdateUserData {
  username?: string
  tenant_id?: string
  role_id?: string
  email?: string // Para actualizar en Supabase Auth si es necesario
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

  // Crear nuevo usuario (crear en Auth + tabla users)
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // 1. Crear usuario en Supabase Auth
      console.log('🔐 Creando usuario en Supabase Auth...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username
          }
        }
      })

      if (authError) {
        console.error('❌ Error creando usuario en Auth:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('No se recibió información del usuario de Auth')
      }

      console.log('✅ Usuario creado en Auth:', authData.user.id)

      // 2. Crear registro en tabla users
      console.log('📝 Creando usuario en tabla users...')
      const userTableData = {
        id: authData.user.id,
        username: userData.username,
        tenant_id: userData.tenant_id,
        role_id: userData.role_id
      }

      const { data: userRecord, error: userError } = await supabase
        .from(this.table)
        .insert(userTableData)
        .select()
        .single()

      if (userError) {
        console.error('❌ Error creando usuario en tabla users:', userError)
        
        // Si falla la creación en la tabla, el usuario ya fue creado en Auth
        // pero no podemos eliminar la cuenta de Auth sin permisos admin
        console.warn('⚠️ Usuario creado en Auth pero falló la creación en tabla users')
        console.warn('⚠️ Considerar implementar un cleanup manual o usar RLS políticas')
        
        throw userError
      }

      console.log('✅ Usuario creado exitosamente en tabla users')
      return userRecord
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Error al crear usuario')
    }
  }

  // Actualizar usuario
  async updateUser(authUserId: string, userData: UpdateUserData): Promise<User> {
    try {
      console.log('✏️ Actualizando usuario:', authUserId)
      
      // 1. Actualizar en la tabla users (solo campos relevantes)
      const userTableData: any = {}
      if (userData.username !== undefined) userTableData.username = userData.username
      if (userData.tenant_id !== undefined) userTableData.tenant_id = userData.tenant_id
      if (userData.role_id !== undefined) userTableData.role_id = userData.role_id

      const { data: userRecord, error: userError } = await supabase
        .from(this.table)
        .update(userTableData)
        .eq('id', authUserId)
        .select()
        .single()

      if (userError) {
        console.error('❌ Error actualizando usuario en tabla users:', userError)
        throw userError
      }

      console.log('✅ Usuario actualizado en tabla users')

      // 2. Para actualizar en Auth (email, password), el usuario debe estar autenticado
      // Por ahora solo actualizamos la tabla users
      // Nota: La actualización de email/password en Auth requiere que el usuario esté autenticado
      // o permisos admin
      if (userData.email || userData.username) {
        console.log('ℹ️ Para actualizar email o metadata en Auth, el usuario debe hacerlo desde su sesión')
      }

      return userRecord
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Error al actualizar usuario')
    }
  }

  // Eliminar usuario (eliminar de tabla users + Auth)
  async deleteUser(authUserId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando usuario:', authUserId)
      
      // 1. Eliminar de la tabla users primero
      const { error: userError } = await supabase
        .from(this.table)
        .delete()
        .eq('id', authUserId)

      if (userError) {
        console.error('❌ Error eliminando usuario de tabla users:', userError)
        throw userError
      }

      console.log('✅ Usuario eliminado de tabla users')

      // 2. Para eliminar del servicio de Auth, necesitaríamos permisos admin
      // Por ahora solo eliminamos de la tabla users
      // Nota: La eliminación completa del usuario de Auth requiere permisos admin
      // o que el usuario elimine su propia cuenta
      console.log('ℹ️ Usuario eliminado de tabla users. La cuenta de Auth permanece activa.')
      
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

  // Obtener lista de tenants para dropdown
  async getTenantsList(): Promise<Array<{ id: string, name: string }>> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching tenants list:', error)
      throw new Error('Error al obtener lista de tenants')
    }
  }

  // Obtener lista de roles para dropdown
  async getRolesList(): Promise<Array<{ id: string, name: string }>> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching roles list:', error)
      throw new Error('Error al obtener lista de roles')
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService()

// Para compatibilidad con el sistema de paginación genérico
export const userServicePaginated = {
  getPaginated: (options: PaginationOptions) => userService.getUsersPaginated(options),
  create: async (data: CreateUserData) => {
    const result = await userService.createUser(data)
    return result
  },
  update: async (id: string, data: UpdateUserData) => {
    const result = await userService.updateUser(id, data)
    return result
  },
  delete: async (id: string) => {
    await userService.deleteUser(id)
    // No retornar nada para coincidir con Promise<void>
  }
}
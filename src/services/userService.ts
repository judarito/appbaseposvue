import { useSupabase } from '../composables/useSupabase'

interface User {
  id?: string
  email: string
  name: string
  created_at?: string
  updated_at?: string
}

export class UserService {
  private supabase

  constructor() {
    const { supabase: client } = useSupabase()
    this.supabase = client
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Obtener usuario por ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Crear nuevo usuario
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Actualizar usuario
  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Eliminar usuario
  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Buscar usuarios por email
  async searchUsersByEmail(email: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .ilike('email', `%${email}%`)

    if (error) throw error
    return data || []
  }
}

// Exportar instancia singleton
export const userService = new UserService()
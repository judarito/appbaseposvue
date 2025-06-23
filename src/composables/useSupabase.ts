import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Estado global del usuario
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)

export function useSupabase() {
  // Estado de autenticación
  const isAuthenticated = computed(() => !!user.value)

  // Inicializar autenticación
  const initAuth = async () => {
    loading.value = true
    
    try {
      // Obtener sesión actual
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      session.value = currentSession
      user.value = currentSession?.user ?? null
      
      // Escuchar cambios de autenticación
      supabase.auth.onAuthStateChange((event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
        
        console.log('Auth state changed:', event, user.value?.email)
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Iniciar sesión con email y contraseña
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  // Registrarse con email y contraseña
  const signUp = async (email: string, password: string, metadata?: object) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  }

  // Cerrar sesión
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    user.value = null
    session.value = null
  }

  // Obtener datos de una tabla
  const select = async (table: string, columns = '*', filters?: object) => {
    let query = supabase.from(table).select(columns)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Insertar datos en una tabla
  const insert = async (table: string, data: object | object[]) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    
    if (error) throw error
    return result
  }

  // Actualizar datos en una tabla
  const update = async (table: string, data: object, filters: object) => {
    let query = supabase.from(table).update(data)
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data: result, error } = await query.select()
    if (error) throw error
    return result
  }

  // Eliminar datos de una tabla
  const remove = async (table: string, filters: object) => {
    let query = supabase.from(table).delete()
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { error } = await query
    if (error) throw error
  }

  return {
    // Estado
    user: computed(() => user.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    
    // Métodos de autenticación
    initAuth,
    signIn,
    signUp,
    signOut,
    
    // Métodos de base de datos
    select,
    insert,
    update,
    remove,
    
    // Cliente directo para casos avanzados
    supabase
  }
}
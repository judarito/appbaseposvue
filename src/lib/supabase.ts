import { createClient } from '@supabase/supabase-js'

// Verificar que las variables de entorno estén definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key are required. Please check your .env file.'
  )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de datos para TypeScript
export type Database = {
  // Aquí puedes definir los tipos de tu base de datos
  // Por ejemplo:
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          updated_at?: string
        }
      }
    }
  }
}
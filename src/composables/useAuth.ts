import { ref, computed } from 'vue'
import { userService, type UserWithRelations } from '../services/userService'
import { useSupabase } from './useSupabase'

// Estado global del usuario autenticado
const currentUser = ref<UserWithRelations | null>(null)
const userLoading = ref(false)
const userError = ref<string | null>(null)

export function useAuth() {
  const { supabase, user: authUser } = useSupabase()

  // Computed para verificar si el usuario está autenticado
  const isAuthenticated = computed(() => !!authUser.value)
  
  // Computed para obtener la información del usuario actual
  const user = computed(() => currentUser.value)
  
  // Computed para obtener información del tenant actual
  const currentTenant = computed(() => currentUser.value?.tenant || null)
  
  // Computed para obtener información del rol actual
  const currentRole = computed(() => currentUser.value?.role || null)
  
  // Computed para verificar si el usuario tiene un rol específico
  const hasRole = computed(() => (roleName: string) => {
    return currentRole.value?.name === roleName
  })

  // Función para cargar la información del usuario después del login
  const loadUserInfo = async (authUserId: string) => {
    userLoading.value = true
    userError.value = null

    try {
      console.log('🔍 Cargando información del usuario:', authUserId)
      
      const userData = await userService.getUserWithRelations(authUserId)
      
      if (userData) {
        currentUser.value = userData
        console.log('✅ Información del usuario cargada:', {
          username: userData.username,
          tenant: userData.tenant?.name,
          role: userData.role?.name
        })
        
        // Guardar información básica en localStorage para persistencia
        localStorage.setItem('userInfo', JSON.stringify({
          id: userData.id,
          username: userData.username,
          tenant_id: userData.tenant_id,
          role_id: userData.role_id,
          tenant: userData.tenant,
          role: userData.role
        }))
      } else {
        console.warn('⚠️ Usuario no encontrado en la tabla users:', authUserId)
        userError.value = 'Usuario no encontrado en el sistema'
        currentUser.value = null
      }
    } catch (error: any) {
      console.error('❌ Error cargando información del usuario:', error)
      userError.value = error.message || 'Error al cargar información del usuario'
      currentUser.value = null
    } finally {
      userLoading.value = false
    }
  }

  // Función para restaurar información del usuario desde localStorage
  const restoreUserInfo = () => {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      try {
        const userData = JSON.parse(savedUserInfo)
        currentUser.value = userData
        console.log('🔄 Información del usuario restaurada desde localStorage')
        return true
      } catch (error) {
        console.error('Error restaurando información del usuario:', error)
        localStorage.removeItem('userInfo')
      }
    }
    return false
  }

  // Función para actualizar la información del usuario
  const updateUserInfo = async () => {
    if (!authUser.value?.id) return

    await loadUserInfo(authUser.value.id)
  }

  // Función para limpiar la información del usuario (logout)
  const clearUserInfo = () => {
    currentUser.value = null
    userError.value = null
    localStorage.removeItem('userInfo')
    console.log('🧹 Información del usuario limpiada')
  }

  // Función para hacer login
  const login = async (email: string, password: string) => {
    try {
      userError.value = null
      
      // Hacer login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      if (data.user) {
        console.log('🔐 Login exitoso con Supabase Auth')
        
        // Cargar información del usuario desde la tabla users
        await loadUserInfo(data.user.id)
        
        return { success: true, user: data.user }
      }

      throw new Error('No se recibió información del usuario')
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      userError.value = error.message || 'Error al iniciar sesión'
      throw error
    }
  }

  // Función para hacer logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      clearUserInfo()
      console.log('👋 Logout exitoso')
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Error en logout:', error)
      throw error
    }
  }

  // Función para verificar permisos (si se implementan en el futuro)
  const hasPermission = (permission: string): boolean => {
    if (!currentRole.value?.permissions) return false
    return currentRole.value.permissions.includes(permission)
  }

  // Función para verificar si es SUPERADMIN
  const isSuperAdmin = computed(() => {
    return hasRole.value('SUPERADMIN')
  })

  // Función para verificar si es administrador del sistema
  const isSystemAdmin = computed(() => {
    return hasRole.value('admin') || hasRole.value('super_admin') || isSuperAdmin.value
  })

  // Función para verificar si es administrador del tenant
  const isTenantAdmin = computed(() => {
    return hasRole.value('tenant_admin') || isSystemAdmin.value
  })

  return {
    // Estado
    user,
    currentTenant,
    currentRole,
    userLoading,
    userError,
    isAuthenticated,

    // Computed
    hasRole,
    isSuperAdmin,
    isSystemAdmin,
    isTenantAdmin,

    // Métodos
    loadUserInfo,
    restoreUserInfo,
    updateUserInfo,
    clearUserInfo,
    login,
    logout,
    hasPermission
  }
}

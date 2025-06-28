import { ref, computed, watch } from 'vue'
import { userService, type UserWithRelations } from '../services/userService'
import { useSupabase } from './useSupabase'

// Estado global del usuario autenticado
const currentUser = ref<UserWithRelations | null>(null)
const userLoading = ref(false)
const userError = ref<string | null>(null)

export function useAuth() {
  const { supabase, user: authUser, isAuthenticated } = useSupabase()

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

  // Watcher para sincronizar con cambios en la autenticación de Supabase
  watch(authUser, async (newAuthUser) => {
    if (newAuthUser && !currentUser.value) {
      // Usuario autenticado pero sin información cargada, intentar cargar
      console.log('🔄 Usuario autenticado detectado, cargando información...')
      await loadUserInfo(newAuthUser.id)
    } else if (!newAuthUser) {
      // Usuario no autenticado, limpiar información
      console.log('🧹 Usuario no autenticado, limpiando información...')
      clearUserInfo()
    }
  }, { immediate: true })

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
  const restoreUserInfo = async () => {
    // Si ya hay información del usuario cargada, no hacer nada
    if (currentUser.value) {
      console.log('ℹ️ Información del usuario ya está cargada')
      return true
    }

    // Si no hay usuario autenticado, no intentar restaurar
    if (!authUser.value) {
      console.log('ℹ️ No hay usuario autenticado, no se puede restaurar información')
      return false
    }

    console.log('🔄 Intentando restaurar información del usuario...')
    
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      try {
        const userData = JSON.parse(savedUserInfo)
        
        // Verificar que el usuario guardado coincida con el autenticado
        if (userData.id === authUser.value.id) {
          currentUser.value = userData
          console.log('✅ Información del usuario restaurada desde localStorage:', {
            username: userData.username,
            tenant: userData.tenant?.name,
            role: userData.role?.name
          })
          return true
        } else {
          console.warn('⚠️ Usuario en localStorage no coincide con el autenticado')
          localStorage.removeItem('userInfo')
        }
      } catch (error) {
        console.error('❌ Error restaurando información del usuario:', error)
        localStorage.removeItem('userInfo')
      }
    }

    // Si no se pudo restaurar desde localStorage, cargar desde la base de datos
    console.log('📡 Cargando información del usuario desde la base de datos...')
    await loadUserInfo(authUser.value.id)
    return !!currentUser.value
  }

  // Función para actualizar la información del usuario
  const updateUserInfo = async () => {
    if (!authUser.value?.id) return

    await loadUserInfo(authUser.value.id)
  }

  // Función para limpiar la información del usuario (logout)
  const clearUserInfo = () => {
    console.log('🧹 Limpiando información del usuario...')
    
    // Limpiar estado reactivo
    currentUser.value = null
    userError.value = null
    userLoading.value = false
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('userInfo')
      console.log('✅ localStorage limpiado')
    } catch (error) {
      console.warn('⚠️ Error limpiando localStorage:', error)
    }
    
    console.log('✅ Información del usuario limpiada completamente')
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
      console.log('👋 Iniciando logout...')
      
      // Intentar cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.warn('⚠️ Error en logout de Supabase:', error.message)
        
        // Si el error es sobre sesión inexistente, solo limpiar localmente
        if (error.message.includes('session_id claim') || 
            error.message.includes('does not exist') ||
            error.message.includes('JWT')) {
          console.log('🔄 Sesión ya inválida en servidor, limpiando datos locales...')
        } else {
          // Para otros errores, relanzar la excepción
          throw error
        }
      }

      // Siempre limpiar información local
      clearUserInfo()
      console.log('✅ Logout completado (datos locales limpiados)')
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Error en logout:', error)
      
      // En caso de error crítico, aún así limpiar datos locales
      console.log('🧹 Limpiando datos locales a pesar del error...')
      clearUserInfo()
      
      // No relanzar el error para evitar que la UI se bloquee
      console.warn('⚠️ Logout completado con advertencias')
      return { success: true, warning: error.message }
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

  // Función para forzar logout completo (en caso de errores de sesión)
  const forceLogout = () => {
    console.log('💥 Forzando logout completo...')
    
    // Limpiar todo el estado local
    clearUserInfo()
    
    // Intentar limpiar localStorage adicional relacionado con Supabase
    try {
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || 
        key.includes('supabase') ||
        key === 'userInfo'
      )
      
      supabaseKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🗑️ Removido: ${key}`)
      })
    } catch (error) {
      console.warn('⚠️ Error limpiando localStorage completo:', error)
    }
    
    console.log('✅ Logout forzado completado')
  }

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
    forceLogout,
    login,
    logout,
    hasPermission
  }
}

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
import { useAuth } from '../composables/useAuth'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { user, loading } = useSupabase()

  // Esperar a que termine de cargar la autenticación
  if (loading.value) {
    // Pequeña espera para que se complete la inicialización
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const isAuthenticated = !!user.value
  const isLoginPage = to.name === 'Login'

  if (!isAuthenticated && !isLoginPage) {
    // Usuario no autenticado intentando acceder a página protegida
    next({ name: 'Login' })
  } else if (isAuthenticated && isLoginPage) {
    // Usuario autenticado intentando acceder a login
    next({ name: 'Dashboard' })
  } else if (isAuthenticated && to.meta.requiresRole) {
    // Verificar roles específicos
    await checkRolePermission(to, next)
  } else {
    // Todo OK
    next()
  }
}

// Guard para verificar permisos de roles
const checkRolePermission = async (
  to: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { user, isSuperAdmin, hasRole, userLoading } = useAuth()

  // Esperar a que se cargue la información del usuario si está cargando
  if (userLoading.value) {
    // Esperar hasta que termine de cargar
    let attempts = 0
    while (userLoading.value && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  // Si no hay información del usuario, intentar restaurarla
  if (!user.value) {
    console.warn('No hay información de usuario disponible para verificar roles')
    next({ name: 'Dashboard' })
    return
  }

  const requiredRole = to.meta.requiresRole as string

  let hasPermission = false

  switch (requiredRole) {
    case 'SUPERADMIN':
      hasPermission = isSuperAdmin.value
      break
    case 'ADMIN':
      hasPermission = hasRole.value('ADMIN') || isSuperAdmin.value
      break
    case 'TENANT_ADMIN':
      hasPermission = hasRole.value('TENANT_ADMIN') || hasRole.value('ADMIN') || isSuperAdmin.value
      break
    default:
      hasPermission = hasRole.value(requiredRole)
  }

  if (hasPermission) {
    next()
  } else {
    console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}`)
    // Redirigir al dashboard con mensaje de error
    next({ 
      name: 'Dashboard', 
      query: { error: 'insufficient_permissions' }
    })
  }
}
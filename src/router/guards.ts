import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

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
  } else {
    // Todo OK
    next()
  }
}
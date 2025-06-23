import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import LoginForm from '../components/LoginForm.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Products from '../views/Products.vue'
import Reports from '../views/Reports.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Aplicar guard de autenticación a todas las rutas
router.beforeEach(authGuard)

export default router
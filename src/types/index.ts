// This file exports TypeScript types and interfaces used throughout the application.

export interface MenuItem {
  title: string
  icon: string
  route: string // Hacer que route sea requerido
  requiredRole?: string // Rol requerido para mostrar el item
}

export interface User {
  name: string
  email: string
  avatar?: string
}

export interface DashboardStat {
  title: string
  value: string
  icon: string
  route: string
  requiredRole?: string // Rol requerido para mostrar la estadística
}

// Roles disponibles en el sistema
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  USER = 'USER'
}
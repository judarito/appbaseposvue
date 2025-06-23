// This file exports TypeScript types and interfaces used throughout the application.

export interface MenuItem {
  title: string
  icon: string
  route?: string
}

export interface User {
  name: string
  email: string
  avatar?: string
}
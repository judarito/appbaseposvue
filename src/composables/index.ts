// src/composables/index.ts

// This file exports reusable composition functions that can be used across components.
export function useExample() {
  return {
    message: 'Hello from composable!'
  }
}

// Exportar el nuevo composable de tema
export { useAppTheme } from './useTheme'
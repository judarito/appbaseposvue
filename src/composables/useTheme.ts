import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const isDarkMode = ref(false)

export function useAppTheme() {
  const theme = useTheme()

  // Computed para el tema actual
  const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light')

  // Función para alternar tema
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    theme.global.name.value = currentTheme.value
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', currentTheme.value)
  }

  // Función para establecer tema
  const setTheme = (themeName: 'light' | 'dark') => {
    isDarkMode.value = themeName === 'dark'
    theme.global.name.value = themeName
    localStorage.setItem('theme', themeName)
  }

  // Función para inicializar tema desde localStorage
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }

  return {
    isDarkMode: computed(() => isDarkMode.value),
    currentTheme,
    toggleTheme,
    setTheme,
    initTheme
  }
}
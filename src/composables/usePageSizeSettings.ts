import { ref, computed } from 'vue'

// Estado global de configuración de paginación
const defaultPageSize = ref(10)
let isInitialized = false

export function usePageSizeSettings() {
  // Auto-inicializar la primera vez que se use el composable
  if (!isInitialized) {
    // Limpiar cualquier valor conflictivo (solo si existe "pageSize" sin "default")
    const oldPageSize = localStorage.getItem('pageSize')
    if (oldPageSize && !localStorage.getItem('defaultPageSize')) {
      localStorage.setItem('defaultPageSize', oldPageSize)
      localStorage.removeItem('pageSize')
      console.log(`🔄 Migrado "pageSize" a "defaultPageSize": ${oldPageSize}`)
    }
    
    // Cargar tamaño por defecto
    const savedDefaultSize = localStorage.getItem('defaultPageSize')
    if (savedDefaultSize) {
      defaultPageSize.value = parseInt(savedDefaultSize, 10)
      console.log(`📊 Tamaño de página por defecto cargado: ${defaultPageSize.value}`)
    } else {
      console.log(`📊 Usando tamaño de página por defecto: ${defaultPageSize.value}`)
    }
    
    isInitialized = true
  }
  
  // Computed para el tamaño de página actual
  const currentDefaultPageSize = computed(() => defaultPageSize.value)

  // Opciones disponibles de tamaño de página
  const pageSizeOptions = [5, 10, 15, 20, 25, 50, 100]

  // Función para establecer el tamaño de página por defecto
  const setDefaultPageSize = (size: number) => {
    defaultPageSize.value = size
    localStorage.setItem('defaultPageSize', size.toString())
    
    // Emitir evento personalizado para otros componentes
    window.dispatchEvent(new CustomEvent('page-size-changed', { 
      detail: { pageSize: size }
    }))
  }

  // Función para obtener tamaño de página (siempre retorna el por defecto)
  const getPageSizeForView = (viewName: string): number => {
    return defaultPageSize.value
  }

  // Función para establecer tamaño de página por vista (redirige al por defecto)
  const setPageSizeForView = (viewName: string, size: number) => {
    setDefaultPageSize(size)
  }

  // Función para inicializar configuraciones desde localStorage (para uso manual)
  const initPageSizeSettings = () => {
    // Esta función ahora es redundante ya que la inicialización es automática
    // Se mantiene por compatibilidad
  }

  // Función para resetear configuraciones
  const resetPageSizeSettings = () => {
    defaultPageSize.value = 10
    
    // Limpiar todas las llaves posibles de localStorage
    localStorage.removeItem('defaultPageSize')
    localStorage.removeItem('pageSizes') // Limpiar legacy
    localStorage.removeItem('pageSize') // Por si hay valores legacy
    
    console.log('🧹 Configuraciones de paginación reseteadas')
    
    // Emitir evento de reset
    window.dispatchEvent(new CustomEvent('page-size-reset', { 
      detail: { pageSize: 10 }
    }))
  }

  // Función para obtener estadísticas de uso (simplificada)
  const getPageSizeStats = () => {
    return {
      defaultSize: defaultPageSize.value,
      customViewsCount: 0, // Ya no hay vistas personalizadas
      mostUsedSize: defaultPageSize.value,
      savedViews: {}
    }
  }

  // Función de debug para inspeccionar localStorage
  const debugLocalStorage = () => {
    console.log('🔍 Debug localStorage:')
    console.log('  - defaultPageSize:', localStorage.getItem('defaultPageSize'))
    console.log('  - pageSizes (legacy):', localStorage.getItem('pageSizes'))
    console.log('  - pageSize (legacy):', localStorage.getItem('pageSize'))
    console.log('  - Estado actual defaultPageSize.value:', defaultPageSize.value)
  }

  return {
    // Estado
    currentDefaultPageSize,
    pageSizeOptions,

    // Métodos
    setDefaultPageSize,
    setPageSizeForView,
    getPageSizeForView,
    initPageSizeSettings,
    resetPageSizeSettings,
    getPageSizeStats,
    debugLocalStorage
  }
}

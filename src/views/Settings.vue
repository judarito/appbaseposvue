<template>
  <div class="pa-4">
    <h1 class="text-h4 mb-4">Configuración</h1>
    
    <v-row>
      <!-- Card de configuración de tema -->
      <v-col cols="12" md="6">
        <v-card :theme="currentTheme" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-palette</v-icon>
            Tema de la Aplicación
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <v-switch
                :model-value="isDarkMode"
                @update:model-value="handleThemeToggle"
                label="Modo Oscuro"
                color="primary"
                hide-details
              >
                <template v-slot:prepend>
                  <v-icon :color="isDarkMode ? 'orange' : 'grey'">
                    {{ isDarkMode ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
                  </v-icon>
                </template>
              </v-switch>
            </div>
            
            <v-divider class="my-4" />
            
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-1 mb-1">
                  <strong>Tema actual:</strong> 
                  <v-chip 
                    :color="isDarkMode ? 'blue' : 'orange'"
                    size="small"
                    class="ml-2"
                  >
                    {{ currentTheme === 'dark' ? 'Oscuro' : 'Claro' }}
                  </v-chip>
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  {{ isDarkMode ? 'Modo oscuro activado para reducir la fatiga visual' : 'Modo claro activado para mejor visibilidad' }}
                </p>
              </div>
            </div>
            
            <v-divider class="my-4" />
            
            <!-- Botones de acción rápida -->
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                size="small"
                @click="setLightTheme"
                :disabled="!isDarkMode"
                prepend-icon="mdi-weather-sunny"
              >
                Modo Claro
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                @click="setDarkTheme"
                :disabled="isDarkMode"
                prepend-icon="mdi-weather-night"
              >
                Modo Oscuro
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Card de configuración de paginación -->
      <v-col cols="12" md="6">
        <v-card :theme="currentTheme" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-table</v-icon>
            Configuración de Paginación
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <p class="text-body-1 mb-3">
                <strong>Tamaño de página por defecto:</strong>
              </p>
              <v-select
                :model-value="currentDefaultPageSize"
                :items="pageSizeOptions"
                label="Elementos por página"
                variant="outlined"
                @update:model-value="handlePageSizeChange"
                density="compact"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :title="`${item.value} elementos`" />
                </template>
              </v-select>
            </div>
            
            <v-divider class="my-4" />
            
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-1 mb-1">
                  <strong>Configuración actual:</strong> 
                  <v-chip 
                    :color="currentDefaultPageSize <= 10 ? 'success' : currentDefaultPageSize <= 25 ? 'warning' : 'error'"
                    size="small"
                    class="ml-2"
                  >
                    {{ currentDefaultPageSize }} elementos
                  </v-chip>
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  {{ getPageSizeDescription() }}
                </p>
              </div>
            </div>
            
            <v-divider class="my-4" />
            
            <!-- Estadísticas de uso -->
            <div class="mb-4">
              <p class="text-body-1 mb-2"><strong>Configuración actual:</strong></p>
              <v-row dense>
                <v-col cols="12">
                  <v-chip color="primary" variant="tonal" size="small" block>
                    <v-icon start>mdi-cog</v-icon>
                    Tamaño por defecto: {{ pageSizeStats.defaultSize }} elementos
                  </v-chip>
                </v-col>
              </v-row>
            </div>
            
            <!-- Botones de acción rápida -->
            <div class="d-flex gap-2 mb-3">
              <v-btn
                variant="outlined"
                size="small"
                @click="setQuickPageSize(10)"
                :color="currentDefaultPageSize === 10 ? 'primary' : 'default'"
                prepend-icon="mdi-speedometer-slow"
              >
                Rápido (10)
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                @click="setQuickPageSize(25)"
                :color="currentDefaultPageSize === 25 ? 'primary' : 'default'"
                prepend-icon="mdi-speedometer-medium"
              >
                Medio (25)
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                @click="setQuickPageSize(50)"
                :color="currentDefaultPageSize === 50 ? 'primary' : 'default'"
                prepend-icon="mdi-speedometer"
              >
                Alto (50)
              </v-btn>
            </div>

            <!-- Botón de resetear -->
            <div class="d-flex justify-end">
              <v-btn
                variant="outlined"
                color="error"
                size="small"
                @click="resetPaginationSettings"
                prepend-icon="mdi-refresh"
              >
                Restablecer Paginación
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Card de información del sistema -->
      <v-col cols="12" md="6">
        <v-card :theme="currentTheme" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            Información del Sistema
          </v-card-title>
          <v-card-text>
            <v-list lines="two" :theme="currentTheme">
              <v-list-item>
                <v-list-item-title>Versión de la App</v-list-item-title>
                <v-list-item-subtitle>v1.0.0</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Framework</v-list-item-title>
                <v-list-item-subtitle>Vue 3 + Vuetify</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Tema Guardado</v-list-item-title>
                <v-list-item-subtitle>
                  {{ savedThemePreference || 'No guardado' }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Detección Automática</v-list-item-title>
                <v-list-item-subtitle>
                  {{ systemPrefersDark ? 'Sistema prefiere modo oscuro' : 'Sistema prefiere modo claro' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Card de configuraciones adicionales -->
      <v-col cols="12">
        <v-card :theme="currentTheme" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-cog</v-icon>
            Otras Configuraciones
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="autoSaveTheme"
                  label="Guardar tema automáticamente"
                  color="primary"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="followSystemTheme"
                  label="Seguir tema del sistema"
                  color="primary"
                  hide-details
                  @update:model-value="handleSystemThemeToggle"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  variant="outlined"
                  color="error"
                  @click="resetThemeSettings"
                  prepend-icon="mdi-refresh"
                >
                  Restablecer
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppTheme } from '../composables/useTheme'
import { usePageSizeSettings } from '../composables/usePageSizeSettings'

// Usar el composable del tema
const { isDarkMode, currentTheme, toggleTheme, setTheme } = useAppTheme()

// Usar el composable de configuración de paginación
const { 
  currentDefaultPageSize, 
  pageSizeOptions, 
  setDefaultPageSize, 
  resetPageSizeSettings,
  getPageSizeStats
} = usePageSizeSettings()

// Estados locales
const autoSaveTheme = ref(true)
const followSystemTheme = ref(false)

// Estados para paginación
const pageSizeStats = ref({
  defaultSize: 10,
  customViewsCount: 0,
  mostUsedSize: 10,
  savedViews: {}
})

// Información del sistema
const systemPrefersDark = ref(false)
const savedThemePreference = ref<string | null>(null)

// Manejar toggle del tema
const handleThemeToggle = (value: boolean) => {
  if (value !== isDarkMode.value) {
    toggleTheme()
  }
}

// Establecer tema claro
const setLightTheme = () => {
  setTheme('light')
}

// Establecer tema oscuro
const setDarkTheme = () => {
  setTheme('dark')
}

// Manejar toggle de seguir tema del sistema
const handleSystemThemeToggle = (value: boolean) => {
  if (value) {
    // Aplicar tema del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
    
    // Escuchar cambios en el tema del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (followSystemTheme.value) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
}

// Restablecer configuraciones de tema
const resetThemeSettings = () => {
  // Remover preferencia guardada
  localStorage.removeItem('theme')
  
  // Restablecer a valores por defecto
  followSystemTheme.value = false
  autoSaveTheme.value = true
  
  // Aplicar tema por defecto (claro)
  setTheme('light')
  
  // Actualizar información
  loadThemeInfo()
}

// Cargar información del tema
const loadThemeInfo = () => {
  systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  savedThemePreference.value = localStorage.getItem('theme')
}

// Manejar cambio de tamaño de página
const handlePageSizeChange = (newSize: number) => {
  setDefaultPageSize(newSize)
  updatePageSizeStats()
}

// Establecer tamaño de página rápido
const setQuickPageSize = (size: number) => {
  setDefaultPageSize(size)
  updatePageSizeStats()
}

// Obtener descripción del tamaño de página
const getPageSizeDescription = () => {
  const size = currentDefaultPageSize.value
  if (size <= 10) return 'Ideal para conexiones lentas y navegación rápida'
  if (size <= 25) return 'Balance entre rendimiento y cantidad de datos'
  if (size <= 50) return 'Más datos por página, ideal para análisis'
  return 'Máximo rendimiento para usuarios avanzados'
}

// Actualizar estadísticas de paginación
const updatePageSizeStats = () => {
  pageSizeStats.value = getPageSizeStats()
}

// Restablecer configuraciones de paginación
const resetPaginationSettings = () => {
  resetPageSizeSettings()
  updatePageSizeStats()
}

// Inicializar al montar el componente
onMounted(() => {
  loadThemeInfo()
  updatePageSizeStats()
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-chip {
  font-weight: 500;
}

.gap-2 {
  gap: 8px;
}
</style>
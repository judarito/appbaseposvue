<template>
  <v-card>
    <v-card-title>Configuración de Tema</v-card-title>
    <v-card-text>
      <v-switch
        v-model="isDarkMode"
        @change="handleThemeChange"
        label="Modo Oscuro"
        color="primary"
      />
      <v-divider class="my-4" />
      <p class="text-body-2">
        Tema actual: <strong>{{ currentTheme }}</strong>
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useAppTheme } from '../composables/useTheme'

const { isDarkMode, currentTheme, setTheme } = useAppTheme()

const handleThemeChange = (value: boolean) => {
  setTheme(value ? 'dark' : 'light')
}
</script>
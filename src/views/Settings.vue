<template>
  <div class="pa-4">
    <h1 class="text-h4 mb-4">Configuración</h1>
    <v-card>
      <v-card-text>
        <p>Configuración del Sistema</p>
        <div class="mt-4">
          <ThemeSettings />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import ThemeSettings from '../components/ThemeSettings.vue'
</script>
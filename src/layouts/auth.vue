<template>
  <v-app :theme="currentTheme" class="auth-layout">
    <v-main class="auth-main">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppTheme } from '../composables/useTheme'

const { initTheme, currentTheme } = useAppTheme()

onMounted(() => {
  initTheme()
})
</script>

<style scoped>
.auth-main {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 0 !important; /* Sobrescribir cualquier padding global */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
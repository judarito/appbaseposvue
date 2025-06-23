<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title class="text-h5">
      {{ title }}
    </v-card-title>
    <v-card-text>
      <p>{{ message }}</p>
      <v-btn color="primary" @click="incrementCounter">
        Contador: {{ counter }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Hello World',
  message: 'Componente Vue 3 con Vuetify'
})

const counter = ref(0)

const incrementCounter = () => {
  counter.value++
}
</script>
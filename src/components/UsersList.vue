<template>
  <v-card>
    <v-card-title>Lista de Usuarios</v-card-title>
    <v-card-text>
      <v-progress-linear v-if="loading" indeterminate />
      
      <v-list v-else>
        <v-list-item
          v-for="user in users"
          :key="user.id"
          :title="user.name"
          :subtitle="user.email"
        />
      </v-list>
      
      <v-btn @click="loadUsers" color="primary" class="mt-4">
        Recargar Usuarios
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { select } = useSupabase()

const users = ref([])
const loading = ref(false)

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await select('users', '*')
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
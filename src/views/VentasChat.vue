<template>
  <div class="pa-2 pa-sm-4">
    <h1 class="text-h5 text-sm-h4 mb-4">Ventas Chat</h1>
    
    <!-- Estadísticas rápidas -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
        <v-card elevation="2" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar :color="stat.color" size="40" class="mr-3">
                <v-icon :icon="stat.icon" color="white" />
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ stat.title }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lista de ventas -->
    <VentasChatList ref="ventasChatListRef" @estado-changed="loadStats" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ventasChatService } from '../services/ventasChatService'
import VentasChatList from '../components/VentasChatList.vue'

// Estado para estadísticas
const stats = ref([
  { title: 'Total Ventas', value: '0', icon: 'mdi-cart', color: 'primary' },
  { title: 'Por Pagar', value: '0', icon: 'mdi-clock-outline', color: 'error' },
  { title: 'Pagadas', value: '0', icon: 'mdi-check-circle', color: 'success' },
  { title: 'Total Neto', value: '$0.00', icon: 'mdi-currency-usd', color: 'info' }
])

const ventasChatListRef = ref()

// Cargar estadísticas
const loadStats = async () => {
  try {
    const statsData = await ventasChatService.getVentasStats()
    
    stats.value = [
      { 
        title: 'Total Ventas', 
        value: statsData.totalVentas.toString(), 
        icon: 'mdi-cart', 
        color: 'primary' 
      },
      { 
        title: 'Por Pagar', 
        value: statsData.ventasPorPagar.toString(), 
        icon: 'mdi-clock-outline', 
        color: 'error' 
      },
      { 
        title: 'Pagadas', 
        value: statsData.ventasPagadas.toString(), 
        icon: 'mdi-check-circle', 
        color: 'success' 
      },
      { 
        title: 'Total Neto', 
        value: `$${statsData.totalNeto.toFixed(2)}`, 
        icon: 'mdi-currency-usd', 
        color: 'info' 
      }
    ]
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Cargar estadísticas al montar
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>

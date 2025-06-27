<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="8" class="login-card">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="64" color="primary" class="mb-4">mdi-account-circle</v-icon>
              <h2 class="text-h4">Iniciar Sesión</h2>
              <p class="text-subtitle-1 text-medium-emphasis">Accede a tu cuenta</p>
            </div>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="formRef">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                :rules="emailRules"
                :error-messages="emailError"
                class="mb-4"
                required
              />

              <v-text-field
                v-model="password"
                :label="isSignUp ? 'Contraseña (mín. 6 caracteres)' : 'Contraseña'"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                :rules="passwordRules"
                :error-messages="passwordError"
                class="mb-4"
                required
              />

              <v-text-field
                v-if="isSignUp"
                v-model="confirmPassword"
                label="Confirmar Contraseña"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="outlined"
                :rules="confirmPasswordRules"
                class="mb-4"
                required
              />

              <v-text-field
                v-if="isSignUp"
                v-model="fullName"
                label="Nombre Completo"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :rules="nameRules"
                class="mb-4"
                required
              />

              <!-- Mensaje de error -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- Mensaje de éxito -->
              <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="successMessage = ''"
              >
                {{ successMessage }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-4"
              >
                {{ isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión' }}
              </v-btn>

              <v-divider class="mb-4" />

              <v-btn
                variant="text"
                block
                @click="toggleMode"
                :disabled="loading"
              >
                {{ isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const { signUp } = useSupabase() // Solo para registro
const { login, userLoading } = useAuth() // Para login con carga de usuario

// Estado del formulario
const formRef = ref()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSignUp = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailError = ref('')
const passwordError = ref('')

// Usar loading del auth para login, y loading local para registro
const loading = computed(() => isSignUp.value ? false : userLoading.value)

// Reglas de validación
const emailRules = [
  (v: string) => !!v || 'El email es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Email debe ser válido'
]

const passwordRules = computed(() => [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
])

const confirmPasswordRules = computed(() => [
  (v: string) => !!v || 'Confirmar contraseña es requerido',
  (v: string) => v === password.value || 'Las contraseñas no coinciden'
])

const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
]

// Alternar entre login y registro
const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  clearMessages()
  clearForm()
}

// Limpiar mensajes
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
}

// Limpiar formulario
const clearForm = () => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  fullName.value = ''
}

// Manejar login/registro
const handleLogin = async () => {
  clearMessages()

  // Validar formulario
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    if (isSignUp.value) {
      // Registro
      await signUp(email.value, password.value, {
        full_name: fullName.value
      })
      successMessage.value = 'Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta.'
      
      // Cambiar a modo login después de registro exitoso
      setTimeout(() => {
        isSignUp.value = false
        clearForm()
        successMessage.value = ''
      }, 3000)
      
    } else {
      // Login con carga de información del usuario
      await login(email.value, password.value)
      successMessage.value = 'Inicio de sesión exitoso'
      
      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  } catch (error: any) {
    console.error('Auth error:', error)
    
    // Manejar errores específicos
    if (error.message.includes('Invalid login credentials')) {
      errorMessage.value = 'Credenciales inválidas. Verifica tu email y contraseña.'
    } else if (error.message.includes('User already registered')) {
      errorMessage.value = 'Este email ya está registrado. Intenta iniciar sesión.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage.value = 'Debes confirmar tu email antes de iniciar sesión.'
    } else if (error.message.includes('Too many requests')) {
      errorMessage.value = 'Demasiados intentos. Espera un momento antes de intentar nuevamente.'
    } else if (error.message.includes('Usuario no encontrado en el sistema')) {
      errorMessage.value = 'Tu cuenta no está configurada en el sistema. Contacta al administrador.'
    } else {
      errorMessage.value = error.message || 'Error en la autenticación'
    }
  }
}
</script>

<style scoped>
.login-card {
  border-radius: 16px;
}

.fill-height {
  min-height: 100vh;
}

.v-card-title {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
}
</style>
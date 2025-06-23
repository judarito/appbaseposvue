import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976d2',
          secondary: '#424242',
          accent: '#82b1ff',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#ffc107',
          background: '#ffffff',
          surface: '#ffffff',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#42a5f5', // Azul más brillante para mejor contraste
          secondary: '#3f51b5',
          accent: '#64b5f6', // Azul accent más brillante
          error: '#f44336',
          info: '#29b6f6', // Info más brillante
          success: '#66bb6a',
          warning: '#ff9800',
          background: '#121212',
          surface: '#1e1e1e',
          'surface-variant': '#2d2d2d',
          'surface-bright': '#424242', // Nueva superficie más brillante
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi'
  }
})
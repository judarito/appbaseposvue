# Vue Vuetify App

Este proyecto es una aplicación Vue.js que utiliza la Composition API y la librería Vuetify para componentes UI, con autenticación y gestión de datos a través de Supabase.

## 🚀 Características

- **Vue 3** con Composition API y TypeScript
- **Vuetify 3** para UI components
- **Autenticación completa** con Supabase
- **Gestión de Tenants** con CRUD completo y paginación server-side
- **Sistema de temas** (modo claro/oscuro)
- **Routing protegido** con guards de autenticación
- **Layouts responsivos** con sidebar colapsible

## 📁 Estructura del Proyecto

- `src/assets/styles/main.css`: Estilos principales de la aplicación
- `src/components/`: Componentes reutilizables (LoginForm, TenantsList, etc.)
- `src/composables/`: Funciones de composición reutilizables (useSupabase, useTenants, useTheme)
- `src/layouts/`: Layouts de la aplicación (default, auth)
- `src/views/`: Vistas principales (Dashboard, Settings, etc.)
- `src/services/`: Servicios para manejo de datos (tenantService, userService)
- `src/router/`: Configuración de routing con guards
- `src/plugins/vuetify.ts`: Configuración del plugin Vuetify
- `src/lib/supabase.ts`: Cliente de Supabase
- `src/types/index.ts`: Tipos e interfaces de TypeScript

## 🛠️ Configuración

### 1. Instalación de dependencias

```bash
npm install
```

### 2. Configuración de Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia `.env.example` a `.env`
4. Completa las variables de entorno con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Configuración de la base de datos

Ejecuta el script `database-setup.sql` en el editor SQL de Supabase para crear las tablas necesarias.

## 🏃‍♂️ Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## 🏗️ Build

Para compilar la aplicación para producción:

```bash
npm run build
```

## 📊 Funcionalidades Implementadas

### ✅ Completas
- **Autenticación**: Login, registro, logout con Supabase
- **Gestión de Tenants**: CRUD completo con paginación server-side
- **Sistema de temas**: Modo claro/oscuro con persistencia
- **Dashboard**: Vista principal con estadísticas
- **Settings**: Configuración completa de la aplicación

### 🚧 En desarrollo
- **Gestión de Usuarios**: Vista básica implementada
- **Gestión de Productos**: Vista placeholder
- **Reportes**: Vista placeholder

## 🎨 Características de UI

- **Responsive design** adaptable a móviles y desktop
- **Material Design Icons** para iconografía consistente
- **Sidebar colapsible** para navegación
- **Data tables con paginación** server-side
- **Modals y dialogs** para operaciones CRUD
- **Loading states** y manejo de errores
- **Temas dinámicos** con transiciones suaves

## 🔧 Arquitectura Técnica

### Composables
- `useSupabase`: Manejo de autenticación y operaciones CRUD genéricas
- `useTenants`: Gestión específica de tenants con paginación
- `useTheme`: Control del sistema de temas

### Servicios
- `tenantService`: CRUD para tenants con soporte de paginación
- `userService`: Operaciones básicas de usuarios

### Paginación Server-Side
La aplicación implementa paginación del lado del servidor para optimizar el rendimiento:
- Carga solo los registros necesarios por página
- Búsqueda y filtrado en el servidor
- Ordenamiento dinámico
- Contador total de registros

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.
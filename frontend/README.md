# Frontend Vite - React + TypeScript + Zustand + React Query

Un proyecto frontend moderno construido con Vite, React, TypeScript, Zustand para estado de UI y React Query para estado de servidor.

## 🚀 Características

- **Vite** - Build tool rápido y moderno
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Zustand** - Gestión de estado de UI (filtros, etc.)
- **React Query** - Gestión de estado de servidor (datos de API)
- **ESLint + Prettier** - Linting y formateo de código
- **Alias @/** - Imports limpios y legibles
- **Docker** - Desarrollo containerizado
- **Hot Reload** - Recarga automática en desarrollo

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas de la aplicación
├── hooks/         # Custom hooks
├── store/         # Stores de Zustand
├── services/      # Servicios de API
├── types/         # Definiciones de tipos TypeScript
└── assets/        # Recursos estáticos
```

## 🛠️ Instalación y Uso

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Con Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# Solo ejecutar (si ya está construido)
docker-compose up
```

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Ejecuta ESLint
- `npm run format` - Formatea código con Prettier

## 🎯 Ejemplo Funcional

El proyecto incluye un dashboard de ejemplo que demuestra:

1. **Zustand Store** (`useDashboardStore`) - Maneja filtros de UI
2. **React Query Hook** (`useChartData`) - Obtiene datos del servidor cada 5 segundos
3. **Componentes** - `FilterPanel` y `ChartExample` que usan los stores
4. **Alias @/** - Todos los imports usan `@/` para mayor legibilidad

## 🔧 Configuración

### Alias @/

Configurado en:
- `vite.config.ts` - Para Vite
- `tsconfig.app.json` - Para TypeScript

### Docker

- `Dockerfile.dev` - Para desarrollo
- `docker-compose.yml` - Orquestación con volúmenes para hot reload

## 🌐 Acceso

- **Local**: http://localhost:5173
- **Docker**: http://localhost:5173

## 📝 Notas

- Los datos del chart se generan aleatoriamente cada 5 segundos
- React Query DevTools está disponible en desarrollo
- Hot reload funciona tanto en local como en Docker
- Todos los imports usan alias `@/` para mayor legibilidad

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


# Mesai Final Frontend

Modern React + Vite + TypeScript frontend for a professional business dashboard and product management system. Fully responsive, role-based navigation, robust forms, and a custom design system.

## 🚀 Features

- **Vite + React 18 + TypeScript**: Fast, modern frontend stack
- **Zustand**: UI state management (sidebar, user, filters)
- **React Query**: Server state, caching, mutations
- **KendoReact**: UI components (forms, layout, inputs, charts, grid)
- **Role-based Navigation**: Sidebar and header adapt to user role (admin, manager, user)
- **Responsive Layout**: Mobile/desktop sidebar, header, dashboard, quick actions
- **Design System**: CSS tokens for colors, typography, spacing, borders, shadows
- **Product & Review Forms**: Robust, backend-aligned, with validation and tag/category logic
- **Dashboard**: Stats cards, donut chart, recent products grid, quick actions
- **Profile Editing**: Live state sync, Kendo form, navigation on save
- **API Test Page**: Test backend endpoints, login, and user state
- **Docker & Local Development**: Hot reload, easy setup
- **ESLint & Prettier**: Code quality and formatting

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/         # Common, layout, API test, loading spinner
│   ├── pages/              # Dashboard, Products, Reviews, Users (Profile)
│   ├── store/              # Zustand stores (auth, UI)
│   ├── queries/            # React Query hooks (auth, products, reviews)
│   ├── constants/          # Routes, navigation, theme, roles
│   ├── types/              # Global type definitions
│   ├── design-system/      # CSS tokens, components, layouts, utilities
│   ├── hooks/              # Custom hooks (form state, debounce, etc)
│   ├── assets/             # Images, icons
│   ├── styles/             # Global and page-specific CSS
│   └── main.tsx           # App entry point
├── public/                 # Static assets
├── Dockerfile.dev          # Dev container
├── Dockerfile.prod         # Production container
├── package.json            # NPM scripts and dependencies
├── vite.config.ts          # Vite config (alias @/)
├── tsconfig.app.json       # TypeScript config (alias @/)
└── README.md               # This file
```

## 🎨 Design System

- **Tokens**: Colors, typography, spacing, borders, shadows (see `src/design-system/tokens/`)
- **Components**: Button, card, badge, status, alert, spinner, form, dashboard (see `src/design-system/components/`)
- **Responsive**: All layouts and components adapt to mobile/desktop
- **Sidebar/Header**: Colors, sizes, and button styles use design tokens
- **Icon Colors**: Sidebar icons use white or design system colors for contrast

## 🧑‍💼 Role-based Navigation

- **Admin/Manager**: Full sidebar (Dashboard, Products, Categories, Tags, Reviews, Users, Settings)
- **User**: Limited sidebar (Dashboard, Products, Settings)
- **Sidebar**: Expands/collapses on desktop, overlays on mobile
- **Header**: Shows sidebar toggle and dashboard button on mobile, user menu on right

## � Product & Review Forms

- **Create/Edit Product**: Name, description, price, stock, SKU, status, featured, category, tags
- **Create/Edit Review**: Product, rating, title, content
- **Validation**: Required fields, numeric checks, backend-aligned types
- **Tag/Category Logic**: Multi-select, dropdowns, preview

## 📊 Dashboard

- **Stats Cards**: Total products, published, draft, low stock
- **Donut Chart**: Product distribution by status
- **Recent Products**: Grid with name, category, price, stock, status
- **Quick Actions**: Add product, view products, manage categories, edit profile

## 👤 Profile Editing

- **Live State Sync**: Updates user store and header on save
- **Kendo Form**: Editable name, email, username, etc
- **Navigation**: Redirects to dashboard after save

## 🔌 API Test Page

- **Test Backend Endpoints**: Login, categories, products, current user
- **Show Auth State**: Store and query user, authentication status
- **Results Panel**: Shows last 5 test results with status and data

## 🐳 Docker & Local Development

- **Dev**: `Dockerfile.dev`, hot reload, port 5173
- **Prod**: `Dockerfile.prod`
- **Compose**: `docker-compose.yml` for full stack
- **Local**: `npm run dev` for Vite server

## 🧰 Scripts & Tools

- **dev**: Start Vite dev server
- **build**: TypeScript build and Vite production build
- **lint**: ESLint check
- **lint:fix**: ESLint auto-fix
- **format**: Prettier format
- **test**: Jest unit tests
- **preview**: Vite preview
- **analyze**: Bundle analyzer

## 🌐 Access

- **Local**: http://localhost:5173
- **Docker**: http://localhost:5173

## 📝 Notes

- All imports use alias `@/` for clarity
- React Query DevTools available in development
- Hot reload works in Docker and local
- All UI and navigation elements use design system tokens
- Buttons use text, white background, and are sized for visibility
- Sidebar text and icons are visible and responsive
- Mobile/desktop transitions are robust

---

For backend API details, see `backend/README.md`.


# Frontend - Vite + React + TypeScript

Este frontend es una base moderna para una aplicación de gestión de productos y dashboard, construida con Vite, React, TypeScript, Zustand y React Query. El objetivo es ofrecer una experiencia funcional, responsive y fácil de mantener, aunque no es un producto final pulido ni una solución empresarial completa.

## � Estado y Alcance

- **Funcionalidad principal:**
	- Dashboard con métricas, gráfico y acciones rápidas.
	- Gestión de productos (crear, editar, listar).
	- Gestión de reviews (crear, editar, asociar a productos).
	- Edición de perfil de usuario.
	- Navegación y layout responsive (sidebar, header, mobile/desktop).
- **Gestión de estado:**
	- Zustand para el usuario y roles.
	- React Query para datos de servidor y mutaciones.
- **UI:**
	- KendoReact para formularios, tablas, inputs y layout.
	- Diseño visual basado en un sistema de design tokens CSS (colores, tipografía, espaciado).
- **Autenticación:**
	- JWT, roles (admin, manager, user), navegación adaptada según permisos.
- **API Test:**
	- Página para probar endpoints y login contra el backend.

## ⚠️ Limitaciones y Realidad

- No es un producto final ni una plantilla lista para producción.
- El diseño visual es funcional pero no exhaustivo ni "pixel perfect".
- La gestión de errores es básica y puede mejorarse.
- No hay tests E2E ni cobertura exhaustiva.
- El dashboard y los formularios son ejemplos realistas, pero no cubren todos los casos de negocio posibles.
- El sistema de design tokens es una base, no un sistema de diseño corporativo completo.
- El código es mantenible y modular, pero no está optimizado para grandes equipos o escalabilidad extrema.

## 📁 Estructura

```
src/
├── components/     # Layout, comunes, API Test, Loading
├── pages/          # Dashboard, Products, Reviews, Profile
├── store/          # Zustand (auth, UI)
├── queries/        # React Query hooks (auth, products, reviews)
├── constants/      # Rutas, navegación, roles, temas
├── types/          # Tipos globales
├── design-system/  # Tokens CSS, componentes, utilidades
├── hooks/          # Custom hooks
├── assets/         # Imágenes, iconos
└── styles/         # CSS global y de página
```

## 🛠️ Instalación y Uso

### Local

```bash
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## 📦 Scripts

- `dev`, `build`, `preview`, `lint`, `format`, `test`, `analyze` (ver `package.json`)

## 🖥️ Experiencia de Usuario

- **Dashboard:** Métricas, gráfico donut, productos recientes, acciones rápidas.
- **Sidebar/Header:** Responsive, roles, botones visibles y accesibles, navegación clara.
- **Formularios:** Productos y reviews alineados con el backend, validación básica, selectores de tags/categorías.
- **Perfil:** Edición de nombre, email, etc. con actualización en el header.
- **API Test:** Página para probar endpoints y login.

## 🎨 Design System

- Tokens CSS para colores, tipografía, espaciado, bordes y sombras.
- Componentes y layouts usan estos tokens para coherencia visual.
- No es un sistema de diseño corporativo, pero es una base sólida para proyectos reales.

## 🔒 Roles y Permisos

- Sidebar y navegación adaptadas según el rol (admin, manager, user).
- Acceso a páginas y acciones restringido por permisos.

## 🌐 Acceso

- Local: http://localhost:5173
- Docker: http://localhost:5173

## 📝 Notas y Consejos

- El código es claro y fácil de modificar para adaptarlo a otros proyectos.
- El diseño es funcional, no final.
- La integración con el backend (Django DRF) es directa y realista.
- El sistema de roles y navegación es robusto para apps pequeñas/medianas.
- El sistema de design tokens facilita la personalización visual.

---

Para detalles de la API y backend, ver `backend/README.md`.

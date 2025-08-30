
# Mesai Final - Full-Stack Application (Django REST + React)

Este proyecto es una base realista para una aplicación full-stack, compuesta por un backend Django REST Framework y un frontend React con TypeScript. El objetivo es ofrecer una arquitectura funcional, mantenible y fácil de adaptar, pero no es un producto final ni una solución empresarial lista para producción.

---

## 🏗️ Arquitectura General

```
mesaifinal/
├── backend/    # API Django REST Framework
│   ├── apps/   # apps: users (usuarios, auth, roles), core (productos, reviews)
│   ├── config/ # settings, urls, wsgi
│   ├── tests/  # tests unitarios y de integración
│   └── ...
├── frontend/   # React + TypeScript + Zustand + React Query
│   ├── src/
│   │   ├── components/   # Layout, comunes, API Test, Loading
│   │   ├── pages/        # Dashboard, Products, Reviews, Profile
│   │   ├── store/        # Zustand (auth, UI)
│   │   ├── queries/      # React Query hooks
│   │   ├── constants/    # Rutas, navegación, roles
│   │   ├── design-system/# Tokens CSS, componentes, utilidades
│   │   └── ...
│   └── ...
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## � Estado y Alcance

### Backend (Django + DRF)
- API RESTful para productos, reviews, usuarios y categorías.
- Autenticación JWT (SimpleJWT), roles (admin, manager, user).
- Permisos y navegación adaptados al rol.
- Documentación automática (Swagger/OpenAPI).
- Tests unitarios y de integración (pytest).
- Base de datos SQLite (por defecto) o PostgreSQL (opcional).
- Redis opcional para caché.
- Señales para lógica de negocio básica.
- Cobertura de tests razonable, pero no exhaustiva.
- Gestión de errores y validaciones básicas.

### Frontend (React + TypeScript)
- Dashboard con métricas, gráfico y acciones rápidas.
- Gestión de productos y reviews (crear, editar, listar).
- Edición de perfil de usuario.
- Navegación y layout responsive (sidebar, header, mobile/desktop).
- Zustand para estado de usuario y UI.
- React Query para datos de servidor.
- KendoReact para formularios, tablas, inputs y layout.
- Sistema de design tokens CSS (colores, tipografía, espaciado).
- Página de test de API y login.
- Gestión de errores y loading básica.
- No hay tests E2E ni cobertura exhaustiva en frontend.

### DevOps y Desarrollo
- Docker Compose para entorno local.
- Makefile con comandos útiles.
- Hot reload en backend y frontend.
- Linting y formateo (ESLint, Prettier, Black).

---

## ⚠️ Limitaciones y Realidad

- No es un producto final ni una plantilla lista para producción.
- El diseño visual es funcional pero no exhaustivo ni "pixel perfect".
- La gestión de errores es básica y puede mejorarse.
- No hay tests E2E ni cobertura exhaustiva.
- El dashboard y los formularios son ejemplos realistas, pero no cubren todos los casos de negocio posibles.
- El sistema de design tokens es una base, no un sistema de diseño corporativo completo.
- El código es mantenible y modular, pero no está optimizado para grandes equipos o escalabilidad extrema.

---

## 🛠️ Instalación y Uso Rápido

### Requisitos
- Docker y Docker Compose
- Make (opcional)
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd mesaifinal
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
# Edita .env según tu entorno
```

### 3. Arrancar entorno de desarrollo
```bash
make dev-up
# o
docker-compose up --build
```

### 4. Inicializar base de datos
```bash
make migrate
make createsuperuser
make load-fixtures  # opcional
```

### 5. Acceso
- Frontend: http://localhost:3000 o http://localhost:5173
- Backend API: http://localhost:8000/api/v1/
- Docs API: http://localhost:8000/api/docs/
- Django Admin: http://localhost:8000/admin/

---

## 📚 Documentación y Endpoints Clave

### API REST (Swagger/OpenAPI)
- http://localhost:8000/api/docs/
- http://localhost:8000/api/redoc/

### Endpoints principales
- Autenticación: `/api/v1/auth/login/`, `/api/v1/auth/refresh/`
- Usuarios: `/api/v1/users/me/`, `/api/v1/users/` (admin)
- Productos: `/api/v1/products/`, `/api/v1/products/{slug}/`
- Reviews: `/api/v1/reviews/`, `/api/v1/reviews/{id}/`
- Categorías: `/api/v1/categories/`

---

## 🧪 Testing

### Backend
- `make test-backend` o `pytest` en backend/tests/
- Cobertura razonable, pero no exhaustiva.

### Frontend
- `make test-frontend` (si está configurado)
- No hay tests E2E ni cobertura completa.

---

## 🔧 Configuración

### Variables de entorno
- `.env` basado en `env.example` para backend y frontend.
- Cambia los valores según tu entorno local o de producción.

---

## 🎨 UI/UX y Design System

- KendoReact para componentes visuales.
- Tokens CSS para colores, tipografía, espaciado.
- Layout responsive, sidebar y header adaptados a roles.
- No es un sistema de diseño corporativo, pero es una base sólida.

---

## 🤝 Contribución

1. Haz un fork
2. Crea una rama feature
3. Haz tus cambios y tests
4. Abre un Pull Request

### Estándares
- Python: PEP8, Black
- JS/TS: ESLint, Prettier
- Tests y documentación para nuevas features

---

## 📄 Licencia

MIT. Ver archivo LICENSE.

---

**Este proyecto es una base realista, funcional y mantenible, pero no una solución final ni "enterprise". Úsalo como punto de partida para tus propios desarrollos.**

# Django Apps

Este directorio contiene las aplicaciones Django que componen el backend del sistema. Cada app está diseñada para manejar un dominio específico de funcionalidad, siguiendo el principio de separación de responsabilidades.

## 📁 Estructura General

```
apps/
├── __init__.py              # Marcador de paquete Python
├── README.md               # Este archivo - Índice de aplicaciones
├── core/                   # Aplicación principal de negocio
│   ├── README.md          # Documentación detallada de Core
│   ├── models.py          # Category, Product, Tag, Review
│   ├── views.py           # API REST ViewSets
│   ├── serializers.py     # Serializadores DRF
│   ├── admin.py           # Panel de administración
│   └── ...
└── users/                  # Gestión de usuarios y autenticación
    ├── README.md          # Documentación detallada de Users
    ├── models.py          # User personalizado con roles
    ├── views.py           # API REST ViewSets
    ├── permissions.py     # Permisos personalizados
    ├── serializers.py     # Serializadores DRF
    └── ...
```

## 🏗️ Aplicaciones

### 🛍️ Core App
**Propósito**: Funcionalidad central del negocio - catálogo de productos, categorías, etiquetas y reseñas.

**Modelos principales**:
- `Category`: Categorización jerárquica de productos
- `Product`: Modelo principal con información completa de productos
- `Tag`: Etiquetas para clasificación flexible
- `Review`: Sistema de reseñas y calificaciones

**APIs disponibles**:
- `/api/categories/` - CRUD de categorías
- `/api/products/` - CRUD de productos con filtros avanzados
- `/api/tags/` - CRUD de etiquetas
- `/api/reviews/` - CRUD de reseñas

**Características destacadas**:
- ✅ Filtrado avanzado y búsqueda
- ✅ Caching inteligente
- ✅ Exportación/importación de datos
- ✅ Estadísticas y métricas
- ✅ Gestión de inventario

📖 **[Ver documentación completa →](core/README.md)**

### 👥 Users App
**Propósito**: Gestión completa de usuarios, autenticación, autorización y perfiles.

**Modelo principal**:
- `User`: Modelo personalizado con sistema de roles (Admin, Manager, User)

**APIs disponibles**:
- `/api/users/` - CRUD de usuarios
- `/api/users/me/` - Perfil del usuario actual
- `/api/users/change_password/` - Cambio de contraseña
- `/api/users/stats/` - Estadísticas de usuarios

**Características destacadas**:
- ✅ Autenticación con email
- ✅ Sistema de roles granular
- ✅ Permisos personalizados
- ✅ Perfiles con avatar y biografía
- ✅ Auditoría y seguridad

📖 **[Ver documentación completa →](users/README.md)**

## 🔄 Interacciones entre Apps

### Core ↔ Users
- **Productos** tienen un `created_by` (FK a User)
- **Reseñas** conectan User con Product
- **Permisos** basados en roles de User para CRUD de Core

### Flujo típico
1. **Usuario** se autentica (Users app)
2. **Usuario** navega productos/categorías (Core app)
3. **Usuario** crea reseña de producto (Core + Users)
4. **Manager/Admin** gestiona contenido (Users permissions + Core CRUD)

## 🔐 Sistema de Permisos

### Jerarquía de Roles
```
Admin (Superuser)
├── Acceso completo a todo el sistema
├── Gestión de usuarios y roles
└── Configuraciones del sistema

Manager
├── CRUD completo en Core app
├── Gestión de contenido
└── Visualización de estadísticas

User
├── Lectura de productos/categorías
├── Creación de reseñas propias
└── Gestión de perfil personal
```

### Permisos Personalizados
- `IsAdminOrManagerOrReadOnly`: Escritura para Admin/Manager, lectura para todos
- `IsOwnerOrReadOnly`: Solo el propietario puede editar
- `IsAdminOnly`: Acceso exclusivo para administradores
- `IsManagerOrAbove`: Manager y Admin

## 📊 APIs Unificadas

### Endpoints Principales
```
# Autenticación (django-rest-framework-simplejwt)
POST   /api/auth/login/           # Login con email/password
POST   /api/auth/refresh/         # Refresh token
POST   /api/auth/verify/          # Verificar token

# Usuarios
GET    /api/users/               # Lista usuarios (Admin/Manager)
GET    /api/users/me/            # Perfil actual
POST   /api/users/change_password/ # Cambiar contraseña

# Core - Productos
GET    /api/products/            # Lista productos
GET    /api/products/featured/   # Productos destacados
GET    /api/products/stats/      # Estadísticas
POST   /api/products/            # Crear producto (Admin/Manager)

# Core - Categorías
GET    /api/categories/          # Lista categorías
GET    /api/categories/{id}/products/ # Productos de categoría

# Core - Reseñas
GET    /api/reviews/             # Lista reseñas
POST   /api/reviews/             # Crear reseña (autenticado)
```

### Filtros Comunes
```
# Paginación (en todos los endpoints)
?page=1&page_size=20

# Ordenamiento
?ordering=-created_at,name

# Búsqueda
?search=término

# Filtros específicos por app
?role=manager&is_active=true     # Users
?category=1&is_featured=true     # Products
```

## 🛠️ Desarrollo

### Agregar Nueva App
```bash
# 1. Crear la app
python manage.py startapp nueva_app apps/nueva_app

# 2. Registrar en settings.py
LOCAL_APPS = [
    'apps.core',
    'apps.users',
    'apps.nueva_app',  # Agregar aquí
]

# 3. Crear README.md siguiendo el patrón
# 4. Documentar modelos, views, serializers
# 5. Agregar URLs al router principal
```

### Estructura Recomendada por App
```
nueva_app/
├── __init__.py
├── README.md              # Documentación completa
├── admin.py              # Configuración admin
├── apps.py               # Configuración de la app
├── models.py             # Modelos de datos
├── serializers.py        # Serializadores DRF
├── views.py              # ViewSets y vistas
├── urls.py               # Configuración URLs
├── permissions.py        # Permisos personalizados (opcional)
├── signals.py            # Señales Django (opcional)
├── filters.py            # Filtros personalizados (opcional)
├── tasks.py              # Tareas Celery (opcional)
├── tests/                # Tests organizados
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_views.py
│   └── test_serializers.py
└── migrations/           # Migraciones de BD
```

## 🧪 Testing

### Ejecutar Tests por App
```bash
# Todas las apps
python manage.py test apps

# App específica
python manage.py test apps.core
python manage.py test apps.users

# Tests específicos
python manage.py test apps.core.tests.test_models
python manage.py test apps.users.tests.test_permissions
```

### Coverage
```bash
# Instalar coverage
pip install coverage

# Ejecutar con coverage
coverage run --source='.' manage.py test apps
coverage report
coverage html  # Genera reporte HTML
```

## 📈 Monitoreo y Métricas

### Endpoints de Estadísticas
```python
GET /api/users/stats/      # Estadísticas de usuarios
GET /api/products/stats/   # Estadísticas de productos
```

### Logs y Auditoría
- **Django logging** configurado por app
- **Señales** para auditoría automática
- **Middleware** para tracking de requests

## 🚀 Deployment

### Variables de Entorno por App
```env
# Core app
ENABLE_PRODUCT_CACHE=true
EXPORT_FILE_MAX_SIZE=10485760

# Users app  
PASSWORD_MIN_LENGTH=8
AVATAR_MAX_SIZE=2097152
```

### Migraciones
```bash
# Crear migraciones por app
python manage.py makemigrations core
python manage.py makemigrations users

# Aplicar todas
python manage.py migrate
```

## 📚 Recursos Adicionales

- **Django REST Framework**: [Documentación oficial](https://www.django-rest-framework.org/)
- **Django Signals**: [Guía de señales](https://docs.djangoproject.com/en/4.2/topics/signals/)
- **Permisos DRF**: [Sistema de permisos](https://www.django-rest-framework.org/api-guide/permissions/)
- **Testing Django**: [Guía de testing](https://docs.djangoproject.com/en/4.2/topics/testing/)

---

## 📝 Convenciones de Código

### Nomenclatura
- **Modelos**: PascalCase (`Product`, `Category`)
- **Campos**: snake_case (`created_at`, `is_active`)
- **URLs**: kebab-case (`/api/products/featured/`)
- **Archivos**: snake_case (`test_models.py`)

### Documentación
- **Docstrings** en todos los modelos y métodos
- **Comentarios** para lógica compleja
- **README.md** actualizado por app
- **CHANGELOG.md** para cambios importantes

### Commits
```
feat(core): add product export functionality
fix(users): resolve permission check bug
docs(apps): update README with new endpoints
test(core): add product model tests
```

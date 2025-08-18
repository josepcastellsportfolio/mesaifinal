# Users App

La aplicación **Users** maneja toda la funcionalidad relacionada con usuarios, autenticación, autorización y perfiles. Implementa un modelo de usuario personalizado con sistema de roles y permisos granulares.

## 📁 Estructura de Archivos

```
users/
├── __init__.py          # Marcador de paquete Python
├── admin.py             # Configuración del panel de administración
├── apps.py              # Configuración de la aplicación
├── models.py            # Modelo User personalizado
├── permissions.py       # Clases de permisos personalizados
├── serializers.py       # Serializadores para API REST
├── signals.py           # Señales de Django para lógica automática
├── urls.py              # Configuración de URLs
├── views.py             # ViewSets para API REST
└── migrations/          # Migraciones de base de datos
```

## 🏗️ Modelos

### `User` (Modelo Personalizado)
**Propósito**: Extiende el modelo AbstractUser de Django con campos adicionales y sistema de roles.

**Herencia**: `AbstractUser` de Django

#### **Roles Disponibles**
```python
class Role(models.TextChoices):
    ADMIN = 'admin', 'Administrator'      # Acceso completo al sistema
    MANAGER = 'manager', 'Manager'        # Gestión de contenido y usuarios
    USER = 'user', 'User'                 # Usuario final básico
```

#### **Campos Adicionales**
- `email`: Email único (usado como USERNAME_FIELD)
- `first_name`: Nombre (requerido)
- `last_name`: Apellido (requerido)
- `role`: Rol del usuario (choices, default='user')
- `phone_number`: Teléfono con validación de formato
- `avatar`: Imagen de perfil (upload_to='avatars/')
- `bio`: Biografía corta (max 500 chars)
- `is_active`: Estado activo/inactivo
- `date_joined`: Fecha de registro (auto)
- `updated_at`: Última actualización (auto)

#### **Configuración de Autenticación**
- `USERNAME_FIELD = 'email'`: Login con email
- `REQUIRED_FIELDS = ['username', 'first_name', 'last_name']`

#### **Métodos y Propiedades Personalizados**
- `get_full_name()`: Nombre completo del usuario
- `get_short_name()`: Nombre corto (first_name)
- `full_name` (property): Nombre completo como propiedad
- `is_admin()`: Verifica si tiene rol de administrador
- `is_manager()`: Verifica si tiene rol de manager
- `__str__()`: Representación string (nombre + email)

### `UserProfile` (Modelo Extendido)
**Propósito**: Perfil extendido con información adicional del usuario.

**Relación**: OneToOne con User (relacionado como 'profile')

**Campos Adicionales**:
- `date_of_birth`: Fecha de nacimiento (opcional)
- `address`: Dirección completa (opcional)
- `website`: Sitio web personal (opcional)
- `linkedin`: Perfil de LinkedIn (opcional)
- `github`: Perfil de GitHub (opcional)
- `company`: Empresa actual (opcional)
- `position`: Cargo/posición (opcional)

**Uso**:
```python
user = User.objects.get(id=1)
profile = user.profile  # Acceso al perfil extendido
profile.company = "Mi Empresa"
profile.save()
```

## 🔐 Permisos (permissions.py)

### `IsOwnerOrAdmin`
**Propósito**: Permite edición al propietario del objeto o administradores.
**Uso**: Perfiles de usuario, datos personales.

```python
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Lectura para usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return True
        # Escritura para propietario, staff o admin
        return obj == request.user or request.user.is_staff or request.user.is_admin()
```

### `IsAdminOrManagerOrReadOnly`
**Propósito**: Escritura para Admin/Manager, lectura para todos.
**Uso**: Gestión de productos, categorías, etc.

```python
class IsAdminOrManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Lectura para todos los autenticados
        if request.method in permissions.SAFE_METHODS:
            return True
        # Escritura solo para staff, admin o manager
        return (
            request.user.is_staff or 
            request.user.is_admin() or 
            request.user.is_manager()
        )
```

### `IsManagerOrAdmin`
**Propósito**: Acceso exclusivo para Manager y Admin.
**Uso**: Gestión de contenido, reportes, estadísticas.

```python
class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and (
                request.user.is_staff or
                request.user.is_admin() or
                request.user.is_manager()
            )
        )
```

## 🔧 Serializadores (serializers.py)

### `UserSerializer` (Completo)
**Propósito**: CRUD completo de usuarios con validaciones.

**Campos**:
- Todos los campos del modelo User
- `password`: Solo escritura con hash automático
- `password_confirm`: Confirmación de contraseña
- `full_name`: Campo calculado (read-only)

**Validaciones**:
- Email único y formato válido
- Contraseña fuerte (min 8 chars, números, letras)
- Confirmación de contraseña coincidente
- Teléfono con formato internacional

### `UserListSerializer` (Optimizado)
**Propósito**: Lista de usuarios con campos esenciales.

**Campos**:
- `id`, `email`, `full_name`, `role`, `is_active`, `date_joined`
- Excluye campos sensibles y pesados

### `UserProfileSerializer`
**Propósito**: Perfil público de usuario.

**Campos**:
- `id`, `username`, `full_name`, `avatar`, `bio`
- Solo información pública

### `PasswordChangeSerializer`
**Propósito**: Cambio de contraseña seguro.

**Campos**:
- `old_password`: Contraseña actual
- `new_password`: Nueva contraseña
- `new_password_confirm`: Confirmación

**Validaciones**:
- Verificar contraseña actual
- Validar nueva contraseña
- Confirmar coincidencia

## 🌐 ViewSets (views.py)

### `UserViewSet`
**Funcionalidades**:
- **CRUD completo** de usuarios (Admin/Manager)
- **Filtros**: `role`, `is_active`, `date_joined`
- **Búsqueda**: `email`, `first_name`, `last_name`, `username`
- **Ordenamiento**: `date_joined`, `email`, `last_name`

**Acciones Personalizadas**:

#### `me/` (GET/PATCH)
**Propósito**: Perfil del usuario actual.
```python
GET /api/users/me/          # Obtener perfil
PATCH /api/users/me/        # Actualizar perfil
```

#### `change_password/` (POST)
**Propósito**: Cambiar contraseña del usuario actual.
```python
POST /api/users/change_password/
{
    "old_password": "current123",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
```

#### `update_profile/` (PATCH)
**Propósito**: Actualizar información del perfil.
```python
PATCH /api/users/update_profile/
{
    "first_name": "Juan",
    "last_name": "Pérez",
    "bio": "Desarrollador Full Stack"
}
```

#### `deactivate/` (POST)
**Propósito**: Desactivar cuenta propia.
```python
POST /api/users/deactivate/
```

#### `stats/` (GET) - Admin/Manager
**Propósito**: Estadísticas de usuarios.
```python
GET /api/users/stats/
{
    "total_users": 150,
    "active_users": 120,
    "admins": 2,
    "managers": 5,
    "users": 143,
    "new_this_month": 15
}
```

### Permisos por Acción
- **Lista/Detalle**: Admin/Manager
- **Crear**: Admin/Manager  
- **Actualizar/Eliminar**: Admin/Manager (otros usuarios)
- **me/**: Usuario autenticado (propio perfil)
- **change_password/**: Usuario autenticado
- **update_profile/**: Usuario autenticado
- **stats/**: Admin/Manager

## 🎯 Señales (signals.py)

### Señales Implementadas

#### `post_save User`
**Propósito**: Acciones automáticas al crear/actualizar usuario.
```python
@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        # Crear perfil adicional si es necesario
        # Enviar email de bienvenida
        # Asignar permisos por defecto
        pass
```

#### `pre_delete User`
**Propósito**: Limpieza antes de eliminar usuario.
```python
@receiver(pre_delete, sender=User)
def user_pre_delete(sender, instance, **kwargs):
    # Limpiar archivos asociados (avatar)
    # Anonimizar datos relacionados
    # Log de auditoría
    pass
```

#### `post_login`
**Propósito**: Acciones después del login.
- Actualizar último acceso
- Log de auditoría
- Verificar intentos de login

## 🔗 URLs (urls.py)

**Router principal**:
```python
router.register(r'', UserViewSet, basename='user')
```

**Rutas disponibles**:
```python
GET    /api/users/              # Lista de usuarios
POST   /api/users/              # Crear usuario
GET    /api/users/{id}/         # Detalle de usuario
PATCH  /api/users/{id}/         # Actualizar usuario
DELETE /api/users/{id}/         # Eliminar usuario

# Rutas personalizadas
GET    /api/users/me/           # Perfil actual
PATCH  /api/users/me/           # Actualizar perfil actual
POST   /api/users/change_password/     # Cambiar contraseña
PATCH  /api/users/update_profile/      # Actualizar perfil
POST   /api/users/deactivate/          # Desactivar cuenta
GET    /api/users/stats/               # Estadísticas (Admin)
```

## 🛠️ Admin (admin.py)

### `UserAdmin` (Personalizado)
**Características**:
- **List display**: email, full_name, role, is_active, date_joined
- **List filter**: role, is_active, is_staff, date_joined
- **Search fields**: email, first_name, last_name, username
- **Ordering**: date_joined (desc)

**Fieldsets organizados**:
```python
fieldsets = (
    ('Información Personal', {
        'fields': ('email', 'username', 'first_name', 'last_name', 'avatar', 'bio')
    }),
    ('Permisos y Rol', {
        'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
    }),
    ('Información de Contacto', {
        'fields': ('phone_number',)
    }),
    ('Fechas Importantes', {
        'fields': ('last_login', 'date_joined', 'updated_at'),
        'classes': ('collapse',)
    }),
)
```

**Acciones personalizadas**:
- `activate_users`: Activar usuarios seleccionados
- `deactivate_users`: Desactivar usuarios seleccionados
- `promote_to_manager`: Promover a Manager
- `demote_to_user`: Degradar a User

## 🚀 Uso de la API

### Registro de Usuario (Desde Admin)
```python
POST /api/users/
{
    "email": "usuario@example.com",
    "username": "usuario123",
    "first_name": "Juan",
    "last_name": "Pérez",
    "password": "password123",
    "password_confirm": "password123",
    "role": "user"
}
```

### Obtener Perfil Actual
```python
GET /api/users/me/
Authorization: Bearer <token>

Response:
{
    "id": 1,
    "email": "usuario@example.com",
    "username": "usuario123",
    "full_name": "Juan Pérez",
    "role": "user",
    "avatar": "/media/avatars/avatar.jpg",
    "bio": "Desarrollador apasionado"
}
```

### Cambiar Contraseña
```python
POST /api/users/change_password/
Authorization: Bearer <token>
{
    "old_password": "password123",
    "new_password": "newpassword456",
    "new_password_confirm": "newpassword456"
}
```

### Filtrar Usuarios (Admin/Manager)
```python
GET /api/users/?role=manager&is_active=true
GET /api/users/?search=juan
GET /api/users/?ordering=-date_joined
```

## 🔒 Seguridad

### Validaciones Implementadas
1. **Email único** en toda la base de datos
2. **Contraseña fuerte** (min 8 chars, letras y números)
3. **Validación de teléfono** con regex
4. **Sanitización de datos** de entrada
5. **Rate limiting** en endpoints sensibles

### Permisos Granulares
```python
# Ejemplos de uso en views
permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
permission_classes = [IsAuthenticated, IsAdminOrManagerOrReadOnly]
permission_classes = [IsAuthenticated, IsAdminOnly]
```

### Auditoría
- **Log de acciones** críticas (login, cambios de rol)
- **Tracking de cambios** en perfil
- **Alertas de seguridad** (intentos fallidos)

## 🧪 Testing

### Tests Incluidos
- **Creación de usuarios** con diferentes roles
- **Autenticación** con email/contraseña
- **Permisos** por rol
- **Validaciones** de datos
- **API endpoints** completos

```bash
# Ejecutar tests específicos
python manage.py test apps.users
python manage.py test apps.users.tests.test_models
python manage.py test apps.users.tests.test_views
```

## 📊 Métricas y Monitoreo

### Estadísticas Disponibles
- Total de usuarios registrados
- Usuarios activos/inactivos
- Distribución por roles
- Registros por período
- Último acceso promedio

### Endpoints de Monitoreo
```python
GET /api/users/stats/           # Estadísticas generales
GET /api/users/?is_active=false # Usuarios inactivos
GET /api/users/?role=admin      # Usuarios por rol
```

## 🔄 Integración con Frontend

### Autenticación JWT
La app se integra con `django-rest-framework-simplejwt`:
```python
# Login
POST /api/auth/login/
{
    "email": "usuario@example.com", 
    "password": "password123"
}

# Refresh token
POST /api/auth/refresh/
{"refresh": "refresh_token"}
```

### Gestión de Estado
El frontend usa Zustand para manejar:
- Usuario actual
- Estado de autenticación  
- Roles y permisos
- Perfil de usuario

## 🚀 Extensibilidad

### Campos Adicionales
Para añadir campos al modelo User:
```python
# En models.py
company = models.CharField(max_length=100, blank=True)
department = models.CharField(max_length=50, blank=True)

# Actualizar serializers.py y admin.py
```

### Roles Personalizados
```python
# Extender Role choices
class Role(models.TextChoices):
    ADMIN = 'admin', 'Administrator'
    MANAGER = 'manager', 'Manager'
    SUPERVISOR = 'supervisor', 'Supervisor'  # Nuevo rol
    USER = 'user', 'User'
```

### Permisos Específicos
```python
# Crear nuevas clases de permisos
class IsOwnerOrSupervisor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or request.user.role == 'supervisor'
```

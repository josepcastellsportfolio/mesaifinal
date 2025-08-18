# Core App

La aplicación **Core** contiene los modelos y funcionalidades centrales del sistema, incluyendo categorías, productos, etiquetas y reseñas. Proporciona una API REST completa con funcionalidades avanzadas de filtrado, búsqueda y caching.

## 📁 Estructura de Archivos

```
core/
├── __init__.py          # Marcador de paquete Python
├── admin.py             # Configuración del panel de administración
├── apps.py              # Configuración de la aplicación
├── models.py            # Modelos de datos (Category, Product, Tag, Review)
├── serializers.py       # Serializadores para API REST
├── signals.py           # Señales de Django para lógica automática
├── urls.py              # Configuración de URLs
├── views.py             # ViewSets para API REST
└── migrations/          # Migraciones de base de datos
```

## 🏗️ Modelos

### `TimeStampedModel` (Abstracto)
**Propósito**: Modelo base que proporciona campos de timestamp automáticos.

**Campos**:
- `created_at`: Fecha de creación (auto)
- `updated_at`: Fecha de última modificación (auto)

**Uso**: Heredado por todos los demás modelos para consistencia.

### `Category`
**Propósito**: Categorización de productos con soporte para jerarquías.

**Campos**:
- `name`: Nombre de la categoría (único, max 100 chars)
- `slug`: URL amigable (generado automáticamente)
- `description`: Descripción opcional
- `parent`: Categoría padre (self-reference, nullable)
- `is_active`: Estado activo/inactivo
- `image`: Imagen representativa (opcional)
- `sort_order`: Orden de visualización

**Métodos**:
- `__str__()`: Representación string
- `save()`: Genera slug automáticamente
- `get_absolute_url()`: URL del detalle
- `get_children()`: Subcategorías
- `get_products_count()`: Número de productos

### `Tag`
**Propósito**: Etiquetas para clasificación flexible de productos.

**Campos**:
- `name`: Nombre de la etiqueta (único, max 50 chars)
- `slug`: URL amigable
- `color`: Color hex para UI (#RRGGBB)
- `is_active`: Estado activo/inactivo

**Métodos**:
- `__str__()`: Representación string
- `save()`: Genera slug automáticamente

### `Product`
**Propósito**: Modelo principal de productos con información completa.

**Campos**:
- `name`: Nombre del producto (max 200 chars)
- `slug`: URL amigable (único)
- `description`: Descripción detallada
- `short_description`: Resumen breve
- `category`: Categoría (FK a Category)
- `tags`: Etiquetas (M2M a Tag)
- `price`: Precio decimal (hasta 10.2)
- `cost_price`: Precio de costo
- `stock_quantity`: Cantidad en inventario
- `min_stock_level`: Nivel mínimo de stock
- `sku`: Código único del producto
- `barcode`: Código de barras (opcional)
- `weight`: Peso en gramos
- `dimensions`: Dimensiones como JSON
- `image`: Imagen principal
- `gallery`: Galería de imágenes (JSON)
- `is_active`: Estado activo/inactivo
- `is_featured`: Producto destacado
- `status`: Estado (draft/published/archived)
- `meta_title`: Título SEO
- `meta_description`: Descripción SEO
- `created_by`: Usuario creador (FK a User)

**Propiedades**:
- `profit_margin`: Margen de ganancia calculado
- `is_low_stock`: Si está bajo en stock
- `average_rating`: Calificación promedio

**Métodos**:
- `__str__()`: Representación string
- `save()`: Genera slug automáticamente
- `get_absolute_url()`: URL del detalle

### `Review`
**Propósito**: Sistema de reseñas y calificaciones de productos.

**Campos**:
- `product`: Producto reseñado (FK a Product)
- `user`: Usuario que reseña (FK a User)
- `rating`: Calificación 1-5 estrellas
- `title`: Título de la reseña
- `comment`: Comentario detallado
- `is_verified`: Reseña verificada
- `is_approved`: Reseña aprobada por moderación
- `helpful_votes`: Votos de utilidad

**Restricciones**:
- Única reseña por usuario/producto
- Rating entre 1 y 5

## 🔧 Serializadores (serializers.py)

### Serializadores de Lista (Optimizados)
- `CategoryListSerializer`: Vista resumida de categorías
- `ProductListSerializer`: Vista resumida de productos  
- `ReviewListSerializer`: Vista resumida de reseñas

### Serializadores Completos
- `CategorySerializer`: CRUD completo de categorías
- `ProductSerializer`: CRUD completo de productos
- `TagSerializer`: CRUD de etiquetas
- `ReviewSerializer`: CRUD de reseñas

**Características Especiales**:
- **Validaciones personalizadas** para SKU, precio, stock
- **Campos calculados** (profit_margin, is_low_stock)
- **Serialización anidada** (categoría en producto, etc.)
- **Optimización de consultas** con select_related/prefetch_related

## 🌐 ViewSets (views.py)

### `CategoryViewSet`
**Funcionalidades**:
- CRUD completo de categorías
- Filtros: `parent`, `is_active`
- Búsqueda: `name`, `description`
- Ordenamiento: `name`, `sort_order`, `created_at`
- Acción personalizada: `products/` (productos de la categoría)

### `ProductViewSet`
**Funcionalidades**:
- CRUD completo de productos
- **Filtros avanzados**: `category`, `tags`, `price_min/max`, `is_featured`, `status`, `is_low_stock`
- **Búsqueda**: `name`, `description`, `sku`
- **Ordenamiento**: `name`, `price`, `created_at`, `stock_quantity`
- **Acciones personalizadas**:
  - `featured/`: Productos destacados
  - `low_stock/`: Productos con stock bajo
  - `stats/`: Estadísticas de productos
  - `export/`: Exportar a CSV/Excel
  - `import/`: Importar desde CSV/Excel
  - `update_stock/`: Actualizar stock masivo

### `TagViewSet`
**Funcionalidades**:
- CRUD completo de etiquetas
- Filtros: `is_active`
- Búsqueda: `name`
- Ordenamiento: `name`, `created_at`

### `ReviewViewSet`
**Funcionalidades**:
- CRUD completo de reseñas
- Filtros: `product`, `user`, `rating`, `is_approved`
- Búsqueda: `title`, `comment`
- Ordenamiento: `created_at`, `rating`, `helpful_votes`
- Acción personalizada: `helpful/` (marcar como útil)

## 📊 Características Avanzadas

### Caching
- **Cache de consultas** frecuentes (productos destacados, categorías)
- **Invalidación automática** mediante señales
- **TTL configurable** por tipo de dato

### Filtros Personalizados
```python
# Ejemplos de filtros disponibles
/api/products/?category=electronics
/api/products/?price_min=100&price_max=500
/api/products/?is_featured=true
/api/products/?is_low_stock=true
/api/products/?status=published
```

### Búsqueda Avanzada
```python
# Búsqueda en múltiples campos
/api/products/?search=laptop
/api/categories/?search=electronics
```

### Ordenamiento
```python
# Ordenamiento múltiple
/api/products/?ordering=-created_at,name
/api/products/?ordering=price
```

## 🔐 Permisos

**Configuración**: `IsAdminOrManagerOrReadOnly`
- **Lectura**: Todos los usuarios autenticados
- **Escritura**: Solo Admin y Manager
- **Eliminación**: Solo Admin

## 🎯 Señales (signals.py)

### Señales Implementadas
- **post_save Product**: Actualizar cache de productos destacados
- **post_delete Product**: Limpiar cache relacionado
- **post_save Review**: Recalcular rating promedio del producto
- **pre_save Product**: Validar stock mínimo

## 🔗 URLs (urls.py)

**Rutas principales**:
```python
/api/categories/          # CRUD categorías
/api/products/           # CRUD productos
/api/tags/               # CRUD etiquetas  
/api/reviews/            # CRUD reseñas
```

**Rutas personalizadas**:
```python
/api/products/featured/     # Productos destacados
/api/products/low_stock/    # Stock bajo
/api/products/stats/        # Estadísticas
/api/products/export/       # Exportar datos
/api/products/import/       # Importar datos
```

## 🛠️ Admin (admin.py)

### Configuraciones Personalizadas

#### `CategoryAdmin`
- **List display**: name, parent, is_active, product_count
- **Filtros**: is_active, parent
- **Búsqueda**: name, description
- **Acciones**: activate/deactivate categories
- **Campos calculados**: product_count

#### `ProductAdmin`
- **List display**: name, category, price, stock, status, is_featured
- **Filtros**: category, status, is_featured, is_active
- **Búsqueda**: name, sku, description
- **Inlines**: ReviewInline (reseñas del producto)
- **Acciones**: mark_as_featured, update_stock
- **Campos readonly**: profit_margin, average_rating

#### `ReviewAdmin`
- **List display**: product, user, rating, is_approved
- **Filtros**: rating, is_approved, is_verified
- **Búsqueda**: title, comment
- **Acciones**: approve/reject reviews

## 🚀 Uso de la API

### Crear Producto
```python
POST /api/products/
{
    "name": "Laptop Gaming",
    "description": "Laptop para gaming de alta gama",
    "category": 1,
    "price": "1299.99",
    "stock_quantity": 10,
    "sku": "LAP-001"
}
```

### Filtrar Productos
```python
GET /api/products/?category=1&price_min=500&is_featured=true
```

### Obtener Estadísticas
```python
GET /api/products/stats/
{
    "total_products": 150,
    "published_products": 120,
    "draft_products": 20,
    "featured_products": 15,
    "low_stock_products": 8
}
```

## 🔍 Consideraciones de Performance

1. **Consultas optimizadas** con select_related/prefetch_related
2. **Paginación automática** en todos los listados
3. **Cache de consultas** frecuentes
4. **Índices de base de datos** en campos de búsqueda
5. **Lazy loading** de imágenes y campos pesados

## 🧪 Testing

Para ejecutar tests específicos de esta app:
```bash
python manage.py test apps.core
```

## 📈 Métricas y Monitoreo

La app incluye endpoints para métricas:
- Productos más vendidos
- Categorías más populares  
- Estadísticas de reseñas
- Alertas de stock bajo

# Backend - Django REST Framework API

Professional Django REST Framework backend with JWT authentication, comprehensive API endpoints, and production-ready features.

## 🏗️ Architecture

```
backend/
├── config/                 # Django configuration
│   ├── settings/          # Environment-specific settings
│   │   ├── base.py        # Base settings
│   │   ├── development.py # Development settings
│   │   └── production.py  # Production settings
│   ├── urls.py            # Main URL configuration
│   └── api_urls.py        # API URL routing
├── apps/                  # Django applications
│   ├── users/            # User management
│   │   ├── models.py     # User and UserProfile models
│   │   ├── serializers.py # API serializers
│   │   ├── views.py      # ViewSets and API views
│   │   ├── permissions.py # Custom permissions
│   │   ├── signals.py    # Signal handlers
│   │   └── admin.py      # Admin interface
│   └── core/             # Core business logic
│       ├── models.py     # Product, Category, Tag, Review models
│       ├── serializers.py # API serializers
│       ├── views.py      # ViewSets and API views
│       ├── signals.py    # Signal handlers
│       └── admin.py      # Admin interface
├── tests/                # Test suites
│   ├── test_users.py     # User app tests
│   └── test_core.py      # Core app tests
├── requirements.txt      # Python dependencies
└── manage.py            # Django management script
```

## 🚀 Features

### Authentication & Authorization
- **JWT Authentication** with SimpleJWT
- **Role-based Access Control** (Admin, Manager, User)
- **Custom User Model** with extended profile
- **Token Refresh** mechanism
- **Permission Classes** for fine-grained access control

### API Features
- **RESTful API Design** following best practices
- **Automatic Documentation** with drf-spectacular
- **Pagination** with configurable page sizes
- **Filtering & Search** with django-filter
- **Ordering** by multiple fields
- **CORS Support** for cross-origin requests

### Data Models
- **User Management** with profiles and roles
- **Product Catalog** with categories and tags
- **Review System** with ratings and moderation
- **Hierarchical Categories** with parent-child relationships
- **Optimized Queries** with select_related and prefetch_related

### Performance & Caching
- **Redis Caching** for improved performance
- **Database Indexing** for optimized queries
- **Signal Handlers** for cache invalidation
- **Query Optimization** with annotations

### Development Features
- **Environment-based Configuration**
- **Comprehensive Test Suite**
- **Django Admin Interface**
- **Management Commands**
- **Database Migrations**

## 🛠️ Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (or SQLite for development)
- Redis (optional, for caching)

### Installation

1. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
```bash
# Copy environment template
cp ../env.example .env

# Edit environment variables
nano .env
```

4. **Database Setup**
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

5. **Start Development Server**
```bash
python manage.py runserver
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

Response:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Token Refresh
```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### User Registration
```http
POST /api/v1/users/register/
Content-Type: application/json

{
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User",
    "password": "securepassword123",
    "password_confirm": "securepassword123"
}
```

### User Management Endpoints

#### Current User Profile
```http
GET /api/v1/users/me/
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PATCH /api/v1/users/update_profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "date_of_birth": "1990-01-01",
    "city": "Barcelona",
    "country": "Spain"
}
```

### Product Endpoints

#### List Products
```http
GET /api/v1/products/
Authorization: Bearer <access_token>

# With filtering and search
GET /api/v1/products/?search=laptop&category=1&is_featured=true&ordering=-created_at
```

#### Product Details
```http
GET /api/v1/products/{slug}/
Authorization: Bearer <access_token>
```

#### Create Product (Admin/Manager only)
```http
POST /api/v1/products/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "name": "New Product",
    "description": "Product description",
    "category_id": 1,
    "price": "99.99",
    "stock_quantity": 10,
    "sku": "PROD-001",
    "status": "published",
    "tag_ids": [1, 2]
}
```

#### Add Product Review
```http
POST /api/v1/products/{slug}/add_review/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "rating": 5,
    "title": "Excellent product!",
    "content": "I highly recommend this product."
}
```

### Category Endpoints

#### List Categories
```http
GET /api/v1/categories/
Authorization: Bearer <access_token>
```

#### Root Categories Only
```http
GET /api/v1/categories/root_categories/
Authorization: Bearer <access_token>
```

#### Products in Category
```http
GET /api/v1/categories/{slug}/products/
Authorization: Bearer <access_token>
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_users.py -v

# Run with coverage
python -m pytest --cov=apps --cov-report=html

# Run specific test class
python -m pytest tests/test_users.py::UserModelTest -v

# Run specific test method
python -m pytest tests/test_users.py::UserAPITest::test_user_registration -v
```

### Test Structure
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and workflows
- **Model Tests**: Test database models and relationships
- **Authentication Tests**: Test JWT authentication flow

### Writing Tests
```python
# Example test file
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.is_active)

class UserAPITest(APITestCase):
    def test_user_registration(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        }
        response = self.client.post('/api/v1/users/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

## 🔧 Configuration

### Settings Structure
The project uses environment-specific settings:

- **base.py**: Common settings for all environments
- **development.py**: Development-specific settings
- **production.py**: Production-specific settings

### Environment Variables
```env
# Django Core
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=mesaifinal_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Cache
REDIS_URL=redis://127.0.0.1:6379/1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Custom Settings
```python
# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# DRF Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment
export DJANGO_SETTINGS_MODULE=config.settings.production

# Install production dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate
```

### Using Gunicorn
```bash
# Install Gunicorn
pip install gunicorn

# Start application
gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class gthread \
    --threads 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --keep-alive 5
```

### Nginx Configuration
```nginx
upstream django {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /path/to/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## 🔒 Security

### Security Features
- **JWT Token Authentication** with secure token handling
- **Password Hashing** using Django's built-in PBKDF2
- **CORS Configuration** for cross-origin requests
- **SQL Injection Protection** through Django ORM
- **XSS Protection** with security middleware
- **CSRF Protection** for form submissions
- **Secure Headers** configuration

### Security Best Practices
```python
# Production security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

## 📊 Performance

### Database Optimization
- **Indexes** on frequently queried fields
- **Select Related** for foreign key relationships
- **Prefetch Related** for many-to-many relationships
- **Database Connection Pooling**
- **Query Optimization** with annotations

### Caching Strategy
- **Redis Caching** for frequently accessed data
- **Cache Invalidation** through signals
- **Query Result Caching**
- **Session Caching**

### Monitoring
```python
# Add to settings for query monitoring
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## 🛠️ Management Commands

### Custom Management Commands
```python
# Create management command: management/commands/create_sample_data.py
from django.core.management.base import BaseCommand
from apps.core.models import Category, Product

class Command(BaseCommand):
    help = 'Create sample data for development'
    
    def handle(self, *args, **options):
        # Create sample categories and products
        category = Category.objects.create(
            name='Electronics',
            description='Electronic devices'
        )
        
        Product.objects.create(
            name='Sample Product',
            description='A sample product',
            category=category,
            price='99.99',
            stock_quantity=10,
            sku='SAMPLE-001'
        )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data')
        )
```

Usage:
```bash
python manage.py create_sample_data
```

## 🐛 Debugging

### Development Debugging
```python
# Add to development settings
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
}
```

### Using Django Debug Toolbar
```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    'debug_toolbar',
]

# Add to MIDDLEWARE
MIDDLEWARE = [
    # ...
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Configure internal IPs
INTERNAL_IPS = [
    '127.0.0.1',
]
```

## 📝 Code Style

### Python Code Standards
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Use **isort** for import sorting
- Use **flake8** for linting

```bash
# Format code
black .
isort .

# Check code style
flake8 .
```

### Documentation Standards
- Use **docstrings** for all functions and classes
- Follow **Google docstring format**
- Include **type hints** where appropriate

```python
def create_product(
    name: str, 
    category: Category, 
    price: Decimal
) -> Product:
    """
    Create a new product with the given parameters.
    
    Args:
        name: The product name
        category: The product category
        price: The product price
        
    Returns:
        The created product instance
        
    Raises:
        ValidationError: If the product data is invalid
    """
    return Product.objects.create(
        name=name,
        category=category,
        price=price
    )
```


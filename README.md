# Mesai Final - Professional Full-Stack Application

A professional-grade full-stack application built with **Django REST Framework** and **React TypeScript**, featuring **Telerik UI** components, JWT authentication, and comprehensive development tools.

## 🚀 Features

### Backend (Django + DRF)
- ✅ **Django REST Framework** with comprehensive API endpoints
- ✅ **JWT Authentication** using SimpleJWT
- ✅ **Role-based Access Control** (Admin, Manager, User)
- ✅ **Automatic API Documentation** with drf-spectacular (Swagger/OpenAPI)
- ✅ **Redis Caching** for improved performance
- ✅ **Database Signals** for business logic automation
- ✅ **Comprehensive Test Suite** (Unit & Integration tests)
- ✅ **PostgreSQL** database with optimized queries
- ✅ **Environment-based Configuration** (Development/Production)

### Frontend (React + TypeScript)
- ✅ **React 18** with **TypeScript** for type safety
- ✅ **Telerik UI Components** for professional interface
- ✅ **React Router** for client-side routing
- ✅ **Context API** for global state management
- ✅ **Custom Hooks** for API integration and reusability
- ✅ **ESLint + Prettier** for code quality
- ✅ **Responsive Design** with modern CSS
- ✅ **Error Handling** and loading states
- ✅ **Notification System** with Telerik components

### DevOps & Development
- ✅ **Docker Compose** for development environment
- ✅ **Nginx** reverse proxy configuration
- ✅ **Makefile** with convenient development commands
- ✅ **Hot Reload** for both backend and frontend
- ✅ **Database Migrations** and fixtures
- ✅ **Code Formatting** and linting tools

## 🏗️ Architecture

```
mesaifinal/
├── backend/                 # Django REST Framework API
│   ├── config/             # Django settings and configuration
│   ├── apps/               # Django applications
│   │   ├── users/          # User management and authentication
│   │   └── core/           # Core business logic (Products, Categories)
│   ├── tests/              # Test suites
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── context/        # React Context providers
│   │   ├── types/          # TypeScript type definitions
│   │   └── constants/      # Application constants
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Development environment
├── Makefile               # Development commands
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose**
- **Make** (optional, for convenience commands)
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mesaifinal
```

### 2. Environment Setup
```bash
# Copy environment variables
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Start Development Environment
```bash
# Using Make (recommended)
make dev-up

# Or using Docker Compose directly
docker-compose up -d
```

### 4. Initialize Database
```bash
# Run migrations
make migrate

# Create superuser
make createsuperuser

# Load sample data (optional)
make load-fixtures
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1/
- **API Documentation**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin/

## 🛠️ Development

### Available Commands

```bash
# Development Environment
make dev-up              # Start all services
make dev-down            # Stop all services
make dev-restart         # Restart services
make dev-logs            # View logs

# Database Management
make migrate             # Run migrations
make makemigrations      # Create migrations
make createsuperuser     # Create Django superuser

# Testing
make test-backend        # Run backend tests
make test-frontend       # Run frontend tests

# Code Quality
make lint-backend        # Lint Python code
make lint-frontend       # Lint TypeScript code
make format-backend      # Format Python code
make format-frontend     # Format TypeScript code

# Shell Access
make backend-shell       # Backend container shell
make frontend-shell      # Frontend container shell
make db-shell           # Database shell
make redis-shell        # Redis shell
```

### Local Development (without Docker)

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export DJANGO_SETTINGS_MODULE=config.settings.development

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📚 API Documentation

The API is fully documented using OpenAPI/Swagger specification:
- **Interactive Docs**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/refresh/` - Refresh JWT token
- `POST /api/v1/users/register/` - User registration

#### Users
- `GET /api/v1/users/me/` - Current user profile
- `PATCH /api/v1/users/update_profile/` - Update profile
- `GET /api/v1/users/` - List users (admin only)

#### Products
- `GET /api/v1/products/` - List products
- `POST /api/v1/products/` - Create product (admin/manager)
- `GET /api/v1/products/{slug}/` - Product details
- `GET /api/v1/products/featured/` - Featured products

#### Categories
- `GET /api/v1/categories/` - List categories
- `GET /api/v1/categories/root_categories/` - Root categories only
- `GET /api/v1/categories/{slug}/products/` - Products in category

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
make test-backend

# Run specific test file
docker-compose exec backend python -m pytest tests/test_users.py -v

# Run with coverage
docker-compose exec backend python -m pytest --cov=apps --cov-report=html
```

### Frontend Tests
```bash
# Run all tests
make test-frontend

# Run tests in watch mode
docker-compose exec frontend npm test

# Generate coverage report
docker-compose exec frontend npm test -- --coverage --watchAll=false
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=mesaifinal_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://127.0.0.1:6379/1

# Email (for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend Configuration

The frontend configuration is handled through environment variables:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🚢 Production Deployment

### Using Docker Compose

1. **Create production environment file**:
```bash
cp env.example .env.prod
# Edit .env.prod with production values
```

2. **Build and deploy**:
```bash
make build-prod
make deploy-prod
```

### Manual Deployment

#### Backend (Django)
```bash
# Install dependencies
pip install -r requirements.txt

# Set production environment
export DJANGO_SETTINGS_MODULE=config.settings.production

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend (React)
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve with a web server (nginx, apache, etc.)
```

## 🔒 Security

### Backend Security Features
- JWT token authentication with refresh mechanism
- Role-based access control (RBAC)
- CORS configuration for cross-origin requests
- SQL injection protection through Django ORM
- XSS protection with Django security middleware
- CSRF protection for form submissions
- Rate limiting (configured in Nginx)

### Frontend Security Features
- TypeScript for type safety
- Input validation and sanitization
- Secure token storage
- Protected routes based on authentication
- Error boundary components

## 🎨 UI/UX

### Design System
- **Telerik UI Components** for consistent design
- **Responsive Design** for mobile and desktop
- **Dark/Light Mode** support (configurable)
- **Accessibility** features (WCAG compliance)
- **Loading States** and error handling
- **Professional Color Scheme** and typography

### Key UI Features
- Professional dashboard with metrics and charts
- Data grid with sorting, filtering, and pagination
- Form components with validation
- Notification system for user feedback
- Modal dialogs and confirmation prompts
- Responsive navigation with collapsible sidebar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow PEP8 for Python code
- Use ESLint and Prettier for TypeScript/React
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Django** and **Django REST Framework** teams
- **React** and **TypeScript** communities
- **Progress Telerik** for UI components
- **Docker** for containerization
- All open-source contributors

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API docs at `/api/docs/`

---

**Built with ❤️ using Django, React, and TypeScript**

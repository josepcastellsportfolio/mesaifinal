# Makefile for Mesai Final project
# Provides convenient commands for development and deployment

.PHONY: help install-backend install-frontend install dev-up dev-down dev-restart dev-logs backend-shell frontend-shell db-shell redis-shell migrate makemigrations createsuperuser collectstatic test-backend test-frontend lint-backend lint-frontend format-backend format-frontend clean build-prod deploy-prod backup restore

# Default target
help:
	@echo "Mesai Final - Professional Django + React Application"
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  install              Install all dependencies"
	@echo "  install-backend      Install backend dependencies"
	@echo "  install-frontend     Install frontend dependencies"
	@echo "  dev-up               Start development environment"
	@echo "  dev-down             Stop development environment"
	@echo "  dev-restart          Restart development environment"
	@echo "  dev-logs             Show development logs"
	@echo ""
	@echo "Shell Access:"
	@echo "  backend-shell        Access backend container shell"
	@echo "  frontend-shell       Access frontend container shell"
	@echo "  db-shell             Access database shell"
	@echo "  redis-shell          Access Redis shell"
	@echo ""
	@echo "Django Management:"
	@echo "  migrate              Run database migrations"
	@echo "  makemigrations       Create new migrations"
	@echo "  createsuperuser      Create Django superuser"
	@echo "  collectstatic        Collect static files"
	@echo ""
	@echo "Testing:"
	@echo "  test-backend         Run backend tests"
	@echo "  test-frontend        Run frontend tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint-backend         Lint backend code"
	@echo "  lint-frontend        Lint frontend code"
	@echo "  format-backend       Format backend code"
	@echo "  format-frontend      Format frontend code"
	@echo ""
	@echo "Production:"
	@echo "  build-prod           Build production images"
	@echo "  deploy-prod          Deploy to production"
	@echo ""
	@echo "Utilities:"
	@echo "  clean                Clean up containers and volumes"
	@echo "  backup               Backup database"
	@echo "  restore              Restore database from backup"

# Installation
install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Development Environment
dev-up:
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Services are starting up..."
	@echo "Backend will be available at: http://localhost:8000"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "API Documentation: http://localhost:8000/api/docs/"

dev-down:
	@echo "Stopping development environment..."
	docker-compose down

dev-restart:
	@echo "Restarting development environment..."
	docker-compose restart

dev-logs:
	docker-compose logs -f

# Shell Access
backend-shell:
	docker-compose exec backend bash

frontend-shell:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec db psql -U postgres -d mesaifinal_db

redis-shell:
	docker-compose exec redis redis-cli

# Django Management
migrate:
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

# Testing
test-backend:
	@echo "Running backend tests..."
	docker-compose exec backend python -m pytest -v

test-frontend:
	@echo "Running frontend tests..."
	docker-compose exec frontend npm test -- --coverage --watchAll=false

# Code Quality
lint-backend:
	@echo "Linting backend code..."
	cd backend && flake8 .
	cd backend && black --check .
	cd backend && isort --check-only .

lint-frontend:
	@echo "Linting frontend code..."
	cd frontend && npm run lint

format-backend:
	@echo "Formatting backend code..."
	cd backend && black .
	cd backend && isort .

format-frontend:
	@echo "Formatting frontend code..."
	cd frontend && npm run format

# Production
build-prod:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build

deploy-prod:
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d --build

# Utilities
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

backup:
	@echo "Creating database backup..."
	docker-compose exec db pg_dump -U postgres mesaifinal_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file path: " backup_file; \
	docker-compose exec -T db psql -U postgres -d mesaifinal_db < $$backup_file

# Local Development (without Docker)
dev-backend:
	@echo "Starting backend development server..."
	cd backend && python manage.py runserver

dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm start

# Database management
reset-db:
	@echo "Resetting database..."
	docker-compose down
	docker volume rm mesaifinal_postgres_data || true
	docker-compose up -d db
	sleep 5
	$(MAKE) migrate
	$(MAKE) createsuperuser

# Load sample data
load-fixtures:
	@echo "Loading sample data..."
	docker-compose exec backend python manage.py loaddata fixtures/sample_data.json

# Generate sample data
generate-data:
	@echo "Generating sample data..."
	docker-compose exec backend python manage.py shell -c "from django.core.management import call_command; call_command('create_sample_data')"

# Security check
security-check:
	@echo "Running security checks..."
	cd backend && python manage.py check --deploy
	cd frontend && npm audit

# Performance monitoring
monitor:
	@echo "Monitoring services..."
	docker stats

# View service status
status:
	@echo "Service status:"
	docker-compose ps


# Deployment Guide

This guide covers various deployment strategies for the Mesai Final application, from development to production environments.

## 📋 Table of Contents

- [Development Environment](#development-environment)
- [Staging Environment](#staging-environment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Development Environment

### Local Development Setup

#### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

#### Quick Start with Docker
```bash
# Clone repository
git clone <https://github.com/josepcastellsportfolio/mesaifinal>
cd mesaifinal

# Copy environment variables
cp env.example .env

# Start all services
make dev-up

# Initialize database
make migrate
make createsuperuser

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/api/docs/
```

#### Manual Setup

**Backend Setup:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DJANGO_SETTINGS_MODULE=config.settings.development

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Variables

Create `.env` file with the following variables:

```env
# Django Settings
SECRET_KEY=your-development-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database
DB_NAME=mesaifinal_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Cache
REDIS_URL=redis://127.0.0.1:6379/1

# Frontend
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🎭 Staging Environment

### Staging Setup

Staging environment should mirror production as closely as possible:

```bash
# Create staging environment file
cp env.example .env.staging

# Update staging-specific variables
nano .env.staging
```

**Staging Environment Variables:**
```env
# Django Settings
SECRET_KEY=your-staging-secret-key
DEBUG=False
ALLOWED_HOSTS=staging.yourdomain.com

# Database
DB_NAME=mesaifinal_staging
DB_USER=staging_user
DB_PASSWORD=secure_staging_password
DB_HOST=staging-db.yourdomain.com
DB_PORT=5432

# Cache
REDIS_URL=redis://staging-redis.yourdomain.com:6379/1

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000

# Frontend
REACT_APP_API_URL=https://staging-api.yourdomain.com/api/v1
REACT_APP_ENVIRONMENT=staging
```

### Staging Deployment

```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d --build

# Run migrations
docker-compose -f docker-compose.staging.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.staging.yml exec backend python manage.py collectstatic --noinput

# Load test data
docker-compose -f docker-compose.staging.yml exec backend python manage.py loaddata fixtures/staging_data.json
```

## 🚀 Production Deployment

### Production Environment Setup

#### Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Network**: HTTPS certificate (Let's Encrypt recommended)

#### Security Hardening

**1. System Updates**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw fail2ban
```

**2. Firewall Configuration**
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

**3. SSL Certificate (Let's Encrypt)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

#### Production Environment Variables

```env
# Django Settings
SECRET_KEY=your-super-secure-production-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com

# Database (Production)
DB_NAME=mesaifinal_prod
DB_USER=prod_user
DB_PASSWORD=very_secure_production_password
DB_HOST=prod-db.yourdomain.com
DB_PORT=5432

# Cache (Production)
REDIS_URL=redis://prod-redis.yourdomain.com:6379/1

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Email Configuration
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your_email_password

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
REACT_APP_ENVIRONMENT=production
```

### Manual Production Deployment

#### Backend Deployment

**1. Install System Dependencies**
```bash
sudo apt install -y python3 python3-pip python3-venv nginx postgresql-client redis-tools
```

**2. Create Application User**
```bash
sudo adduser --system --group --home /opt/mesaifinal mesaifinal
sudo mkdir -p /opt/mesaifinal/{backend,frontend,logs,static,media}
sudo chown -R mesaifinal:mesaifinal /opt/mesaifinal
```

**3. Deploy Backend Code**
```bash
sudo -u mesaifinal git clone <repository-url> /opt/mesaifinal/source
cd /opt/mesaifinal/source/backend

# Create virtual environment
sudo -u mesaifinal python3 -m venv /opt/mesaifinal/venv
sudo -u mesaifinal /opt/mesaifinal/venv/bin/pip install -r requirements.txt

# Set environment variables
sudo -u mesaifinal cp .env.production /opt/mesaifinal/.env

# Run migrations and collect static files
sudo -u mesaifinal /opt/mesaifinal/venv/bin/python manage.py migrate
sudo -u mesaifinal /opt/mesaifinal/venv/bin/python manage.py collectstatic --noinput
```

**4. Create Gunicorn Service**
```bash
sudo nano /etc/systemd/system/mesaifinal.service
```

```ini
[Unit]
Description=Mesai Final Django Application
After=network.target

[Service]
User=mesaifinal
Group=mesaifinal
WorkingDirectory=/opt/mesaifinal/source/backend
Environment=DJANGO_SETTINGS_MODULE=config.settings.production
EnvironmentFile=/opt/mesaifinal/.env
ExecStart=/opt/mesaifinal/venv/bin/gunicorn \
    --workers 4 \
    --worker-class gthread \
    --threads 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --bind unix:/opt/mesaifinal/mesaifinal.sock \
    config.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**5. Start Backend Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable mesaifinal
sudo systemctl start mesaifinal
sudo systemctl status mesaifinal
```

#### Frontend Deployment

**1. Build Frontend**
```bash
cd /opt/mesaifinal/source/frontend
sudo -u mesaifinal npm ci --production
sudo -u mesaifinal npm run build
sudo -u mesaifinal cp -r build/* /opt/mesaifinal/frontend/
```

**2. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/mesaifinal
```

```nginx
# Frontend Server
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    root /opt/mesaifinal/frontend;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /index.html {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}

# API Server
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration (same as above)
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://unix:/opt/mesaifinal/mesaifinal.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS Headers
        add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /admin/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://unix:/opt/mesaifinal/mesaifinal.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /opt/mesaifinal/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /opt/mesaifinal/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

**3. Enable Site and Restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/mesaifinal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🐳 Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: mesaifinal_prod_db
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - mesaifinal_prod_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: mesaifinal_prod_redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - mesaifinal_prod_network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: mesaifinal_prod_backend
    env_file: .env.prod
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - db
      - redis
    networks:
      - mesaifinal_prod_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: mesaifinal_prod_frontend
    env_file: .env.prod
    volumes:
      - frontend_build:/app/build
    networks:
      - mesaifinal_prod_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: mesaifinal_prod_nginx
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_volume:/var/www/static
      - media_volume:/var/www/media
      - frontend_build:/var/www/html
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend
    networks:
      - mesaifinal_prod_network
    restart: unless-stopped

volumes:
  postgres_prod_data:
  redis_prod_data:
  static_volume:
  media_volume:
  frontend_build:

networks:
  mesaifinal_prod_network:
    driver: bridge
```

### Production Dockerfiles

**Backend Production Dockerfile:**
```dockerfile
# backend/Dockerfile.prod
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r django && useradd -r -g django django

WORKDIR /app

# Copy Python dependencies
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . /app/

# Create directories and set permissions
RUN mkdir -p /app/staticfiles /app/media /app/logs \
    && chown -R django:django /app

USER django

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

**Frontend Production Dockerfile:**
```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker

```bash
# Create production environment
cp env.example .env.prod

# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS Elastic Beanstalk

**1. Install EB CLI**
```bash
pip install awsebcli
```

**2. Initialize EB Application**
```bash
eb init mesaifinal-prod
eb create production
```

**3. Configure Environment Variables**
```bash
eb setenv SECRET_KEY=your-secret-key \
         DEBUG=False \
         DB_HOST=your-rds-endpoint \
         REDIS_URL=your-elasticache-endpoint
```

**4. Deploy**
```bash
eb deploy
```

#### Using AWS ECS with Fargate

**1. Create Task Definition**
```json
{
  "family": "mesaifinal-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/mesaifinal-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DJANGO_SETTINGS_MODULE",
          "value": "config.settings.production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mesaifinal-prod",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### Using Cloud Run

**1. Build and Push Images**
```bash
# Build backend
gcloud builds submit --tag gcr.io/PROJECT_ID/mesaifinal-backend backend/

# Build frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/mesaifinal-frontend frontend/
```

**2. Deploy Services**
```bash
# Deploy backend
gcloud run deploy mesaifinal-backend \
  --image gcr.io/PROJECT_ID/mesaifinal-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy mesaifinal-frontend \
  --image gcr.io/PROJECT_ID/mesaifinal-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Heroku Deployment

**1. Install Heroku CLI and Login**
```bash
heroku login
```

**2. Create Heroku Apps**
```bash
heroku create mesaifinal-backend
heroku create mesaifinal-frontend
```

**3. Configure Backend**
```bash
cd backend
heroku config:set DJANGO_SETTINGS_MODULE=config.settings.production
heroku config:set SECRET_KEY=your-secret-key
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

**4. Configure Frontend**
```bash
cd frontend
heroku config:set REACT_APP_API_URL=https://mesaifinal-backend.herokuapp.com/api/v1

# Deploy
git push heroku main
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install backend dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run backend tests
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost/test_db
        REDIS_URL: redis://localhost:6379/1
      run: |
        cd backend
        python -m pytest
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm test -- --coverage --watchAll=false
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      env:
        DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      run: |
        echo "$DEPLOY_KEY" > deploy_key
        chmod 600 deploy_key
        
        ssh -i deploy_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
          cd /opt/mesaifinal
          git pull origin main
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d --build
          docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate
          docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
        EOF
        
        rm deploy_key
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  POSTGRES_DB: test_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_HOST_AUTH_METHOD: trust

services:
  - postgres:15
  - redis:7

test_backend:
  stage: test
  image: python:3.11
  before_script:
    - cd backend
    - pip install -r requirements.txt
  script:
    - python -m pytest
  coverage: '/TOTAL.+ ([0-9]{1,3}%)/'

test_frontend:
  stage: test
  image: node:18
  before_script:
    - cd frontend
    - npm ci
  script:
    - npm test -- --coverage --watchAll=false

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA backend/
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA frontend/
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA

deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd /opt/mesaifinal &&
        docker pull $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA &&
        docker pull $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA &&
        docker-compose -f docker-compose.prod.yml down &&
        docker-compose -f docker-compose.prod.yml up -d"
  only:
    - main
```

## 📊 Monitoring & Maintenance

### Application Monitoring

#### Health Checks
```python
# backend/apps/core/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    """Health check endpoint for monitoring."""
    try:
        # Check database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check cache
        cache.set('health_check', 'ok', 60)
        cache_status = cache.get('health_check')
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'ok',
            'cache': 'ok' if cache_status else 'error',
            'version': '1.0.0'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)
```

#### Logging Configuration
```python
# config/settings/production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            'format': '{"level": "%(levelname)s", "time": "%(asctime)s", "module": "%(module)s", "message": "%(message)s"}',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/opt/mesaifinal/logs/django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/opt/mesaifinal/logs/django_error.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'error_file'],
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Database Maintenance

#### Backup Scripts
```bash
#!/bin/bash
# backup.sh - Database backup script

BACKUP_DIR="/opt/mesaifinal/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mesaifinal_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U prod_user $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

#### Automated Backups with Cron
```bash
# Add to crontab: crontab -e
# Daily backup at 2 AM
0 2 * * * /opt/mesaifinal/scripts/backup.sh

# Weekly cleanup of logs
0 3 * * 0 find /opt/mesaifinal/logs -name "*.log" -mtime +30 -delete
```

### Performance Monitoring

#### System Monitoring with Prometheus
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  node_exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'

volumes:
  prometheus_data:
  grafana_data:
```

### Security Updates

#### Automated Security Updates
```bash
#!/bin/bash
# security-updates.sh - Automated security updates

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Update Python dependencies
cd /opt/mesaifinal/source/backend
source /opt/mesaifinal/venv/bin/activate
pip list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 pip install -U

# Update Node.js dependencies
cd /opt/mesaifinal/source/frontend
npm audit fix

# Restart services
sudo systemctl restart mesaifinal
sudo systemctl restart nginx

echo "Security updates completed"
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**1. Database Connection Error**
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U prod_user -d mesaifinal_prod

# Check Django database settings
python manage.py dbshell
```

**2. Static Files Not Loading**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx

# Check file permissions
ls -la /opt/mesaifinal/static/
```

**3. High Memory Usage**
```bash
# Check Gunicorn processes
ps aux | grep gunicorn

# Reduce workers in production
# Edit /etc/systemd/system/mesaifinal.service
--workers 2  # Reduce from 4 to 2

sudo systemctl daemon-reload
sudo systemctl restart mesaifinal
```

#### Frontend Issues

**1. API Connection Failed**
```bash
# Check API endpoint
curl -I https://api.yourdomain.com/api/v1/

# Check CORS settings
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.yourdomain.com/api/v1/
```

**2. Build Failures**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Docker Issues

**1. Container Won't Start**
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs backend

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

**2. Volume Permission Issues**
```bash
# Fix volume permissions
sudo chown -R 1000:1000 /var/lib/docker/volumes/mesaifinal_static_volume
sudo chown -R 1000:1000 /var/lib/docker/volumes/mesaifinal_media_volume
```

### Log Analysis

#### Analyzing Django Logs
```bash
# View recent errors
tail -f /opt/mesaifinal/logs/django_error.log

# Search for specific errors
grep -i "error" /opt/mesaifinal/logs/django.log | tail -20

# Analyze request patterns
awk '{print $4}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

#### Performance Analysis
```bash
# Check system resources
htop
iotop
df -h

# Analyze slow queries
sudo -u postgres psql mesaifinal_prod -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"
```

### Emergency Procedures

#### Rollback Deployment
```bash
# Rollback to previous version
cd /opt/mesaifinal/source
git log --oneline -10  # Find previous commit
git checkout <previous-commit-hash>

# Restart services
sudo systemctl restart mesaifinal
docker-compose -f docker-compose.prod.yml restart
```

#### Database Recovery
```bash
# Restore from backup
gunzip -c /opt/mesaifinal/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
psql -h localhost -U prod_user mesaifinal_prod
```

#### Emergency Maintenance Mode
```nginx
# Add to Nginx configuration
location / {
    return 503 'Service temporarily unavailable. Please try again later.';
    add_header Content-Type text/plain always;
}
```

This deployment guide provides comprehensive instructions for deploying the Mesai Final application across different environments and platforms. Choose the deployment strategy that best fits your infrastructure and requirements.

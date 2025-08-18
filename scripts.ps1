# PowerShell scripts for Windows development
# Alternative to Makefile commands for Windows users

param(
    [Parameter(Position=0)]
    [string]$Command
)

function Show-Help {
    Write-Host "Mesai Final - PowerShell Scripts for Windows" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Development:" -ForegroundColor Cyan
    Write-Host "  dev-up               Start development environment"
    Write-Host "  dev-down             Stop development environment"
    Write-Host "  dev-restart          Restart development environment"
    Write-Host "  dev-logs             Show development logs"
    Write-Host ""
    Write-Host "Database Management:" -ForegroundColor Cyan
    Write-Host "  migrate              Run database migrations"
    Write-Host "  makemigrations       Create new migrations"
    Write-Host "  createsuperuser      Create Django superuser"
    Write-Host "  collectstatic        Collect static files"
    Write-Host ""
    Write-Host "Shell Access:" -ForegroundColor Cyan
    Write-Host "  backend-shell        Access backend container shell"
    Write-Host "  frontend-shell       Access frontend container shell"
    Write-Host "  db-shell             Access database shell"
    Write-Host "  redis-shell          Access Redis shell"
    Write-Host ""
    Write-Host "Testing:" -ForegroundColor Cyan
    Write-Host "  test-backend         Run backend tests"
    Write-Host "  test-frontend        Run frontend tests"
    Write-Host ""
    Write-Host "Code Quality:" -ForegroundColor Cyan
    Write-Host "  lint-backend         Lint backend code"
    Write-Host "  lint-frontend        Lint frontend code"
    Write-Host "  format-backend       Format backend code"
    Write-Host "  format-frontend      Format frontend code"
    Write-Host ""
    Write-Host "Utilities:" -ForegroundColor Cyan
    Write-Host "  clean                Clean up containers and volumes"
    Write-Host "  status               Show service status"
    Write-Host ""
    Write-Host "Usage: .\scripts.ps1 <command>" -ForegroundColor White
    Write-Host "Example: .\scripts.ps1 dev-up" -ForegroundColor Gray
}

function Start-DevEnvironment {
    Write-Host "Starting development environment..." -ForegroundColor Green
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services are starting up..." -ForegroundColor Yellow
        Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "API Documentation: http://localhost:8000/api/docs/" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to start development environment" -ForegroundColor Red
        exit 1
    }
}

function Stop-DevEnvironment {
    Write-Host "Stopping development environment..." -ForegroundColor Yellow
    docker-compose down
}

function Restart-DevEnvironment {
    Write-Host "Restarting development environment..." -ForegroundColor Yellow
    docker-compose restart
}

function Show-DevLogs {
    docker-compose logs -f
}

function Run-Migrations {
    Write-Host "Running database migrations..." -ForegroundColor Green
    docker-compose exec backend python manage.py migrate
}

function Make-Migrations {
    Write-Host "Creating new migrations..." -ForegroundColor Green
    docker-compose exec backend python manage.py makemigrations
}

function Create-SuperUser {
    Write-Host "Creating Django superuser..." -ForegroundColor Green
    docker-compose exec backend python manage.py createsuperuser
}

function Collect-StaticFiles {
    Write-Host "Collecting static files..." -ForegroundColor Green
    docker-compose exec backend python manage.py collectstatic --noinput
}

function Enter-BackendShell {
    Write-Host "Accessing backend container shell..." -ForegroundColor Green
    docker-compose exec backend bash
}

function Enter-FrontendShell {
    Write-Host "Accessing frontend container shell..." -ForegroundColor Green
    docker-compose exec frontend sh
}

function Enter-DbShell {
    Write-Host "Accessing database shell..." -ForegroundColor Green
    docker-compose exec db psql -U postgres -d mesaifinal_db
}

function Enter-RedisShell {
    Write-Host "Accessing Redis shell..." -ForegroundColor Green
    docker-compose exec redis redis-cli
}

function Test-Backend {
    Write-Host "Running backend tests..." -ForegroundColor Green
    docker-compose exec backend python -m pytest -v
}

function Test-Frontend {
    Write-Host "Running frontend tests..." -ForegroundColor Green
    docker-compose exec frontend npm test -- --coverage --watchAll=false
}

function Lint-Backend {
    Write-Host "Linting backend code..." -ForegroundColor Green
    Set-Location backend
    if (Test-Path "venv\Scripts\activate.ps1") {
        . .\venv\Scripts\activate.ps1
        flake8 .
        black --check .
        isort --check-only .
        deactivate
    } else {
        Write-Host "Virtual environment not found. Run from Docker container:" -ForegroundColor Yellow
        docker-compose exec backend flake8 .
        docker-compose exec backend black --check .
        docker-compose exec backend isort --check-only .
    }
    Set-Location ..
}

function Lint-Frontend {
    Write-Host "Linting frontend code..." -ForegroundColor Green
    Set-Location frontend
    if (Test-Path "node_modules") {
        npm run lint
    } else {
        Write-Host "Node modules not found. Run from Docker container:" -ForegroundColor Yellow
        Set-Location ..
        docker-compose exec frontend npm run lint
    }
    if ((Get-Location).Path -notlike "*mesaifinal") {
        Set-Location ..
    }
}

function Format-Backend {
    Write-Host "Formatting backend code..." -ForegroundColor Green
    Set-Location backend
    if (Test-Path "venv\Scripts\activate.ps1") {
        . .\venv\Scripts\activate.ps1
        black .
        isort .
        deactivate
    } else {
        Write-Host "Virtual environment not found. Run from Docker container:" -ForegroundColor Yellow
        docker-compose exec backend black .
        docker-compose exec backend isort .
    }
    Set-Location ..
}

function Format-Frontend {
    Write-Host "Formatting frontend code..." -ForegroundColor Green
    Set-Location frontend
    if (Test-Path "node_modules") {
        npm run format
    } else {
        Write-Host "Node modules not found. Run from Docker container:" -ForegroundColor Yellow
        Set-Location ..
        docker-compose exec frontend npm run format
    }
    if ((Get-Location).Path -notlike "*mesaifinal") {
        Set-Location ..
    }
}

function Clean-Environment {
    Write-Host "Cleaning up containers and volumes..." -ForegroundColor Yellow
    docker-compose down -v
    docker system prune -f
    docker volume prune -f
}

function Show-Status {
    Write-Host "Service status:" -ForegroundColor Green
    docker-compose ps
}

# Main script logic
switch ($Command) {
    "dev-up" { Start-DevEnvironment }
    "dev-down" { Stop-DevEnvironment }
    "dev-restart" { Restart-DevEnvironment }
    "dev-logs" { Show-DevLogs }
    "migrate" { Run-Migrations }
    "makemigrations" { Make-Migrations }
    "createsuperuser" { Create-SuperUser }
    "collectstatic" { Collect-StaticFiles }
    "backend-shell" { Enter-BackendShell }
    "frontend-shell" { Enter-FrontendShell }
    "db-shell" { Enter-DbShell }
    "redis-shell" { Enter-RedisShell }
    "test-backend" { Test-Backend }
    "test-frontend" { Test-Frontend }
    "lint-backend" { Lint-Backend }
    "lint-frontend" { Lint-Frontend }
    "format-backend" { Format-Backend }
    "format-frontend" { Format-Frontend }
    "clean" { Clean-Environment }
    "status" { Show-Status }
    "help" { Show-Help }
    "" { Show-Help }
    default { 
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}


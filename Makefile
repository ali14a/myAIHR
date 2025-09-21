# Resume Scanner Makefile
# Provides convenient commands for development and deployment

.PHONY: help install dev build start stop clean test lint docker-dev docker-prod setup

# Default target
help:
	@echo "Resume Scanner - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make setup      - Initial project setup"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development servers"
	@echo "  make start      - Start production servers"
	@echo "  make stop       - Stop all services"
	@echo "  make clean      - Clean up generated files"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run linting"
	@echo "  make build      - Build for production"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev  - Start with Docker (development)"
	@echo "  make docker-prod - Start with Docker (production)"
	@echo "  make docker-down - Stop Docker containers"
	@echo ""
	@echo "Database:"
	@echo "  make db-reset    - Reset database"
	@echo "  make db-migrate  - Run database migrations"
	@echo ""

# Setup commands
setup:
	@echo "Setting up Resume Scanner project..."
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

install:
	@echo "Installing dependencies..."
	@npm install
	@cd frontend && npm install
	@cd backend && python3 -m venv venv
	@cd backend && source venv/bin/activate && pip install -r requirements.txt

# Development commands
dev:
	@echo "Starting development servers..."
	@npm run dev

start:
	@echo "Starting production servers..."
	@npm run start

stop:
	@echo "Stopping all services..."
	@./scripts/dev.sh stop

# Build commands
build:
	@echo "Building for production..."
	@npm run build

# Testing commands
test:
	@echo "Running tests..."
	@npm run test

lint:
	@echo "Running linting..."
	@npm run lint

# Clean commands
clean:
	@echo "Cleaning up..."
	@npm run clean

# Docker commands
docker-dev:
	@echo "Starting with Docker (development)..."
	@docker-compose -f docker-compose.dev.yml up --build

docker-prod:
	@echo "Starting with Docker (production)..."
	@docker-compose -f docker-compose.prod.yml up --build

docker-down:
	@echo "Stopping Docker containers..."
	@docker-compose down

# Database commands
db-reset:
	@echo "Resetting database..."
	@cd backend && source venv/bin/activate && python -c "from scripts.database import engine, Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"

db-migrate:
	@echo "Running database migrations..."
	@cd backend && source venv/bin/activate && alembic upgrade head

# Quick start for new developers
quickstart: setup dev
	@echo "Quick start completed! Visit http://localhost:5173"

# Production deployment
deploy:
	@echo "Deploying to production..."
	@make build
	@make docker-prod

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend not responding"
	@curl -f http://localhost:5173 || echo "Frontend not responding"

# Logs
logs:
	@echo "Showing logs..."
	@docker-compose logs -f

# Backup database
backup:
	@echo "Backing up database..."
	@cp backend/database/resume.db backend/database/resume_backup_$(shell date +%Y%m%d_%H%M%S).db

# Restore database
restore:
	@echo "Available backups:"
	@ls -la backend/database/resume_backup_*.db
	@echo "To restore, run: cp backend/database/resume_backup_YYYYMMDD_HHMMSS.db backend/database/resume.db"


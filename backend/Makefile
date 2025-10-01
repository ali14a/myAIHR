# Backend Docker Makefile
# Provides convenient commands for Docker development and deployment

.PHONY: help dev prod build run stop clean logs shell health test

# Default target
help:
	@echo "Backend Docker Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make stop         - Stop environment"
	@echo "  make logs         - View logs"
	@echo "  make shell        - Enter container shell"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make stop-prod    - Stop production environment"
	@echo "  make logs-prod    - View production logs"
	@echo ""
	@echo "Build:"
	@echo "  make build        - Build image"
	@echo "  make run          - Run container manually"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Clean up Docker resources"
	@echo "  make health       - Check container health"
	@echo "  make test         - Run tests"

# Development commands
dev:
	@echo "Starting development environment..."
	@docker-compose up --build

stop:
	@echo "Stopping environment..."
	@docker-compose down

logs:
	@echo "Viewing logs..."
	@docker-compose logs -f

shell:
	@echo "Entering container shell..."
	@docker-compose exec backend sh

# Production commands
prod:
	@echo "Starting production environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

stop-prod:
	@echo "Stopping production environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

logs-prod:
	@echo "Viewing production logs..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Build commands
build:
	@echo "Building image..."
	@docker build -t resume-scanner-backend .

run:
	@echo "Running container..."
	@docker run -p 8000:8000 -v $(PWD)/uploads:/app/uploads -v $(PWD)/logs:/app/logs -v $(PWD)/database:/app/database resume-scanner-backend

# Maintenance commands
clean:
	@echo "Cleaning up Docker resources..."
	@docker system prune -f
	@docker volume prune -f

health:
	@echo "Checking container health..."
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

test:
	@echo "Running tests..."
	@docker-compose exec backend python -m pytest

# Database commands
db-reset:
	@echo "Resetting database..."
	@docker-compose exec backend python -c "from scripts.database import engine, Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"

db-migrate:
	@echo "Running database migrations..."
	@docker-compose exec backend alembic upgrade head

# Quick start
quickstart: dev
	@echo "Development environment started! Visit http://localhost:8000"

# NPM-style quickstart (same as frontend)
npm-quickstart: dev
	@echo "Backend development environment started! Visit http://localhost:8000"


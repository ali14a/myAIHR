# Frontend Docker Makefile
# Provides convenient commands for Docker development and deployment

.PHONY: help dev prod build build-dev run run-dev stop stop-dev clean logs logs-dev logs-prod shell shell-dev shell-prod

# Default target
help:
	@echo "Frontend Docker Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make stop-dev     - Stop development environment"
	@echo "  make logs-dev     - View development logs"
	@echo "  make shell-dev    - Enter development container shell"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make stop         - Stop production environment"
	@echo "  make logs-prod    - View production logs"
	@echo "  make shell-prod   - Enter production container shell"
	@echo ""
	@echo "Build:"
	@echo "  make build        - Build production image"
	@echo "  make build-dev    - Build development image"
	@echo ""
	@echo "Run:"
	@echo "  make run          - Run production container"
	@echo "  make run-dev      - Run development container"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Clean up Docker resources"
	@echo "  make logs         - View all logs"

# Development commands
dev:
	@echo "Starting development environment..."
	@docker-compose -f docker-compose.dev.yml up --build

stop-dev:
	@echo "Stopping development environment..."
	@docker-compose -f docker-compose.dev.yml down

logs-dev:
	@echo "Viewing development logs..."
	@docker-compose -f docker-compose.dev.yml logs -f

shell-dev:
	@echo "Entering development container shell..."
	@docker-compose -f docker-compose.dev.yml exec frontend-dev sh

# Production commands
prod:
	@echo "Starting production environment..."
	@docker-compose -f docker-compose.prod.yml up --build

stop:
	@echo "Stopping production environment..."
	@docker-compose -f docker-compose.prod.yml down

logs-prod:
	@echo "Viewing production logs..."
	@docker-compose -f docker-compose.prod.yml logs -f

shell-prod:
	@echo "Entering production container shell..."
	@docker-compose -f docker-compose.prod.yml exec frontend-prod sh

# Build commands
build:
	@echo "Building production image..."
	@docker build -t resume-scanner-frontend .

build-dev:
	@echo "Building development image..."
	@docker build -f Dockerfile.dev -t resume-scanner-frontend:dev .

# Run commands
run:
	@echo "Running production container..."
	@docker run -p 80:80 resume-scanner-frontend

run-dev:
	@echo "Running development container..."
	@docker run -p 3000:3000 -v $(PWD):/app -v /app/node_modules resume-scanner-frontend:dev

# Maintenance commands
clean:
	@echo "Cleaning up Docker resources..."
	@docker system prune -f
	@docker volume prune -f

logs:
	@echo "Viewing all logs..."
	@docker-compose logs -f

# Health check
health:
	@echo "Checking container health..."
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Quick start
quickstart: dev
	@echo "Development environment started! Visit http://localhost:3000"



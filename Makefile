# Resume Scanner Frontend Makefile
# Provides convenient commands for development and deployment

.PHONY: help install dev build start stop clean test lint setup

# Default target
help:
	@echo "Resume Scanner Frontend - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make setup      - Initial project setup"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make start      - Start production server"
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

# Setup commands
setup:
	@echo "Setting up Resume Scanner Frontend..."
	@npm install
	@echo "Setup completed! Run 'make dev' to start development server."

install:
	@echo "Installing dependencies..."
	@npm install

# Development commands
dev:
	@echo "Starting development server..."
	@npm run dev

start:
	@echo "Starting production server..."
	@npm run start

stop:
	@echo "Stopping all services..."
	@pkill -f "vite" || true

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
	@rm -rf node_modules dist || true

# Docker commands
docker-dev:
	@echo "Starting with Docker (development)..."
	@docker-compose -f docker-compose.dev.yml up --build

docker-prod:
	@echo "Starting with Docker (production)..."
	@docker-compose -f docker-compose.prod.yml up --build

docker-down:
	@echo "Stopping Docker containers..."
	@docker-compose -f docker-compose.dev.yml down
	@docker-compose -f docker-compose.prod.yml down

# Quick start for new developers
quickstart: setup dev
	@echo "Quick start completed! Visit http://localhost:3000"

# Production deployment
deploy:
	@echo "Deploying to production..."
	@make build
	@make start

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:3000 || echo "Frontend not responding"

# Logs
logs:
	@echo "Showing logs..."
	@echo "Frontend logs are displayed in the terminal where you run 'make dev'"

# Preview production build
preview:
	@echo "Previewing production build..."
	@npm run preview
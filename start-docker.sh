#!/bin/bash

# Resume Scanner Docker Quickstart Script
# This script starts both frontend and backend with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to start frontend
start_frontend() {
    print_header "STARTING FRONTEND"
    cd frontend
    print_info "Starting frontend with Docker..."
    npm run docker:dev &
    FRONTEND_PID=$!
    cd ..
    print_success "Frontend started (PID: $FRONTEND_PID)"
    echo "Frontend will be available at: http://localhost:3000"
}

# Function to start backend
start_backend() {
    print_header "STARTING BACKEND"
    cd backend
    print_info "Starting backend with Docker..."
    npm run docker:dev &
    BACKEND_PID=$!
    cd ..
    print_success "Backend started (PID: $BACKEND_PID)"
    echo "Backend will be available at: http://localhost:8000"
}

# Function to check if Ollama is running
check_ollama() {
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama is already running"
        return 0
    else
        print_warning "Ollama is not running. AI features will not work."
        print_info "To start Ollama: ollama serve"
        print_info "To pull the model: ollama pull llama3.2:3b"
        return 1
    fi
}

# Function to wait for services
wait_for_services() {
    print_header "WAITING FOR SERVICES"
    
    # Wait for backend
    print_info "Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Backend is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "Backend took too long to start. Check logs with: cd backend && npm run docker:logs:dev"
        fi
        sleep 2
    done
    
    # Wait for frontend
    print_info "Waiting for frontend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "Frontend took too long to start. Check logs with: cd frontend && npm run docker:logs:dev"
        fi
        sleep 2
    done
}

# Function to show final status
show_status() {
    print_header "SERVICES STATUS"
    
    echo -e "${CYAN}Frontend:${NC} http://localhost:3000"
    echo -e "${CYAN}Backend API:${NC} http://localhost:8000"
    echo -e "${CYAN}API Documentation:${NC} http://localhost:8000/docs"
    echo -e "${CYAN}Health Check:${NC} http://localhost:8000/health"
    
    echo ""
    print_info "To stop services:"
    echo "  Frontend: cd frontend && npm run docker:dev:down"
    echo "  Backend:  cd backend && npm run docker:dev:down"
    
    echo ""
    print_info "To view logs:"
    echo "  Frontend: cd frontend && npm run docker:logs:dev"
    echo "  Backend:  cd backend && npm run docker:logs:dev"
    
    echo ""
    print_success "Resume Scanner is ready! 🚀"
}

# Main execution
main() {
    print_header "RESUME SCANNER DOCKER QUICKSTART"
    
    # Check prerequisites
    check_docker
    
    # Check if Ollama is running
    check_ollama
    
    # Start services
    start_frontend
    start_backend
    
    # Wait for services to be ready
    wait_for_services
    
    # Show final status
    show_status
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Script interrupted. Services are still running.${NC}"; exit 0' INT

# Run main function
main "$@"

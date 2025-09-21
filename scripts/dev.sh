#!/bin/bash

# Resume Scanner Development Script
# This script helps manage the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    if ! command_exists pip; then
        print_error "pip is not installed. Please install pip first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Initialize database
    print_status "Initializing database..."
    python -c "from scripts.database import engine, Base; Base.metadata.create_all(bind=engine)"
    
    cd ..
    print_success "Backend setup completed"
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    cd ..
    print_success "Frontend setup completed"
}

# Function to start development servers
start_dev() {
    print_status "Starting development servers..."
    
    # Check if concurrently is installed
    if ! command_exists npx; then
        print_error "npx is not available. Please install Node.js properly."
        exit 1
    fi
    
    # Start both servers
    npm run dev
}

# Function to start with Docker
start_docker() {
    print_status "Starting with Docker Compose..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    docker-compose -f docker-compose.dev.yml up --build
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    # Kill any running processes on ports 8000 and 5173
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    # Stop Docker containers if running
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    print_success "Services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Clean frontend
    cd frontend
    rm -rf node_modules dist
    cd ..
    
    # Clean backend
    cd backend
    rm -rf venv __pycache__ *.pyc
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    cd ..
    
    # Clean Docker
    docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Resume Scanner Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup the development environment"
    echo "  start     - Start development servers"
    echo "  docker    - Start with Docker Compose"
    echo "  stop      - Stop all services"
    echo "  clean     - Clean up all generated files"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # First time setup"
    echo "  $0 start    # Start development servers"
    echo "  $0 docker   # Start with Docker"
    echo "  $0 stop     # Stop all services"
}

# Main script logic
case "${1:-help}" in
    setup)
        check_prerequisites
        setup_backend
        setup_frontend
        print_success "Development environment setup completed!"
        print_status "Run '$0 start' to start the development servers"
        ;;
    start)
        start_dev
        ;;
    docker)
        start_docker
        ;;
    stop)
        stop_services
        ;;
    clean)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac


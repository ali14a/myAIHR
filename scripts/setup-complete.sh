#!/bin/bash

# Resume Scanner Complete Setup Script
# This script ensures the project runs without errors on a new system
# Run with: chmod +x scripts/setup-complete.sh && ./scripts/setup-complete.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

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

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    ! lsof -i:$1 >/dev/null 2>&1
}

# Function to get OS type
get_os_type() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to check system requirements
check_system_requirements() {
    print_header "CHECKING SYSTEM REQUIREMENTS"
    
    local os_type=$(get_os_type)
    print_status "Detected OS: $os_type"
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js $node_version is installed (✓ >= 18.0.0)"
        else
            print_error "Node.js $node_version is installed but version 18+ is required"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    # Check npm/yarn
    if command_exists yarn; then
        print_success "Yarn is installed: $(yarn --version)"
    elif command_exists npm; then
        print_success "npm is installed: $(npm --version)"
        print_warning "Yarn is recommended but npm will work"
    else
        print_error "Neither yarn nor npm is installed"
        exit 1
    fi
    
    # Check Python
    if command_exists python3; then
        local python_version=$(python3 --version | sed 's/Python //')
        local major_version=$(echo $python_version | cut -d. -f1)
        local minor_version=$(echo $python_version | cut -d. -f2)
        if [ "$major_version" -eq 3 ] && [ "$minor_version" -ge 9 ]; then
            print_success "Python $python_version is installed (✓ >= 3.9)"
        else
            print_error "Python $python_version is installed but version 3.9+ is required"
            exit 1
        fi
    else
        print_error "Python 3 is not installed. Please install Python 3.9+ first."
        print_status "Visit: https://python.org/"
        exit 1
    fi
    
    # Check pip
    if command_exists pip3; then
        print_success "pip3 is installed: $(pip3 --version | cut -d' ' -f2)"
    else
        print_error "pip3 is not installed"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        print_error "Please run this script from the project root directory"
        print_status "Expected files: package.json, frontend/, backend/"
        exit 1
    fi
    
    print_success "All system requirements met!"
}

# Function to install system dependencies
install_system_dependencies() {
    print_header "INSTALLING SYSTEM DEPENDENCIES"
    
    local os_type=$(get_os_type)
    
    if [ "$os_type" = "macos" ]; then
        if command_exists brew; then
            print_status "Installing system dependencies with Homebrew..."
            brew install python@3.11 node
        else
            print_warning "Homebrew not found. Please install dependencies manually:"
            print_status "1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            print_status "2. Install dependencies: brew install python@3.11 node"
        fi
    elif [ "$os_type" = "linux" ]; then
        print_status "Installing system dependencies with apt..."
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv nodejs npm build-essential
    else
        print_warning "Unsupported OS. Please install Python 3.9+ and Node.js 18+ manually."
    fi
}

# Function to setup backend
setup_backend() {
    print_header "SETTING UP BACKEND"
    
    cd backend
    
    # Create virtual environment
    print_step "Creating Python virtual environment..."
    if [ -d "venv" ]; then
        print_warning "Virtual environment already exists. Removing old one..."
        rm -rf venv
    fi
    
    python3 -m venv venv
    source venv/bin/activate
    
    # Upgrade pip
    print_step "Upgrading pip..."
    pip install --upgrade pip
    
    # Install Python dependencies
    print_step "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Verify installation
    print_step "Verifying Python package installation..."
    python -c "import fastapi, uvicorn, sqlalchemy, passlib; print('✓ Core packages imported successfully')"
    
    # Create necessary directories
    print_step "Creating necessary directories..."
    mkdir -p uploads/resumes
    mkdir -p uploads/profile_photos
    mkdir -p database
    mkdir -p logs
    
    # Initialize database
    print_step "Initializing database..."
    python -c "from scripts.database import engine, Base; Base.metadata.create_all(bind=engine); print('✓ Database initialized')"
    
    cd ..
    print_success "Backend setup completed!"
}

# Function to setup frontend
setup_frontend() {
    print_header "SETTING UP FRONTEND"
    
    cd frontend
    
    # Clean install
    print_step "Cleaning and installing Node.js dependencies..."
    if [ -d "node_modules" ]; then
        print_warning "Removing existing node_modules..."
        rm -rf node_modules
    fi
    
    # Install dependencies
    if command_exists yarn; then
        yarn install
    else
        npm install
    fi
    
    # Verify installation
    print_step "Verifying frontend dependencies..."
    if command_exists yarn; then
        yarn list --depth=0 > /dev/null
    else
        npm list --depth=0 > /dev/null
    fi
    
    cd ..
    print_success "Frontend setup completed!"
}

# Function to create environment files
create_environment_files() {
    print_header "CREATING ENVIRONMENT FILES"
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        print_step "Creating backend .env file..."
        cat > backend/.env << 'EOF'
# Database
DATABASE_URL=sqlite:///./database/resume.db

# Security
SECRET_KEY=dev-secret-key-change-in-production-$(date +%s)
ACCESS_TOKEN_EXPIRE_DAYS=7

# AI/LLM
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# File Uploads
UPLOAD_DIR=./uploads/resumes
PROFILE_PHOTO_DIR=./uploads/profile_photos
MAX_FILE_SIZE=10485760

# Quota
MAX_MONTHLY_SCANS=10

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourapp.com

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174

# Debug
DEBUG=true
LOG_LEVEL=INFO
EOF
        print_success "Backend .env file created"
    else
        print_status "Backend .env file already exists"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        print_step "Creating frontend .env file..."
        cat > frontend/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
EOF
        print_success "Frontend .env file created"
    else
        print_status "Frontend .env file already exists"
    fi
}

# Function to setup Ollama
setup_ollama() {
    print_header "SETTING UP OLLAMA"
    
    if command_exists ollama; then
        print_success "Ollama is already installed: $(ollama --version)"
    else
        print_step "Installing Ollama..."
        curl -fsSL https://ollama.ai/install.sh | sh
        print_success "Ollama installed successfully"
    fi
    
    # Start Ollama service in background
    print_step "Starting Ollama service..."
    ollama serve &
    local ollama_pid=$!
    
    # Wait for service to start
    print_step "Waiting for Ollama service to start..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            print_success "Ollama service is running"
            break
        fi
        sleep 2
        attempt=$((attempt + 1))
        print_status "Waiting for Ollama service... (attempt $attempt/$max_attempts)"
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "Ollama service did not start in time. You may need to start it manually."
    fi
    
    # Pull the required model
    print_step "Pulling Ollama model (llama3.2:3b)..."
    if ollama list | grep -q "llama3.2:3b"; then
        print_success "Model llama3.2:3b is already available"
    else
        print_status "Downloading model (this may take a few minutes)..."
        ollama pull llama3.2:3b
        print_success "Model downloaded successfully"
    fi
    
    # Stop background Ollama service
    kill $ollama_pid 2>/dev/null || true
}

# Function to verify installation
verify_installation() {
    print_header "VERIFYING INSTALLATION"
    
    # Check backend
    print_step "Testing backend setup..."
    cd backend
    source venv/bin/activate
    
    # Test Python imports
    python -c "
import sys
try:
    import fastapi, uvicorn, sqlalchemy, passlib, requests, ollama, pydantic
    print('✓ All Python packages imported successfully')
except ImportError as e:
    print(f'✗ Import error: {e}')
    sys.exit(1)
"
    
    # Test database connection
    python -c "
from scripts.database import engine, Base
try:
    Base.metadata.create_all(bind=engine)
    print('✓ Database connection successful')
except Exception as e:
    print(f'✗ Database error: {e}')
    sys.exit(1)
"
    
    cd ..
    
    # Check frontend
    print_step "Testing frontend setup..."
    cd frontend
    
    if command_exists yarn; then
        yarn list --depth=0 > /dev/null
    else
        npm list --depth=0 > /dev/null
    fi
    
    cd ..
    
    print_success "Installation verification completed!"
}

# Function to test the application
test_application() {
    print_header "TESTING APPLICATION"
    
    # Check if ports are available
    if ! port_available 8000; then
        print_warning "Port 8000 is already in use. Backend may already be running."
    fi
    
    if ! port_available 5173; then
        print_warning "Port 5173 is already in use. Frontend may already be running."
    fi
    
    # Test backend startup
    print_step "Testing backend startup..."
    cd backend
    source venv/bin/activate
    
    # Start backend in background
    python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
    local backend_pid=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test backend health
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Backend is running and healthy"
    else
        print_warning "Backend health check failed, but it may still be starting up"
    fi
    
    # Stop backend
    kill $backend_pid 2>/dev/null || true
    cd ..
    
    print_success "Application test completed!"
}

# Function to show final instructions
show_final_instructions() {
    print_header "SETUP COMPLETED SUCCESSFULLY!"
    
    echo ""
    echo -e "${GREEN}🎉 Your Resume Scanner project is ready to run!${NC}"
    echo ""
    echo -e "${CYAN}To start the development servers, run:${NC}"
    echo -e "  ${YELLOW}yarn dev${NC}"
    echo ""
    echo -e "${CYAN}Or use the individual commands:${NC}"
    echo -e "  ${YELLOW}yarn dev:backend${NC}  # Start backend only"
    echo -e "  ${YELLOW}yarn dev:frontend${NC} # Start frontend only"
    echo ""
    echo -e "${CYAN}Access the application at:${NC}"
    echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
    echo -e "  Backend API: ${BLUE}http://localhost:8000${NC}"
    echo -e "  API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${CYAN}To start Ollama (required for AI features):${NC}"
    echo -e "  ${YELLOW}ollama serve${NC}"
    echo ""
    echo -e "${CYAN}For production deployment:${NC}"
    echo -e "  ${YELLOW}pm2 start ecosystem.config.js${NC}"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    print_header "RESUME SCANNER COMPLETE SETUP"
    print_status "This script will set up the entire Resume Scanner project"
    print_status "and ensure it runs without errors on a new system."
    echo ""
    
    # Run all setup steps
    check_system_requirements
    install_system_dependencies
    setup_backend
    setup_frontend
    create_environment_files
    setup_ollama
    verify_installation
    test_application
    show_final_instructions
}

# Run main function
main "$@"

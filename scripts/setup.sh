#!/bin/bash

# Resume Scanner Setup Script
# Automated setup for the Resume Scanner project

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

# Function to install Node.js
install_nodejs() {
    if command_exists node; then
        print_status "Node.js is already installed: $(node --version)"
        return 0
    fi
    
    print_status "Installing Node.js..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install node
        else
            print_error "Homebrew not found. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_error "Unsupported operating system. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js installed: $(node --version)"
}

# Function to install Python
install_python() {
    if command_exists python3 && python3 --version | grep -q "3.9\|3.10\|3.11\|3.12"; then
        print_status "Python 3 is already installed: $(python3 --version)"
        return 0
    fi
    
    print_status "Installing Python 3..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install python@3.11
        else
            print_error "Homebrew not found. Please install Python 3.9+ manually from https://python.org/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    else
        print_error "Unsupported operating system. Please install Python 3.9+ manually from https://python.org/"
        exit 1
    fi
    
    print_success "Python 3 installed: $(python3 --version)"
}

# Function to install Docker
install_docker() {
    if command_exists docker; then
        print_status "Docker is already installed: $(docker --version)"
        return 0
    fi
    
    print_status "Installing Docker..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install --cask docker
        else
            print_error "Homebrew not found. Please install Docker manually from https://docker.com/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    else
        print_error "Unsupported operating system. Please install Docker manually from https://docker.com/"
        exit 1
    fi
    
    print_success "Docker installed: $(docker --version)"
}

# Function to install Ollama
install_ollama() {
    if command_exists ollama; then
        print_status "Ollama is already installed: $(ollama --version)"
        return 0
    fi
    
    print_status "Installing Ollama..."
    
    curl -fsSL https://ollama.ai/install.sh | sh
    
    print_success "Ollama installed: $(ollama --version)"
}

# Function to setup project
setup_project() {
    print_status "Setting up Resume Scanner project..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Setup backend
    print_status "Setting up backend..."
    cd backend
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install Python dependencies
    pip install -r requirements.txt
    
    # Initialize database
    python -c "from scripts.database import engine, Base; Base.metadata.create_all(bind=engine)"
    
    cd ..
    
    # Setup frontend
    print_status "Setting up frontend..."
    cd frontend
    npm install
    cd ..
    
    print_success "Project setup completed!"
}

# Function to pull Ollama model
pull_ollama_model() {
    print_status "Pulling Ollama model (llama3.2:3b)..."
    
    # Start Ollama service
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait for service to start
    sleep 5
    
    # Pull the model
    ollama pull llama3.2:3b
    
    # Stop Ollama service
    kill $OLLAMA_PID 2>/dev/null || true
    
    print_success "Ollama model pulled successfully!"
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database
DATABASE_URL=sqlite:///./database/resume.db

# Security
SECRET_KEY=dev-secret-key-change-in-production
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
EOF
        print_success "Backend .env file created"
    else
        print_status "Backend .env file already exists"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
EOF
        print_success "Frontend .env file created"
    else
        print_status "Frontend .env file already exists"
    fi
}

# Function to show next steps
show_next_steps() {
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the development servers:"
    echo "   ./scripts/dev.sh start"
    echo ""
    echo "2. Or start with Docker:"
    echo "   ./scripts/dev.sh docker"
    echo ""
    echo "3. Access the application:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "4. For production deployment:"
    echo "   docker-compose -f docker-compose.prod.yml up --build"
    echo ""
}

# Main setup function
main() {
    print_status "Starting Resume Scanner setup..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Install prerequisites
    install_nodejs
    install_python
    install_docker
    install_ollama
    
    # Create environment files
    create_env_files
    
    # Setup project
    setup_project
    
    # Pull Ollama model
    pull_ollama_model
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"


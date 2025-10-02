#!/bin/bash

# Resume Scanner Backend Complete Setup Script
# Comprehensive setup for Python-only backend with all dependencies

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

# Function to check Python version
check_python_version() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        REQUIRED_VERSION="3.9"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Python $PYTHON_VERSION is installed (>= $REQUIRED_VERSION required)"
            return 0
        else
            print_error "Python $PYTHON_VERSION is installed, but Python $REQUIRED_VERSION+ is required"
            return 1
        fi
    else
        print_error "Python 3 is not installed"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    print_step "Checking Python installation..."
    if ! check_python_version; then
        print_error "Please install Python 3.9+ first:"
        echo "  - macOS: brew install python3"
        echo "  - Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip python3-venv"
        echo "  - Windows: Download from https://python.org"
        exit 1
    fi
    
    print_step "Checking pip installation..."
    if ! command_exists pip3; then
        print_error "pip3 is not installed. Please install pip first."
        exit 1
    fi
    
    print_step "Checking system dependencies..."
    
    # Check for required system packages
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command_exists brew; then
            print_warning "Homebrew not found. Some system dependencies might be missing."
            print_status "Consider installing Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt-get; then
            print_status "Detected Ubuntu/Debian system"
        elif command_exists yum; then
            print_status "Detected CentOS/RHEL system"
        elif command_exists pacman; then
            print_status "Detected Arch Linux system"
        fi
    fi
    
    print_success "Prerequisites check completed"
}

# Create necessary directories
create_directories() {
    print_header "Creating Project Directories"
    
    print_step "Creating upload directories..."
    mkdir -p uploads/resumes
    mkdir -p uploads/profile_photos
    mkdir -p logs
    mkdir -p database
    
    print_step "Setting directory permissions..."
    chmod 755 uploads
    chmod 755 uploads/resumes
    chmod 755 uploads/profile_photos
    chmod 755 logs
    chmod 755 database
    
    print_success "Directories created successfully"
}

# Setup Python environment
setup_python() {
    print_header "Setting up Python Environment"
    
    print_step "Creating Python virtual environment..."
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
    
    print_step "Activating virtual environment..."
    source venv/bin/activate
    
    print_step "Upgrading pip..."
    pip install --upgrade pip
    
    print_step "Installing Python dependencies..."
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_success "Python dependencies installed"
    else
        print_error "requirements.txt not found!"
        exit 1
    fi
    
    print_step "Installing additional development tools..."
    pip install flake8 pytest pytest-cov black isort
    
    print_success "Python environment setup completed"
}

# Setup environment configuration
setup_environment() {
    print_header "Setting up Environment Configuration"
    
    print_step "Setting up environment file..."
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Environment file created from template"
        else
            print_warning "env.example not found, creating basic .env file"
            cat > .env << EOF
# Resume Scanner Backend Configuration
DATABASE_URL=sqlite:///./database/resume.db
SECRET_KEY=your-secret-key-change-in-production
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
UPLOAD_DIR=./uploads/resumes
PROFILE_PHOTO_DIR=./uploads/profile_photos
MAX_FILE_SIZE=10485760
MAX_MONTHLY_SCANS=10
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
EOF
        fi
    else
        print_warning "Environment file already exists"
    fi
    
    print_success "Environment configuration completed"
}

# Initialize database
setup_database() {
    print_header "Setting up Database"
    
    print_step "Activating virtual environment..."
    source venv/bin/activate
    
    print_step "Initializing database..."
    python -c "
from src.backend.database import engine, Base
try:
    Base.metadata.create_all(bind=engine)
    print('Database tables created successfully')
except Exception as e:
    print(f'Error creating database: {e}')
    exit(1)
"
    
    print_success "Database initialization completed"
}

# Setup Ollama (optional)
setup_ollama() {
    print_header "Setting up Ollama (AI/LLM)"
    
    if command_exists ollama; then
        print_success "Ollama is already installed"
        
        print_step "Checking if Ollama service is running..."
        if curl -s http://localhost:11434 > /dev/null 2>&1; then
            print_success "Ollama service is running"
        else
            print_warning "Ollama service is not running"
            print_status "Starting Ollama service..."
            nohup ollama serve > logs/ollama.log 2>&1 &
            sleep 3
        fi
        
        print_step "Pulling required AI model..."
        ollama pull llama3.2:3b || print_warning "Failed to pull model, you can do this manually later"
        
    else
        print_warning "Ollama is not installed"
        print_status "To install Ollama:"
        echo "  curl -fsSL https://ollama.ai/install.sh | sh"
        echo "  ollama serve"
        echo "  ollama pull llama3.2:3b"
    fi
}

# Setup development tools
setup_dev_tools() {
    print_header "Setting up Development Tools"
    
    print_step "Creating .gitignore if it doesn't exist..."
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/

# Environment Variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite
*.sqlite3
database/

# Logs
logs/
*.log

# Uploads
uploads/
!uploads/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore
EOF
        print_success ".gitignore created"
    else
        print_warning ".gitignore already exists"
    fi
    
    print_step "Creating uploads placeholder files..."
    touch uploads/.gitkeep
    touch uploads/resumes/.gitkeep
    touch uploads/profile_photos/.gitkeep
    touch logs/.gitkeep
    touch database/.gitkeep
    
    print_success "Development tools setup completed"
}

# Run basic tests
run_tests() {
    print_header "Running Basic Tests"
    
    print_step "Activating virtual environment..."
    source venv/bin/activate
    
    print_step "Testing imports..."
    python -c "
try:
    from src.backend.database import engine, Base
    from src.backend.models import User, ResumeScan, JobDescription
    from src.backend.auth import create_user, authenticate_user
    from src.backend.utils import allowed_file
    print('All imports successful')
except Exception as e:
    print(f'Import error: {e}')
    exit(1)
"
    
    print_step "Testing database connection..."
    python -c "
from src.backend.database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('Database connection successful')
except Exception as e:
    print(f'Database connection error: {e}')
    exit(1)
"
    
    print_success "Basic tests passed"
}

# Show final instructions
show_final_instructions() {
    print_header "Setup Complete!"
    
    echo ""
    print_success "Resume Scanner Backend is ready to use!"
    echo ""
    
    echo "🚀 Quick Start Commands:"
    echo "  ./scripts/dev.sh                    # Start development server"
    echo "  source venv/bin/activate && python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
    echo "  docker-compose up --build           # Start with Docker"
    echo ""
    
    echo "📍 Access Points:"
    echo "  API: http://localhost:8000"
    echo "  Documentation: http://localhost:8000/docs"
    echo "  Health Check: http://localhost:8000/health"
    echo ""
    
    echo "🔧 Development Commands:"
    echo "  python -m pytest                    # Run tests"
    echo "  python -m flake8 .                  # Run linting"
    echo "  make dev                            # Start with Make"
    echo "  make test                           # Run tests with Make"
    echo ""
    
    echo "📁 Project Structure:"
    echo "  src/backend/                        # Backend source code"
    echo "  uploads/                            # File uploads"
    echo "  logs/                               # Application logs"
    echo "  database/                           # Database files"
    echo "  docs/                               # Documentation"
    echo ""
    
    print_warning "Next Steps:"
    echo "  1. Configure OAuth (optional): ./scripts/setup-google-oauth.sh"
    echo "  2. Configure email (optional): Edit .env file"
    echo "  3. Start the server: ./scripts/dev.sh"
    echo ""
}

# Main setup function
main() {
    print_header "Resume Scanner Backend Complete Setup"
    echo "This script will set up everything needed to run the backend API"
    echo ""
    
    check_prerequisites
    create_directories
    setup_python
    setup_environment
    setup_database
    setup_ollama
    setup_dev_tools
    run_tests
    show_final_instructions
}

# Handle command line arguments
case "${1:-setup}" in
    setup)
        main
        ;;
    test)
        print_header "Running Tests Only"
        source venv/bin/activate
        run_tests
        ;;
    clean)
        print_header "Cleaning Up"
        print_status "Removing virtual environment..."
        rm -rf venv/
        print_status "Removing database files..."
        rm -rf database/*.db
        print_status "Removing logs..."
        rm -rf logs/*.log
        print_success "Cleanup completed"
        ;;
    help|--help|-h)
        echo "Resume Scanner Backend Setup Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  setup     - Complete setup (default)"
        echo "  test      - Run tests only"
        echo "  clean     - Clean up generated files"
        echo "  help      - Show this help message"
        echo ""
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
#!/bin/bash

# Resume Scanner Backend Development Script
# Simple development server startup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_error "Virtual environment not found. Run './scripts/setup.sh' first."
    exit 1
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Start development server
print_status "Starting FastAPI development server..."
print_success "Server will be available at: http://localhost:8000"
print_success "API documentation at: http://localhost:8000/docs"
echo ""

python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload

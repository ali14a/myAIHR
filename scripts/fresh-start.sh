#!/bin/bash

# Resume Scanner Fresh Start Script
# This script kills all running services and starts fresh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}[FRESH START]${NC} $1"
}

# Function to kill all services
kill_all_services() {
    print_header "Killing all running services..."
    
    # Kill processes on common ports
    print_status "Killing processes on port 3000 (frontend)..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    print_status "Killing processes on port 5173 (Vite dev server)..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    print_status "Killing processes on port 8000 (backend)..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    
    # Kill any Node.js processes related to our project
    print_status "Killing Node.js processes..."
    pkill -f "node.*vite\|npm.*start\|yarn.*start\|npm.*dev\|yarn.*dev" 2>/dev/null || true
    
    # Kill any Python processes related to our project
    print_status "Killing Python processes..."
    pkill -f "python.*app.py\|uvicorn.*app" 2>/dev/null || true
    
    
    # Wait a moment for processes to fully terminate
    sleep 2
    
    print_success "All services killed"
}

# Function to check if ports are free
check_ports() {
    print_status "Checking if ports are available..."
    
    if lsof -i:3000 >/dev/null 2>&1; then
        print_warning "Port 3000 is still in use"
        return 1
    fi
    
    if lsof -i:5173 >/dev/null 2>&1; then
        print_warning "Port 5173 is still in use"
        return 1
    fi
    
    if lsof -i:8000 >/dev/null 2>&1; then
        print_warning "Port 8000 is still in use"
        return 1
    fi
    
    print_success "All ports are available"
    return 0
}

# Function to start backend
start_backend() {
    print_header "Starting backend server..."
    
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_error "Backend virtual environment not found. Run 'yarn setup' first."
        exit 1
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start backend server
    print_status "Starting FastAPI server on port 8000..."
    nohup python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is running
    if ps -p $BACKEND_PID > /dev/null; then
        print_success "Backend server started (PID: $BACKEND_PID)"
    else
        print_error "Failed to start backend server"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_header "Starting frontend server..."
    
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_error "Frontend dependencies not found. Run 'yarn install' first."
        exit 1
    fi
    
    # Start frontend server
    print_status "Starting Vite dev server on port 3000..."
    nohup yarn dev --port 3000 > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    cd ..
    
    # Wait a moment for frontend to start
    sleep 3
    
    # Check if frontend is running
    if ps -p $FRONTEND_PID > /dev/null; then
        print_success "Frontend server started (PID: $FRONTEND_PID)"
    else
        print_error "Failed to start frontend server"
        exit 1
    fi
}

# Function to show status
show_status() {
    print_header "Service Status"
    
    echo ""
    echo "Backend (Port 8000):"
    if lsof -i:8000 >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Running${NC}"
        echo "  URL: http://localhost:8000"
        echo "  API Docs: http://localhost:8000/docs"
    else
        echo -e "  ${RED}✗ Not running${NC}"
    fi
    
    echo ""
    echo "Frontend (Port 3000):"
    if lsof -i:3000 >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Running${NC}"
        echo "  URL: http://localhost:3000"
    else
        echo -e "  ${RED}✗ Not running${NC}"
    fi
    
    echo ""
    echo "Logs:"
    echo "  Backend: logs/backend.log"
    echo "  Frontend: logs/frontend.log"
    echo ""
}

# Function to create logs directory
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_status "Created logs directory"
    fi
}

# Main execution
main() {
    print_header "Resume Scanner Fresh Start"
    echo ""
    
    # Create logs directory
    create_logs_dir
    
    # Kill all services
    kill_all_services
    
    # Check if ports are free
    if ! check_ports; then
        print_error "Some ports are still in use. Please check manually."
        exit 1
    fi
    
    # Start backend
    start_backend
    
    # Start frontend
    start_frontend
    
    # Show status
    show_status
    
    print_success "Fresh start completed!"
    print_status "Both servers are now running. Check the logs if you encounter any issues."
    echo ""
    print_status "To stop all services, run: ./scripts/fresh-start.sh stop"
}

# Function to stop all services
stop_services() {
    print_header "Stopping all services..."
    
    # Kill processes using PIDs if available
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill $BACKEND_PID 2>/dev/null || true
            print_status "Stopped backend server (PID: $BACKEND_PID)"
        fi
        rm -f logs/backend.pid
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill $FRONTEND_PID 2>/dev/null || true
            print_status "Stopped frontend server (PID: $FRONTEND_PID)"
        fi
        rm -f logs/frontend.pid
    fi
    
    # Kill all services (fallback)
    kill_all_services
    
    print_success "All services stopped"
}

# Function to show help
show_help() {
    echo "Resume Scanner Fresh Start Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Kill all services and start fresh (default)"
    echo "  stop      - Stop all running services"
    echo "  status    - Show status of running services"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0           # Start fresh (kill all and start both servers)"
    echo "  $0 start     # Same as above"
    echo "  $0 stop      # Stop all services"
    echo "  $0 status    # Show current status"
}

# Handle command line arguments
case "${1:-start}" in
    start)
        main
        ;;
    stop)
        stop_services
        ;;
    status)
        show_status
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


#!/bin/bash
# ===========================================
# REPLIT STARTUP SCRIPT
# ===========================================
# This script starts all services for Replit deployment

echo "🚀 Starting MyAIHR Resume Scanner on Replit..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up --build

echo "✅ MyAIHR Resume Scanner is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🤖 Ollama AI: http://localhost:11434"

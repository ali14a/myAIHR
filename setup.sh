#!/bin/bash

# Resume Scanner Frontend Setup Script
# This script sets up the frontend environment for development

set -e

echo "🚀 Setting up Resume Scanner Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18.20.4+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.20.4"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js 18.20.4+ is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm 10.7.0+ and try again."
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm -v)
REQUIRED_NPM_VERSION="10.7.0"

if [ "$(printf '%s\n' "$REQUIRED_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$REQUIRED_NPM_VERSION" ]; then
    echo "❌ npm 10.7.0+ is required. Current version: $NPM_VERSION"
    exit 1
fi

echo "✅ npm $NPM_VERSION found"

# Install dependencies
echo "📚 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p public

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📋 Copying environment configuration..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before running the application"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Frontend setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'make dev' or 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to access the application"
echo ""
echo "Available commands:"
echo "  make dev        - Start development server"
echo "  make build      - Build for production"
echo "  make test       - Run tests"
echo "  make lint       - Run linting"
echo "  make docker:dev - Start with Docker"
echo ""

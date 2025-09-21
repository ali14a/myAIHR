# Resume Scanner - Complete Setup Guide

This guide will help you set up the Resume Scanner project on a new system and ensure it runs without errors.

## Quick Start

For a complete automated setup, run:

```bash
yarn setup:complete
```

This script will:

- ✅ Check system requirements (Node.js 18+, Python 3.9+)
- ✅ Install all dependencies
- ✅ Set up Python virtual environment
- ✅ Install backend requirements
- ✅ Install frontend dependencies
- ✅ Create environment files
- ✅ Set up Ollama and download AI model
- ✅ Initialize database
- ✅ Verify installation
- ✅ Test the application

## Manual Setup (Alternative)

If you prefer to set up manually or the automated script fails:

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.9+** - [Download here](https://python.org/)
- **Yarn** (recommended) or npm
- **Git** - [Download here](https://git-scm.com/)

### 2. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd resume-scanner

# Install root dependencies
yarn install

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -c "from scripts.database import engine, Base; Base.metadata.create_all(bind=engine)"
cd ..

# Setup frontend
cd frontend
yarn install
cd ..

# Create environment files (copy from env.example)
cp env.example .env
cp env.example backend/.env
cp env.example frontend/.env
```

### 3. Setup Ollama (Required for AI features)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# In another terminal, download the AI model
ollama pull llama3.2:3b
```

### 4. Start Development Servers

```bash
# Start both backend and frontend
yarn dev

# Or start individually
yarn dev:backend   # Backend only (port 8000)
yarn dev:frontend  # Frontend only (port 5173)
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill processes on ports 8000 and 5173
   lsof -ti:8000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Python virtual environment issues**

   ```bash
   cd backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Node modules issues**

   ```bash
   # Clean and reinstall
   rm -rf node_modules frontend/node_modules
   yarn install
   cd frontend && yarn install
   ```

4. **Database issues**

   ```bash
   cd backend
   source venv/bin/activate
   python -c "from scripts.database import engine, Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
   ```

5. **Ollama not working**

   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags

   # Restart Ollama
   ollama serve
   ```

### Getting Help

If you encounter issues:

1. Check the logs in the `logs/` directory
2. Ensure all services are running on the correct ports
3. Verify environment files are properly configured
4. Check that all dependencies are installed correctly

## Production Deployment

For production deployment:

```bash
# Using Docker
docker-compose -f docker-compose.prod.yml up --build

# Or build and run manually
yarn build
yarn start
```

## Development Commands

```bash
yarn dev          # Start development servers
yarn build        # Build for production
yarn test         # Run tests
yarn lint         # Run linting
yarn clean        # Clean generated files
yarn setup        # Quick setup (alternative)
```

## System Requirements

- **OS**: macOS, Linux, or Windows
- **Node.js**: 18.20.4 or higher
- **Python**: 3.9 or higher
- **RAM**: 4GB minimum (8GB recommended for AI features)
- **Storage**: 2GB free space
- **Internet**: Required for initial setup and AI model download

## Features

- ✅ Resume upload and analysis
- ✅ AI-powered job matching
- ✅ Cover letter generation
- ✅ User authentication (Google, LinkedIn)
- ✅ Profile management
- ✅ Resume improvement suggestions
- ✅ Modern React frontend
- ✅ FastAPI backend
- ✅ SQLite database
- ✅ Docker support

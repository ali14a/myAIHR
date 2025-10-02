# Resume Scanner Backend - AI-Powered Career Optimization API

<div align="center">

![Resume Scanner](https://img.shields.io/badge/Resume%20Scanner-AI%20Powered-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

**A comprehensive backend API for AI-powered resume analysis, job matching, and career optimization.**

[🚀 Quick Start](#-quick-start) • [🐳 Docker Quickstart](#-docker-quickstart) • [📖 Documentation](#-documentation) • [🛠️ Development](#️-development) • [🐳 Docker](#-docker) • [📊 Features](#-features)

</div>

## 🎯 Overview

Resume Scanner Backend is a modern, high-performance API that leverages AI to help job seekers optimize their resumes, find better job matches, and generate personalized cover letters. Built with FastAPI, SQLAlchemy, and Ollama LLM integration, it provides intelligent career guidance through advanced resume analysis and job matching algorithms.

## ✨ Features

### 🧠 AI-Powered Analysis

- **ATS Compatibility Scoring**: Automated scoring for Applicant Tracking Systems
- **Skills Extraction**: AI-powered skills identification and categorization
- **Keyword Optimization**: ATS-friendly keyword suggestions
- **Resume Improvement**: Actionable recommendations for enhancement
- **Cover Letter Generation**: Personalized, job-specific cover letters

### 🔍 Job Matching

- **Resume-Job Compatibility**: AI-powered matching between resumes and job descriptions
- **Skills Alignment**: Detailed skills gap analysis
- **Match Scoring**: Quantitative compatibility metrics
- **Experience Gap Analysis**: Identify areas for improvement

### 👤 User Management

- **Secure Authentication**: JWT-based user authentication
- **Profile Management**: Comprehensive user profile system
- **Quota System**: Configurable monthly usage limits
- **File Management**: Secure resume and document storage

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Drag & Drop Upload**: Intuitive file upload interface
- **Progress Tracking**: Visual progress bars and status indicators

## 🏗️ Architecture

```
resume-scanner-backend/
├── src/
│   └── backend/            # Core backend modules
│       ├── auth.py         # Authentication & authorization
│       ├── config.py       # Configuration management
│       ├── database.py     # Database connection & models
│       ├── models.py       # SQLAlchemy data models
│       ├── utils.py        # Utility functions & AI processing
│       ├── email.py        # Email service integration
│       ├── google_auth.py  # Google OAuth integration
│       └── linkedin_auth.py # LinkedIn OAuth integration
├── app.py                  # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
├── scripts/               # Development and setup scripts
├── docs/                  # Documentation
└── Makefile              # Convenient development commands
```

## 🚀 Quick Start

### Prerequisites

- **Python** 3.9+
- **Docker** and Docker Compose (optional)
- **Ollama** (for AI processing)

### Option 1: Complete Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd resume-scanner-backend

# Run complete automated setup (installs everything needed)
./scripts/setup.sh

# Start development server
./scripts/dev.sh
```

**What the setup script does:**
- ✅ Checks Python 3.9+ installation
- ✅ Creates virtual environment
- ✅ Installs all Python dependencies
- ✅ Creates necessary directories (uploads, logs, database)
- ✅ Sets up environment configuration
- ✅ Initializes database
- ✅ Installs development tools (flake8, pytest, etc.)
- ✅ Sets up Ollama (AI/LLM) if available
- ✅ Creates .gitignore and project structure
- ✅ Runs basic tests to verify setup

### Option 2: Manual Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp env.example .env
# Edit .env with your configuration (optional - defaults work for development)

# Initialize database
python -c "from src.backend.database import engine, Base; Base.metadata.create_all(bind=engine)"

# Start development server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Option 3: Docker (Recommended)

#### Quick Docker Start
```bash
# Start backend with Docker
yarn docker:dev
# Access: http://localhost:8000
```

#### Traditional Docker Compose
```bash
# Start with Docker Compose
docker-compose up --build
```

## 🐳 Docker Quickstart

### One-Command Start (Easiest Way)

```bash
# Using Docker Compose
docker-compose up --build
# ✅ Backend service will start automatically
# ✅ Backend API: http://localhost:8000
```

### Manual Start (Step by Step)

```bash
# Start Backend with Docker
docker-compose up --build
# ✅ Backend running at http://localhost:8000

# Start Ollama (for AI features) - in another terminal
ollama serve
ollama pull llama3.2:3b
# ✅ AI service ready
```

### Stop Everything

```bash
# Stop Backend
docker-compose down

# Stop Ollama
# Press Ctrl+C in the Ollama terminal
```

### Access Points

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠️ Development

### Available Commands

```bash
# Setup & Installation
./scripts/setup.sh           # Complete automated setup (recommended)
./scripts/setup.sh test      # Run tests only
./scripts/setup.sh clean     # Clean up generated files
./scripts/setup.sh help      # Show setup help

# Development
./scripts/dev.sh             # Start development server
python -m uvicorn app:app --host 0.0.0.0 --port 8000  # Start production server

# Testing & Quality
python -m pytest             # Run all tests
python -m flake8 .           # Run linting
python -m black .            # Format code
python -m isort .            # Sort imports

# Docker
docker-compose up --build     # Start with Docker (development)
docker-compose -f docker-compose.prod.yml up --build  # Start with Docker (production)
docker-compose down           # Stop Docker containers

# Database
python -c "from src.backend.database import engine, Base; Base.metadata.create_all(bind=engine)"  # Initialize database
python -c "from src.backend.database import engine, Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"  # Reset database

# Alternative Make commands
make dev             # Start development server
make start           # Start production server
make clean           # Clean up generated files
make test            # Run all tests
make lint            # Run linting
```

### Development Workflow

1. **Start Development Server**:

   ```bash
   ./scripts/dev.sh
   # or
   python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the Application**:

   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. **Make Changes**:

   - Backend changes are auto-reloaded with uvicorn --reload

4. **Run Tests**:
   ```bash
   python -m pytest
   ```

## 🐳 Docker

### Quick Start with Docker Compose

#### Development Environment

```bash
# Backend Development
docker-compose up --build
# Access: http://localhost:8000
```

#### Production Environment

```bash
# Backend Production
docker-compose -f docker-compose.prod.yml up --build
# Access: http://localhost:8000
```

### Available Docker Commands

```bash
docker-compose up --build     # Start development environment
docker-compose down           # Stop development environment
docker-compose -f docker-compose.prod.yml up --build  # Start production environment
docker-compose -f docker-compose.prod.yml down        # Stop production environment
docker build -t resume-scanner-backend .              # Build production image
docker run -p 8000:8000 resume-scanner-backend        # Run production container
docker system prune -f                                 # Clean up Docker resources
docker-compose logs -f                                 # View development logs
docker-compose -f docker-compose.prod.yml logs -f     # View production logs
docker-compose exec backend sh                        # Enter container shell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"  # Check container health
docker-compose exec backend python -m pytest         # Run tests
make db-reset                                          # Reset database
make db-migrate                                        # Run database migrations
```

### Traditional Docker Compose

#### Development Environment

```bash
# Start development environment
docker-compose up --build

# Services included:
# - Backend (FastAPI) on port 8000
# - Ollama (AI) on port 11434 (if configured)
```

#### Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build

# Services included:
# - Backend (FastAPI) on port 8000
# - Ollama (AI) on port 11434 (if configured)
```

## 📊 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Password reset request

#### Resume Management

- `GET /resume/user-resumes` - Get all user resumes
- `POST /resume/upload` - Upload new resume
- `GET /resume/{resume_id}` - Get specific resume
- `DELETE /resume/{resume_id}` - Delete resume

#### AI Analysis

- `POST /analyze/resume-vs-job` - Analyze resume against job description
- `POST /analyze/resume-improvements` - Get resume improvement suggestions
- `POST /generate/cover-letter` - Generate cover letter

## 🔧 Configuration

### Environment Variables

The project includes two environment configuration files:

- **`env.example`** - Complete configuration template for all features
- **`env.docker.example`** - Simplified configuration for Docker deployment

Copy the appropriate file to `.env`:

```bash
# For local development
cp env.example .env

# For Docker deployment
cp env.docker.example .env
```

**Key Configuration Options:**

```bash
# Essential (defaults work for development)
DATABASE_URL=sqlite:///./database/resume.db
SECRET_KEY=your-secret-key
OLLAMA_API=http://localhost:11434

# Optional (for enhanced features)
GOOGLE_CLIENT_ID=your-google-client-id
LINKEDIN_CLIENT_ID=your-linkedin-client-id
SMTP_HOST=smtp.gmail.com
```

### Ollama Setup

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve &

# Pull the AI model
ollama pull llama3.2:3b
```

## 🚀 Deployment

### Production Deployment

1. **Configure Environment**:

   ```bash
   cp env.example .env
   # Edit .env with production values
   ```

2. **Build and Deploy**:

   ```bash
   make build
   make docker-prod
   ```

3. **AWS Deployment**:
   ```bash
   cd backend/setup
   ./deploy-aws.sh
   ```

### Environment-Specific Configurations

- **Development**: SQLite database, local Ollama
- **Production**: PostgreSQL database, production Ollama/OpenAI
- **Docker**: Containerized services with volume persistence

## 🧪 Testing

```bash
# Run all tests
python -m pytest

# Run linting
python -m flake8 .
```

## 📈 Performance

### Current Capabilities

- **Concurrent Users**: Supports multiple simultaneous users
- **File Processing**: Handles PDF/DOCX files up to 10MB
- **AI Processing**: Local Ollama integration for fast analysis
- **Database**: SQLite for development, PostgreSQL for production

### Optimization Features

- **Async Processing**: FastAPI's async capabilities
- **Database Connection Pooling**: Efficient database connections
- **File Storage**: Organized file system with unique naming
- **Caching**: JWT token caching for authentication
- **Logging**: Comprehensive logging for monitoring

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt/pbkdf2_sha256 password security
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation

### Data Protection

- **File Sanitization**: Secure file naming and storage
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **XSS Protection**: Input sanitization and validation
- **User Data Isolation**: User-specific data access

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests if applicable**
5. **Run tests**: `make test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
- **Type Hints**: Use type hints in Python code
- **Documentation**: Add docstrings for functions
- **Testing**: Write tests for new features
- **Error Handling**: Implement comprehensive error management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the `/documentation/` folder
- **API Docs**: Visit http://localhost:8000/docs
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

### Troubleshooting

#### Common Issues

1. **Port Already in Use**:

   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Database Issues**:

   ```bash
   python -c "from src.backend.database import engine, Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
   ```

3. **Docker Issues**:

   ```bash
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

4. **Ollama Not Working**:
   ```bash
   ollama serve &
   ollama pull llama3.2:3b
   ```

## 🔄 Changelog

### v1.0.0

- Initial release
- Core resume analysis features
- JWT authentication
- AI-powered insights
- Backend API architecture
- Docker support
- Comprehensive documentation

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **SQLAlchemy** for the powerful ORM
- **Ollama** for local AI/LLM capabilities
- **Pydantic** for data validation
- **Uvicorn** for the ASGI server

---

<div align="center">

**Built with ❤️ by the Resume Scanner Team**

[⭐ Star this repo](https://github.com/your-username/resume-scanner-backend) • [🐛 Report Bug](https://github.com/your-username/resume-scanner-backend/issues) • [💡 Request Feature](https://github.com/your-username/resume-scanner-backend/issues)

</div>

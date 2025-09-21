# Resume Scanner - AI-Powered Career Optimization Platform

<div align="center">

![Resume Scanner](https://img.shields.io/badge/Resume%20Scanner-AI%20Powered-blue?style=for-the-badge&logo=react&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A comprehensive full-stack platform for AI-powered resume analysis, job matching, and career optimization.**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🛠️ Development](#️-development) • [🐳 Docker](#-docker) • [📊 Features](#-features)

</div>

## 🎯 Overview

Resume Scanner is a modern, full-stack application that leverages AI to help job seekers optimize their resumes, find better job matches, and generate personalized cover letters. Built with React 19, FastAPI, and Ollama LLM integration, it provides intelligent career guidance through advanced resume analysis and job matching algorithms.

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
resume-scanner/
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── contexts/       # React Context providers
│   └── Dockerfile.dev      # Development Docker configuration
├── backend/                 # FastAPI + SQLAlchemy + Ollama
│   ├── scripts/            # Core backend modules
│   ├── uploads/            # File storage
│   ├── database/           # Database files
│   └── Dockerfile          # Production Docker configuration
├── docker-compose.dev.yml  # Development environment
├── docker-compose.prod.yml # Production environment
├── scripts/                # Development and setup scripts
└── Makefile               # Convenient development commands
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.20.4+ and npm 10.7.0+
- **Python** 3.9+
- **Docker** and Docker Compose (optional)
- **Ollama** (for AI processing)

### Option 1: Complete Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd resume-scanner

# Run complete automated setup (checks all requirements, installs everything)
yarn setup:complete

# Start development servers
yarn dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install
cd frontend && npm install
cd ../backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Setup environment
cp env.example .env
# Edit .env with your configuration

# Initialize database
cd backend && python -c "from scripts.database import engine, Base; Base.metadata.create_all(bind=engine)"

# Start services
npm run dev
```

### Option 3: Docker (Full Stack)

```bash
# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up --build
```

## 🛠️ Development

### Available Commands

```bash
# Setup & Installation
yarn setup:complete  # Complete automated setup (recommended)

# Development
yarn dev             # Start development servers
yarn dev:backend     # Start backend only
yarn dev:frontend    # Start frontend only
yarn start           # Start production servers
yarn stop            # Stop all services

# Testing & Quality
yarn test            # Run all tests
yarn lint            # Run linting
yarn build           # Build for production

# Docker
yarn docker:dev      # Start with Docker (development)
yarn docker:prod     # Start with Docker (production)
yarn docker:down     # Stop Docker containers

# Database
yarn db:reset        # Reset database
yarn db:migrate      # Run database migrations

# Alternative Make commands
make dev             # Start development servers
make start           # Start production servers
make stop            # Stop all services
make clean           # Clean up generated files
make test            # Run all tests
make lint            # Run linting
make build           # Build for production
```

### Development Workflow

1. **Start Development Servers**:

   ```bash
   make dev
   # or
   npm run dev
   ```

2. **Access the Application**:

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. **Make Changes**:

   - Frontend changes are hot-reloaded
   - Backend changes require server restart

4. **Run Tests**:
   ```bash
   make test
   ```

## 🐳 Docker

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Services included:
# - Frontend (React + Vite) on port 5173
# - Backend (FastAPI) on port 8000
# - Ollama (AI) on port 11434
# - PostgreSQL on port 5432
# - Redis on port 6379
```

### Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build

# Services included:
# - Frontend (Nginx) on port 80
# - Backend (FastAPI) on port 8000
# - Ollama (AI) on port 11434
# - PostgreSQL on port 5432
# - Redis on port 6379
# - Nginx Reverse Proxy on port 443
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

Copy `env.example` to `.env` and configure:

```bash
# Backend Configuration
DATABASE_URL=sqlite:///./database/resume.db
SECRET_KEY=your-secret-key
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads/resumes

# User Quota
MAX_MONTHLY_SCANS=10
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
make test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && python -m pytest

# Run linting
make lint
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
   make stop
   # or
   lsof -ti:8000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Database Issues**:

   ```bash
   make db-reset
   ```

3. **Docker Issues**:

   ```bash
   make docker-down
   docker system prune -f
   make docker-dev
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
- Full-stack architecture
- Docker support
- Comprehensive documentation

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **React** for the powerful frontend library
- **Ollama** for local AI/LLM capabilities
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the fast build tool

---

<div align="center">

**Built with ❤️ by the Resume Scanner Team**

[⭐ Star this repo](https://github.com/your-username/resume-scanner) • [🐛 Report Bug](https://github.com/your-username/resume-scanner/issues) • [💡 Request Feature](https://github.com/your-username/resume-scanner/issues)

</div>

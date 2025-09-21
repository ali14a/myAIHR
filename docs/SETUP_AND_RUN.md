# Resume Scanner - Setup and Run Guide

## Overview
This guide provides comprehensive instructions for setting up and running the Resume Scanner application. The application uses FastAPI, SQLAlchemy, and integrates with Ollama LLM for AI-powered resume analysis.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows
- **RAM**: Minimum 8GB (16GB recommended for optimal performance)
- **Storage**: At least 5GB free space
- **CPU**: Multi-core processor recommended

### Software Requirements
- **Docker**: Version 20.10+ (for containerized deployment)
- **Docker Compose**: Version 2.0+ (for local development)
- **Python**: Version 3.10+ (for local development)
- **Git**: For cloning the repository

---

## Quick Start (Docker) - Recommended

### 1. Clone the Repository
```bash
git clone https://github.com/nadeemali001/myAIHr.git
cd myAIHr
```

### 2. Run with Docker (Easiest Method)
```bash
# Pull and run the pre-built image
docker run -d \
  --name resume-scanner \
  -p 8000:8000 \
  -p 11434:11434 \
  -v $(pwd)/data:/app/data \
  nadeemali001/resume-scanner:latest
```

### 3. Access the Application
- **Web Interface**: http://localhost:8000
- **Ollama API**: http://localhost:11434

### 4. Default Login
- **Email**: `nadeemali001@gmail.com`
- **Password**: `password123`

---

## Local Development Setup

### 1. Clone and Navigate
```bash
git clone https://github.com/nadeemali001/myAIHr.git
cd myAIHr
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install and Setup Ollama

#### On Linux/macOS:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve &

# Pull the required model
ollama pull llama3.2:3b
```

#### On Windows:
1. Download Ollama from https://ollama.ai/download
2. Install and run the application
3. Open command prompt and run:
```cmd
ollama pull llama3.2:3b
```

### 5. Initialize Database
```bash
python3 -c "
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
print('Database initialized successfully!')
"
```

### 6. Create Admin User
```bash
python3 -c "
from database import SessionLocal
from auth import create_user
from models import User

db = SessionLocal()
try:
    # Check if user exists
    existing = db.query(User).filter(User.email == 'admin@example.com').first()
    if not existing:
        create_user(db, 'admin@example.com', 'admin123')
        print('Admin user created: admin@example.com / admin123')
    else:
        print('Admin user already exists')
finally:
    db.close()
"
```

### 7. Run the Application
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 8. Access the Application
- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Production Deployment

### 1. Using Docker Compose

#### Create docker-compose.yml:
```yaml
version: '3.8'
services:
  resume-scanner:
    image: nadeemali001/resume-scanner:latest
    ports:
      - "8000:8000"
      - "11434:11434"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_PORT=11434
      - SECRET_KEY=your-production-secret-key
      - DEBUG=False
    restart: unless-stopped
```

#### Deploy:
```bash
docker-compose up -d
```

### 2. Using Docker (Manual)

#### Build Production Image:
```bash
docker build -f Dockerfile.prod -t resume-scanner-prod:latest .
```

#### Run Production Container:
```bash
docker run -d \
  --name resume-scanner-prod \
  -p 8000:8000 \
  -p 11434:11434 \
  -v /path/to/data:/app/data \
  -v /path/to/logs:/app/logs \
  -e SECRET_KEY=your-production-secret-key \
  -e DEBUG=False \
  --restart unless-stopped \
  resume-scanner-prod:latest
```

### 3. AWS Deployment

#### Using ECS:
```bash
# Build and push to ECR
./deploy-aws.sh

# Deploy using AWS CLI
aws ecs create-service \
  --cluster your-cluster \
  --service-name resume-scanner \
  --task-definition resume-scanner:1 \
  --desired-count 1
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `dev-secret-key` | JWT secret key for sessions |
| `DEBUG` | `True` | Enable debug mode |
| `OLLAMA_HOST` | `0.0.0.0` | Ollama server host |
| `OLLAMA_PORT` | `11434` | Ollama server port |
| `OLLAMA_API` | `http://localhost:11434/api/generate` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3.2:3b` | Default LLM model |
| `DATABASE_URL` | `sqlite:///./resume.db` | Database connection string |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded files |
| `PROFILE_PHOTO_DIR` | `profile_photos` | Directory for profile photos |
| `MAX_FILE_SIZE` | `10485760` | Maximum file size (10MB) |
| `MONTHLY_QUOTA` | `10` | Monthly scans per user |
| `UNLIMITED_QUOTA_EMAILS` | `['nadeemali001@gmail.com']` | Emails with unlimited quota |

### Database Configuration

#### SQLite (Default)
- **File**: `resume.db`
- **Location**: Project root directory
- **Backup**: Automatically created as `resume.db.bak`

#### PostgreSQL (Production)
```python
# Update config.py
DATABASE_URL = "postgresql://user:password@localhost/resume_scanner"
```

### File Storage Configuration

#### Local Storage (Default)
- **Uploads**: `./uploads/`
- **Profile Photos**: `./profile_photos/`
- **Logs**: `./logs/`

#### Cloud Storage (Production)
```python
# Add to config.py
AWS_ACCESS_KEY_ID = "your-access-key"
AWS_SECRET_ACCESS_KEY = "your-secret-key"
AWS_BUCKET_NAME = "your-bucket"
AWS_REGION = "us-east-1"
```

---

## Troubleshooting

### Common Issues

#### 1. Ollama Connection Error
**Error**: `Error calling Ollama LLM: 404 Client Error`

**Solution**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve &

# Pull the model
ollama pull llama3.2:3b
```

#### 2. Database Connection Error
**Error**: `sqlalchemy.exc.OperationalError`

**Solution**:
```bash
# Check database file permissions
ls -la resume.db

# Recreate database
rm resume.db
python3 -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

#### 3. File Upload Error
**Error**: `413 Request Entity Too Large`

**Solution**:
- Check file size (max 10MB)
- Verify upload directory permissions
- Update `MAX_FILE_SIZE` in config

#### 4. Authentication Error
**Error**: `bcrypt version error`

**Solution**:
```bash
# Reset user password
python3 -c "
from database import SessionLocal
from auth import get_password_hash
from models import User

db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@example.com').first()
if user:
    user.hashed_password = get_password_hash('newpassword123')
    db.commit()
    print('Password reset successful')
db.close()
"
```

### Performance Issues

#### 1. Slow LLM Responses
- **Increase RAM**: Minimum 16GB recommended
- **Use GPU**: Install CUDA-enabled Ollama
- **Optimize Model**: Use smaller model for faster responses

#### 2. High Memory Usage
- **Monitor Processes**: `docker stats`
- **Restart Services**: `docker restart resume-scanner`
- **Clear Cache**: Remove old analysis results

#### 3. Database Performance
- **Index Optimization**: Add indexes for frequently queried fields
- **Connection Pooling**: Configure SQLAlchemy pool settings
- **Regular Cleanup**: Remove old scan results

### Log Analysis

#### View Application Logs
```bash
# Docker
docker logs resume-scanner

# Local
tail -f logs/app.log
```

#### Common Log Patterns
- **INFO**: Normal operation
- **WARNING**: Non-critical issues
- **ERROR**: Critical errors requiring attention
- **DEBUG**: Detailed debugging information

---

## Maintenance

### Regular Tasks

#### 1. Database Backup
```bash
# Create backup
cp resume.db resume.db.backup.$(date +%Y%m%d)

# Restore from backup
cp resume.db.backup.20240101 resume.db
```

#### 2. Log Rotation
```bash
# Rotate logs
mv logs/app.log logs/app.log.old
touch logs/app.log

# Or use logrotate
logrotate -f /etc/logrotate.d/resume-scanner
```

#### 3. File Cleanup
```bash
# Remove old uploads (older than 30 days)
find uploads/ -type f -mtime +30 -delete

# Remove old profile photos
find profile_photos/ -type f -mtime +90 -delete
```

#### 4. Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild Docker image
docker build -t resume-scanner:latest .

# Restart services
docker-compose down
docker-compose up -d
```

### Monitoring

#### 1. Health Checks
```bash
# Application health
curl http://localhost:8000/health

# Ollama health
curl http://localhost:11434/api/tags
```

#### 2. Resource Monitoring
```bash
# Docker stats
docker stats resume-scanner

# System resources
htop
df -h
```

#### 3. Error Monitoring
```bash
# Check for errors
grep ERROR logs/app.log

# Monitor real-time
tail -f logs/app.log | grep ERROR
```

---

## Security Considerations

### 1. Change Default Credentials
- Update admin email and password
- Use strong, unique passwords
- Enable two-factor authentication if possible

### 2. Secure Configuration
- Use environment variables for secrets
- Enable HTTPS in production
- Configure proper CORS settings

### 3. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Implement rate limiting

### 4. Database Security
- Use strong database passwords
- Enable database encryption
- Regular security updates

---

## Support and Documentation

### Additional Resources
- **API Documentation**: http://localhost:8000/docs
- **Function Documentation**: See `FUNCTION_DOCUMENTATION.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **GitHub Repository**: https://github.com/nadeemali001/myAIHr

### Getting Help
1. Check the troubleshooting section above
2. Review application logs for error details
3. Search existing GitHub issues
4. Create a new issue with detailed error information

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Quick Reference

### Essential Commands
```bash
# Start with Docker
docker run -d -p 8000:8000 -p 11434:11434 nadeemali001/resume-scanner:latest

# Local development
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Check status
curl http://localhost:8000

# View logs
docker logs resume-scanner

# Stop application
docker stop resume-scanner
```

### Default URLs
- **Application**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Ollama API**: http://localhost:11434
- **Health Check**: http://localhost:8000/health

### Default Credentials
- **Email**: `nadeemali001@gmail.com`
- **Password**: `password123`

This completes the setup and run guide. The application should now be fully functional and ready for use!

# Backend Docker Setup

This document provides comprehensive instructions for running the Resume Scanner backend using Docker in both development and production environments.

## 🐳 Docker Architecture

The backend uses a unified Docker approach that works for both development and production:

- **Base Image**: Python 3.11-slim for optimal size and performance
- **Security**: Non-root user execution
- **Development**: Source code mounting with hot reload
- **Production**: Gunicorn with multiple workers for high performance

## 📁 Docker Files

- `Dockerfile` - Unified Docker image for both dev and prod
- `docker-compose.yml` - Main orchestration file
- `docker-compose.prod.yml` - Production overrides
- `gunicorn.conf.py` - Production server configuration
- `.dockerignore` - Files to exclude from Docker context
- `env.docker.example` - Environment variables template

## 🚀 Quick Start

### Development Mode

```bash
# Start development environment
make dev

# Or using docker-compose directly
docker-compose up --build
```

**Access**: http://localhost:8000

### Production Mode

```bash
# Start production environment
make prod

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

**Access**: http://localhost:8000

## 📋 Available Commands

### Development Commands

```bash
# Start development environment
make dev

# Stop environment
make stop

# View logs
make logs

# Enter container shell
make shell

# Check health
make health
```

### Production Commands

```bash
# Start production environment
make prod

# Stop production environment
make stop-prod

# View production logs
make logs-prod
```

### Build Commands

```bash
# Build image
make build

# Run container manually
make run
```

### Maintenance Commands

```bash
# Clean up Docker resources
make clean

# Run tests
make test

# Database operations
make db-reset
make db-migrate
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Application Settings
NODE_ENV=development
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# Database Configuration
DATABASE_URL=sqlite:///./database/resume.db

# Ollama AI Configuration
OLLAMA_HOST=localhost
OLLAMA_PORT=11434

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Development Configuration

The development environment includes:

- **Hot Reload**: Source code is mounted for live editing
- **Debug Mode**: Full debugging capabilities enabled
- **Volume Mounting**: Uploads, logs, and database are persisted
- **Port Mapping**: Backend accessible on port 8000

### Production Configuration

The production environment includes:

- **Gunicorn**: High-performance WSGI server
- **Multiple Workers**: CPU-based worker scaling
- **Resource Limits**: Memory and CPU constraints
- **Security**: Non-root user execution
- **Health Checks**: Built-in health monitoring

## 🏗️ Build Process

### Unified Build

The Dockerfile uses a single-stage build optimized for both environments:

1. **Base Setup**: Python 3.11-slim with system dependencies
2. **Dependencies**: Install Python packages from requirements.txt
3. **Security**: Create and switch to non-root user
4. **Configuration**: Set up directories and permissions
5. **Health Check**: Built-in health monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker-compose logs backend
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Database Issues**
   ```bash
   # Reset database
   make db-reset
   
   # Check database files
   ls -la database/
   ```

4. **Permission Issues**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER uploads/ logs/ database/
   ```

### Debug Commands

```bash
# Enter container shell
make shell

# Check container status
docker ps -a

# View container logs
docker logs <container_name>

# Check container resources
docker stats <container_name>
```

## 📊 Performance Optimization

### Development

- **Volume Mounting**: Only mount necessary directories
- **Debug Mode**: Full debugging capabilities
- **Hot Reload**: Automatic code reloading

### Production

- **Gunicorn Workers**: CPU-based scaling
- **Resource Limits**: Memory and CPU constraints
- **Preload App**: Faster worker startup
- **Connection Pooling**: Optimized database connections

## 🔒 Security Considerations

### Container Security

- **Non-root User**: Run containers as non-root user
- **Minimal Base Image**: Use Python slim for smaller attack surface
- **Resource Limits**: Prevent resource exhaustion
- **Health Checks**: Monitor container health

### Application Security

- **Environment Variables**: Secure handling of sensitive data
- **File Permissions**: Proper file and directory permissions
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Comprehensive input sanitization

## 📈 Monitoring and Logging

### Health Checks

```bash
# Check container health
make health

# Manual health check
curl http://localhost:8000/health
```

### Logging

```bash
# View real-time logs
make logs

# View specific service logs
docker-compose logs -f backend
```

### Database Monitoring

```bash
# Check database status
make db-migrate

# Reset database if needed
make db-reset
```

## 🚀 Deployment

### Local Deployment

```bash
# Development
make dev

# Production
make prod
```

### Production Deployment

1. **Build Images**: `docker-compose build`
2. **Start Services**: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
3. **Monitor**: `docker-compose logs -f`

### Scaling

```bash
# Scale services
docker-compose up --scale backend=3
```

## 📚 Best Practices

1. **Use .dockerignore**: Exclude unnecessary files
2. **Non-root User**: Run as non-root for security
3. **Health Checks**: Monitor container health
4. **Resource Limits**: Set appropriate limits
5. **Environment Variables**: Use proper configuration management
6. **Volume Mounting**: Persist important data
7. **Logging**: Implement comprehensive logging

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update requirements.txt
pip freeze > requirements.txt

# Rebuild containers
docker-compose build --no-cache
```

### Database Migrations

```bash
# Run migrations
make db-migrate

# Reset database
make db-reset
```

### Cleaning Up

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
make clean
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
make test

# Run specific tests
docker-compose exec backend python -m pytest tests/test_auth.py
```

### Test Coverage

```bash
# Generate coverage report
docker-compose exec backend python -m pytest --cov=scripts
```

This Docker setup provides a robust, scalable, and production-ready environment for the Resume Scanner backend application.


# Frontend Docker Setup

This document provides comprehensive instructions for running the Resume Scanner frontend using Docker in both development and production environments.

## 🐳 Docker Architecture

The frontend uses a multi-stage Docker build approach:

- **Development**: Node.js container with hot reload and volume mounting
- **Production**: Multi-stage build with Nginx for optimal performance

## 📁 Docker Files

- `Dockerfile.dev` - Development environment with hot reload
- `Dockerfile` - Production multi-stage build
- `docker-compose.dev.yml` - Development orchestration
- `docker-compose.prod.yml` - Production orchestration
- `nginx.conf` - Nginx configuration for production
- `.dockerignore` - Files to exclude from Docker context

## 🚀 Quick Start

### Development Mode

```bash
# Start development environment
npm run docker:dev

# Or using docker-compose directly
docker-compose -f docker-compose.dev.yml up --build
```

**Access**: http://localhost:3000

### Production Mode

```bash
# Start production environment
npm run docker:prod

# Or using docker-compose directly
docker-compose -f docker-compose.prod.yml up --build
```

**Access**: http://localhost:80

## 📋 Available Commands

### Development Commands

```bash
# Start development environment
npm run docker:dev

# Stop development environment
npm run docker:dev:down

# View development logs
npm run docker:logs:dev

# Build development image only
npm run docker:build:dev

# Run development container manually
npm run docker:run:dev
```

### Production Commands

```bash
# Start production environment
npm run docker:prod

# Stop production environment
npm run docker:prod:down

# View production logs
npm run docker:logs:prod

# Build production image only
npm run docker:build

# Run production container manually
npm run docker:run
```

### Maintenance Commands

```bash
# Clean up Docker resources
npm run docker:clean

# View all logs
npm run docker:logs
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Resume Scanner
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=AI-powered resume analysis and career assistance
```

### Development Configuration

The development environment includes:

- **Hot Reload**: Automatic code reloading on changes
- **Volume Mounting**: Source code is mounted for live editing
- **Port Mapping**: Frontend accessible on port 3000
- **API Proxy**: Automatic proxy to backend on port 8000

### Production Configuration

The production environment includes:

- **Nginx**: High-performance web server
- **Static Assets**: Optimized and cached static files
- **Security Headers**: Comprehensive security configuration
- **Gzip Compression**: Automatic compression for better performance
- **Health Checks**: Built-in health monitoring

## 🏗️ Build Process

### Development Build

```dockerfile
FROM node:18-alpine
# Install dependencies
# Copy source code
# Start development server
```

### Production Build (Multi-stage)

1. **Dependencies Stage**: Install production dependencies
2. **Builder Stage**: Build the React application
3. **Runner Stage**: Serve with Nginx

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :80
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker-compose logs frontend-dev
   docker-compose logs frontend-prod
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Hot Reload Not Working**
   ```bash
   # Ensure volume mounting is correct
   # Check file permissions
   # Restart the container
   ```

4. **API Connection Issues**
   ```bash
   # Check environment variables
   # Verify backend is running
   # Check network connectivity
   ```

### Debug Commands

```bash
# Enter container shell
docker exec -it <container_name> sh

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
- **Node Modules**: Use anonymous volume for node_modules
- **File Watching**: Optimize file watching patterns

### Production

- **Multi-stage Build**: Minimize final image size
- **Nginx Caching**: Configure appropriate cache headers
- **Gzip Compression**: Enable compression for text assets
- **Security Headers**: Implement comprehensive security

## 🔒 Security Considerations

### Container Security

- **Non-root User**: Run containers as non-root user
- **Minimal Base Image**: Use Alpine Linux for smaller attack surface
- **Security Headers**: Implement comprehensive security headers
- **Resource Limits**: Set appropriate resource limits

### Network Security

- **Internal Networks**: Use Docker networks for service communication
- **Port Exposure**: Only expose necessary ports
- **Environment Variables**: Secure handling of sensitive data

## 📈 Monitoring and Logging

### Health Checks

```bash
# Check container health
docker inspect <container_name> | grep Health

# Manual health check
curl http://localhost/health
```

### Logging

```bash
# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend-dev
docker-compose logs -f frontend-prod
```

## 🚀 Deployment

### Local Deployment

```bash
# Development
npm run docker:dev

# Production
npm run docker:prod
```

### Production Deployment

1. **Build Images**: `docker-compose -f docker-compose.prod.yml build`
2. **Start Services**: `docker-compose -f docker-compose.prod.yml up -d`
3. **Monitor**: `docker-compose -f docker-compose.prod.yml logs -f`

### Scaling

```bash
# Scale services
docker-compose -f docker-compose.prod.yml up --scale frontend-prod=3
```

## 📚 Best Practices

1. **Use .dockerignore**: Exclude unnecessary files
2. **Multi-stage Builds**: Optimize image size
3. **Health Checks**: Monitor container health
4. **Resource Limits**: Set appropriate limits
5. **Security**: Run as non-root user
6. **Caching**: Optimize layer caching
7. **Environment Variables**: Use proper configuration management

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update package.json
npm update

# Rebuild containers
docker-compose build --no-cache
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
npm run docker:clean
```

This Docker setup provides a robust, scalable, and production-ready environment for the Resume Scanner frontend application.



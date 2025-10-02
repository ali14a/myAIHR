# Docker Configuration

This directory contains all Docker-related configuration files for the Resume Scanner Frontend application.

## 📁 Files

- **`Dockerfile`** - Production Docker image configuration
- **`Dockerfile.dev`** - Development Docker image configuration  
- **`docker-compose.dev.yml`** - Development environment setup
- **`docker-compose.prod.yml`** - Production environment setup
- **`env.docker.example`** - Example environment variables for Docker

## 🚀 Quick Start

### Development
```bash
# Using Makefile (recommended)
make dev

# Using npm scripts
npm run docker:dev

# Using docker-compose directly
docker-compose -f docker/docker-compose.dev.yml up --build
```

### Production
```bash
# Using Makefile (recommended)
make prod

# Using npm scripts
npm run docker:prod

# Using docker-compose directly
docker-compose -f docker/docker-compose.prod.yml up --build
```

## 🔧 Configuration

### Environment Variables

Copy `env.docker.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Resume Scanner
VITE_APP_VERSION=1.0.0
```

### Ports

- **Development**: `http://localhost:3000`
- **Production**: `http://localhost:80`

## 📋 Available Commands

### Development
- `make dev` - Start development environment
- `make stop-dev` - Stop development environment
- `make logs-dev` - View development logs
- `make shell-dev` - Enter development container shell

### Production
- `make prod` - Start production environment
- `make stop` - Stop production environment
- `make logs-prod` - View production logs
- `make shell-prod` - Enter production container shell

### Build
- `make build` - Build production image
- `make build-dev` - Build development image

### Maintenance
- `make clean` - Clean up Docker resources
- `make health` - Check container health

## 🏗️ Architecture

### Development Setup
- **Base Image**: `node:18-alpine`
- **Hot Reload**: Enabled with volume mounting
- **Port**: 3000
- **Volumes**: Source code mounted for live updates

### Production Setup
- **Multi-stage Build**: Optimized for size and security
- **Base Image**: `nginx:alpine` (final stage)
- **Port**: 80
- **Security**: Non-root user execution
- **Health Check**: Built-in health monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :80
   
   # Kill the process or use different ports
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Build Failures**
   ```bash
   # Clean Docker cache
   make clean
   docker system prune -a
   ```

### Logs
```bash
# View all logs
make logs

# View specific environment logs
make logs-dev
make logs-prod
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

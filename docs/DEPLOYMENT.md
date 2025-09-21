# Deployment Guide for AI Resume Scanner

This guide covers multiple deployment options for the AI Resume Scanner application.

## 🐳 Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose (optional)

### Quick Start with Docker

1. **Build and run with Docker Compose:**
```bash
# Clone the repository
git clone <your-repo-url>
cd myAIHr

# Build and start the application
docker-compose up --build

# The application will be available at http://localhost:8000
```

2. **Build and run manually:**
```bash
# Build the image
docker build -t resume-scanner .

# Run the container
docker run -p 8000:8000 -p 11434:11434 resume-scanner
```

### Production Deployment

For production, use the production Dockerfile:

```bash
# Build production image
docker build -f Dockerfile.prod -t resume-scanner:prod .

# Run with production settings
docker run -d \
  --name resume-scanner \
  -p 8000:8000 \
  -p 11434:11434 \
  -e SECRET_KEY=your-production-secret-key \
  -e DEBUG=False \
  -v $(pwd)/resume.db:/app/resume.db \
  resume-scanner:prod
```

## ☁️ AWS Deployment

### Prerequisites
- AWS CLI configured
- Docker installed
- ECR repository created
- ECS cluster and service configured

### Step 1: Prepare AWS Resources

1. **Create ECR Repository:**
```bash
aws ecr create-repository --repository-name resume-scanner --region us-east-1
```

2. **Create ECS Cluster:**
```bash
aws ecs create-cluster --cluster-name resume-scanner-cluster --region us-east-1
```

3. **Create Task Definition:**
```bash
# Use the provided aws-deploy.yml to create your task definition
aws ecs register-task-definition --cli-input-json file://aws-deploy.yml
```

### Step 2: Deploy to AWS

1. **Run the deployment script:**
```bash
./deploy-aws.sh
```

2. **Manual deployment:**
```bash
# Build and tag image
docker build -t resume-scanner .
docker tag resume-scanner:latest your-account.dkr.ecr.us-east-1.amazonaws.com/resume-scanner:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/resume-scanner:latest

# Update ECS service
aws ecs update-service --cluster resume-scanner-cluster --service resume-scanner-service --force-new-deployment
```

## 🔧 Environment Variables

### Required Variables
- `SECRET_KEY`: Secret key for session management
- `DATABASE_URL`: Database connection string (default: sqlite:///./resume.db)

### Optional Variables
- `DEBUG`: Enable debug mode (default: False)
- `OLLAMA_HOST`: Ollama host (default: 0.0.0.0)
- `OLLAMA_PORT`: Ollama port (default: 11434)
- `MAX_MONTHLY_SCANS`: Monthly scan limit (default: 5)

## 📊 Resource Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 10GB disk space

### Recommended for Production
- **CPU**: 4 cores
- **Memory**: 8GB RAM
- **Storage**: 50GB disk space

## 🚀 Performance Optimization

### For AWS ECS
1. **Use Fargate with appropriate CPU/Memory allocation**
2. **Enable CloudWatch logging**
3. **Set up auto-scaling based on CPU/memory usage**
4. **Use Application Load Balancer for high availability**

### For Docker
1. **Use multi-stage builds to reduce image size**
2. **Enable Docker layer caching**
3. **Use .dockerignore to exclude unnecessary files**

## 🔒 Security Considerations

1. **Change default SECRET_KEY in production**
2. **Use HTTPS in production**
3. **Set up proper firewall rules**
4. **Regular security updates**
5. **Monitor logs for suspicious activity**

## 📝 Monitoring and Logging

### Health Checks
The application includes health checks at:
- `http://your-domain:8000/` - Main application health
- `http://your-domain:11434/api/tags` - Ollama health

### Logs
- Application logs: `/app/logs/app.log`
- Docker logs: `docker logs <container-name>`

## 🛠️ Troubleshooting

### Common Issues

1. **Ollama not starting:**
   - Check if port 11434 is available
   - Verify Ollama installation
   - Check logs for errors

2. **Database issues:**
   - Ensure database file has proper permissions
   - Check if SQLite is installed
   - Verify database path

3. **Memory issues:**
   - Increase container memory limit
   - Use smaller Ollama model
   - Monitor resource usage

### Debug Mode
Enable debug mode for detailed logging:
```bash
docker run -e DEBUG=True -e LOG_LEVEL=DEBUG resume-scanner
```

## 📈 Scaling

### Horizontal Scaling
- Use multiple container instances
- Implement load balancing
- Use shared storage for uploads

### Vertical Scaling
- Increase CPU/memory allocation
- Use more powerful Ollama models
- Optimize database queries

## 🔄 Updates and Maintenance

### Updating the Application
1. Pull latest changes
2. Rebuild Docker image
3. Deploy new version
4. Test functionality

### Database Migrations
The application automatically handles database migrations on startup.

### Backup Strategy
- Regular database backups
- Backup uploaded files
- Store backups in secure location

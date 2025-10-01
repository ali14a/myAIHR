# Deployment Guide for AI Resume Scanner

This guide covers multiple deployment options for the AI Resume Scanner application.


## ☁️ AWS Deployment

### Prerequisites
- AWS CLI configured
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

### For Production
1. **Use production-ready web server (Gunicorn)**
2. **Enable caching for static assets**
3. **Use environment-specific configurations**

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
- System logs: Check system log files

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
export DEBUG=True
export LOG_LEVEL=DEBUG
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
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
2. Restart application services
3. Deploy new version
4. Test functionality

### Database Migrations
The application automatically handles database migrations on startup.

### Backup Strategy
- Regular database backups
- Backup uploaded files
- Store backups in secure location

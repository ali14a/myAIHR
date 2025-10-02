# Nginx Configuration Documentation

This document explains the nginx configurations used in the Resume Scanner Frontend project.

## 📁 Configuration Files

- **`nginx.conf`** - Development/standard nginx configuration
- **`nginx.prod.conf`** - Production-optimized nginx configuration with enhanced security

## 🔧 Configuration Features

### Security Headers

Both configurations include comprehensive security headers:

- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Content-Security-Policy**: Prevents XSS and data injection attacks
- **Permissions-Policy**: Controls browser features access
- **Strict-Transport-Security**: Enforces HTTPS (production only)

### Performance Optimizations

#### Gzip Compression
- Compresses text-based files (HTML, CSS, JS, JSON, XML)
- Configurable compression level (6 for optimal balance)
- Vary header for proper caching

#### Brotli Compression (Production)
- Additional compression for supported browsers
- Higher compression ratio than gzip
- Automatic fallback to gzip

#### Caching Strategies
- **HTML files**: No cache (always fresh)
- **Static assets**: 1 year cache with immutable directive
- **Service worker**: No cache
- **Manifest**: No cache

### SPA (Single Page Application) Support

- **Client-side routing**: All routes fallback to `index.html`
- **404 handling**: Redirects to `index.html` for React Router
- **Error pages**: Custom error handling

### API Proxy

- **Development**: Proxies `/api/*` to backend service
- **Rate limiting**: Prevents API abuse
- **CORS handling**: Proper cross-origin request handling
- **Timeout settings**: Prevents hanging requests

## 🚀 Usage

### Development
```bash
# Uses nginx.conf
npm run docker:dev
```

### Production
```bash
# Uses nginx.prod.conf
npm run docker:prod
```

### Custom Build
```bash
# Build with specific configuration
docker build -f docker/Dockerfile.prod -t resume-scanner-frontend:prod .
```

## 🔒 Security Features

### File Access Control
- Blocks access to hidden files (`.htaccess`, `.env`, etc.)
- Blocks backup and temporary files
- Blocks source files (`.ts`, `.tsx`, `.js.map`)
- Blocks configuration files

### Rate Limiting
- **API endpoints**: 10 requests/second with burst of 20
- **Login endpoints**: 1 request/second with burst of 5
- **429 status**: Returns proper rate limit exceeded response

### CORS Configuration
- **Preflight requests**: Properly handled
- **Allowed methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed headers**: Standard headers plus custom ones
- **Max age**: 20 days for preflight cache

## 📊 Monitoring

### Health Checks
- **Endpoint**: `/health`
- **Response**: `200 OK` with "healthy" message
- **Docker healthcheck**: Integrated with container health monitoring

### Logging
- **Access logs**: Combined format with detailed information
- **Error logs**: Warning level and above
- **Log rotation**: Handled by Docker/logging system

## 🛠️ Customization

### Environment Variables
- **VITE_API_URL**: Backend API URL
- **VITE_APP_NAME**: Application name
- **VITE_APP_VERSION**: Application version

### Nginx Variables
- **$host**: Request hostname
- **$remote_addr**: Client IP address
- **$http_upgrade**: WebSocket upgrade header
- **$scheme**: Request scheme (http/https)

### Custom Headers
- **Server**: Hidden nginx version (production)
- **X-Real-IP**: Real client IP
- **X-Forwarded-For**: Client IP chain
- **X-Forwarded-Proto**: Original protocol

## 🔍 Troubleshooting

### Common Issues

1. **404 errors on refresh**
   - Ensure `try_files $uri $uri/ /index.html;` is present
   - Check that `index.html` exists in the root

2. **API requests failing**
   - Verify backend service is running
   - Check proxy_pass URL is correct
   - Ensure CORS headers are properly set

3. **Static assets not loading**
   - Check file permissions
   - Verify cache headers are correct
   - Ensure gzip is working

4. **Security headers blocking content**
   - Adjust Content-Security-Policy
   - Check for mixed content issues
   - Verify CORS configuration

### Debug Commands

```bash
# Check nginx configuration
docker exec -it container_name nginx -t

# View nginx logs
docker logs container_name

# Test health endpoint
curl http://localhost/health

# Check headers
curl -I http://localhost
```

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx Security Headers](https://securityheaders.com/)
- [Nginx Performance Tuning](https://nginx.org/en/docs/http/ngx_http_core_module.html)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

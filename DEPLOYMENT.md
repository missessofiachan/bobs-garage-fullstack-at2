# Deployment Guide

This guide covers deploying Bob's Garage to production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Building the Application](#building-the-application)
- [Deployment Options](#deployment-options)
- [Production Checklist](#production-checklist)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20.x or higher
- MySQL 8.0+ or PostgreSQL
- PM2 or similar process manager (recommended)
- Reverse proxy (Nginx, Apache, or cloud load balancer)
- SSL certificate (Let's Encrypt recommended)

## Environment Setup

### Server Environment Variables

Create `server/.env` with production values:

```env
# Server
NODE_ENV=production
PORT=4000

# Database
DATABASE_HOST=your-db-host
DATABASE_PORT=3306
DATABASE_NAME=bobs_garage
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-secure-password
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-secure-refresh-token-secret-min-32-chars
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
BASE_URL=https://api.yourdomain.com

# File Uploads
UPLOAD_DIR=uploads
UPLOAD_MAX_SIZE=2097152

# Monitoring
METRICS_ENABLED=true
LOG_LEVEL=info
DETAILED_LOGGING_ENABLED=false
SLOW_QUERY_THRESHOLD_MS=1000

# Rate Limiting
RATE_LIMIT_MAX=200
RATE_LIMIT_AUTHENTICATED_MAX=500
RATE_LIMIT_WINDOW_MS=60000

# Performance
BODY_PARSER_LIMIT=10kb
COMPRESSION_ENABLED=true

# Caching
CACHE_ENABLED=true
CACHE_TYPE=memory
CACHE_TTL_SECONDS=300
```

### Client Environment Variables

Create `client/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Database Setup

### Production Database

1. **Create database**:
   ```sql
   CREATE DATABASE bobs_garage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Create user**:
   ```sql
   CREATE USER 'bobs_garage'@'%' IDENTIFIED BY 'secure-password';
   GRANT ALL PRIVILEGES ON bobs_garage.* TO 'bobs_garage'@'%';
   FLUSH PRIVILEGES;
   ```

3. **Run migrations**:
   ```bash
   cd server
   yarn migrate
   ```

4. **Seed initial data** (optional):
   ```bash
   yarn seed
   ```

## Building the Application

### Build Both Client and Server

```bash
# From project root
yarn build
```

This will:
- Build client to `client/dist/`
- Compile server TypeScript to `server/dist/`

### Build Separately

```bash
# Client only
yarn workspace client build

# Server only
yarn workspace server build
```

## Deployment Options

### Option 1: PM2 Process Manager

1. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'bobs-garage-server',
       script: './server/dist/server.js',
       instances: 2,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 4000
       },
       error_file: './logs/pm2-error.log',
       out_file: './logs/pm2-out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
       autorestart: true,
       max_memory_restart: '1G'
     }]
   };
   ```

3. **Start application**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Option 2: Docker

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package.json yarn.lock ./
   RUN yarn install --frozen-lockfile
   COPY . .
   RUN yarn build
   EXPOSE 4000
   CMD ["node", "server/dist/server.js"]
   ```

2. **Build and run**:
   ```bash
   docker build -t bobs-garage .
   docker run -d -p 4000:4000 --env-file server/.env bobs-garage
   ```

### Option 3: Cloud Platforms

#### Vercel / Netlify (Client)

1. Configure build settings:
   - Build command: `yarn workspace client build`
   - Output directory: `client/dist`
   - Install command: `yarn install`

2. Set environment variables in platform dashboard

#### Railway / Render / Fly.io (Server)

1. Connect GitHub repository
2. Set environment variables
3. Configure build command: `yarn build`
4. Set start command: `node server/dist/server.js`

## Production Checklist

### Security

- [ ] All environment variables set and secure
- [ ] `COOKIE_SECURE=true` for HTTPS
- [ ] `JWT_SECRET` is at least 32 characters, randomly generated
- [ ] Database credentials are secure
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled and configured
- [ ] Input sanitization enabled
- [ ] SSL/TLS certificate installed
- [ ] Security headers configured (Helmet)
- [ ] File upload size limits enforced

### Performance

- [ ] Compression enabled (`COMPRESSION_ENABLED=true`)
- [ ] Caching configured appropriately
- [ ] Database indexes created
- [ ] Database connection pooling configured
- [ ] Static files served efficiently
- [ ] CDN configured for static assets (optional)

### Monitoring

- [ ] Health check endpoint accessible (`/health`)
- [ ] Metrics endpoint configured (`/metrics`)
- [ ] Logging configured and centralized
- [ ] Error tracking set up (e.g., Sentry)
- [ ] Uptime monitoring configured

### Application

- [ ] Database migrations run
- [ ] All tests passing
- [ ] Client build successful
- [ ] Server build successful
- [ ] Environment variables validated
- [ ] File upload directory exists and writable
- [ ] Logs directory exists and writable

## Reverse Proxy Setup

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js server
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static file serving for uploads
    location /uploads/ {
        alias /path/to/server/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Serve Client (Static Files)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    root /path/to/client/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Monitoring

### Health Checks

Monitor these endpoints:
- `GET /health` - Application health
- `GET /db-status` - Database connection
- `GET /metrics` - Prometheus metrics (if enabled)

### Logs

- Application logs: `server/logs/`
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`

### Metrics

If Prometheus is enabled:
- Scrape `/metrics` endpoint
- Monitor request rates, error rates, response times
- Set up alerts for critical metrics

## Troubleshooting

### Application Won't Start

1. Check environment variables are set
2. Verify database connection
3. Check port availability: `lsof -i :4000`
4. Review logs: `pm2 logs` or `tail -f server/logs/error.log`

### Database Connection Issues

1. Verify database is running
2. Check credentials in `.env`
3. Verify network connectivity
4. Check firewall rules

### Build Failures

1. Clear node_modules: `rm -rf node_modules && yarn install`
2. Clear build cache: `rm -rf client/dist server/dist`
3. Check Node.js version: `node --version` (should be 20+)
4. Review build logs for specific errors

### Performance Issues

1. Check database query performance
2. Review slow query logs
3. Verify caching is working
4. Check server resources (CPU, memory)
5. Review metrics endpoint

## Backup Strategy

### Database Backups

```bash
# Daily backup script
mysqldump -u user -p bobs_garage > backup_$(date +%Y%m%d).sql

# Restore
mysql -u user -p bobs_garage < backup_20240101.sql
```

### File Upload Backups

- Regularly backup `server/uploads/` directory
- Consider cloud storage for uploads (S3, etc.)

## Updates and Maintenance

### Updating Application

1. Pull latest changes
2. Install dependencies: `yarn install`
3. Run migrations: `yarn workspace server migrate`
4. Build: `yarn build`
5. Restart: `pm2 restart bobs-garage-server`

### Zero-Downtime Deployment

1. Deploy to new instances
2. Run health checks
3. Switch traffic (load balancer)
4. Monitor for issues
5. Remove old instances

---

**Need Help?** Open an issue or check the troubleshooting section in the main README.


# 🚀 Deployment Guide - Guru Digital Pelangi

## 📋 Deployment Options

Panduan untuk deploy aplikasi Guru Digital Pelangi ke production environment.

### 🏗️ Recommended Architecture
```
Internet
    ↓
Load Balancer (Nginx)
    ↓
Frontend (React App)
    ↓
Backend API (Node.js/Express)
    ↓
Database (MySQL)
```

---

## �️ VPS Ubuntu Deployment (Recommended untuk ServerAvatar)

### Prerequisites
- VPS Ubuntu 20.04+ dengan ServerAvatar panel
- Domain name
- SSL Certificate (ServerAvatar akan handle ini)

### 1. Server Setup via ServerAvatar

**Login ke ServerAvatar Dashboard:**
1. Connect your VPS to ServerAvatar
2. Install required services:
   - **PHP** (untuk panel, pilih latest version)
   - **Node.js** (pilih versi 18+)
   - **MySQL** (versi 8.0+)
   - **Nginx** (akan auto-install)

### 2. Database Setup

**Via ServerAvatar MySQL Panel:**
1. Buat database baru: `guru_digital_pelangi`
2. Buat user database dengan permissions penuh
3. Catat credentials untuk `.env`

### 3. Application Deployment

**Clone & Setup Repository:**
```bash
# SSH ke server atau gunakan terminal di ServerAvatar
cd /home/username/applications
git clone <your-repo-url> guru-digital-pelangi
cd guru-digital-pelangi

# Install dependencies
npm install -g bun  # atau gunakan npm
bun install

# Setup backend
cd backend
bun install
```

**Environment Configuration:**
```bash
# Create .env.production
DATABASE_URL="mysql://db_user:db_password@localhost:3306/guru_digital_pelangi"

# JWT
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://yourdomain.com"

# File Upload
UPLOAD_PATH="/home/username/applications/guru-digital-pelangi/uploads"
MAX_FILE_SIZE="10mb"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Build & Database Setup

**Build Frontend:**
```bash
# Build production frontend
bun run build

# Copy dist files ke public folder
cp -r dist/* /home/username/public_html/
```

**Setup Database:**
```bash
# Run migrations
cd backend
bun run db:migrate

# Seed initial data (admin user, etc.)
bun run db:seed
```

### 5. Process Management dengan PM2

**Install & Setup PM2:**
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'guru-digital-pelangi-api',
    script: './backend/src/server.js',
    cwd: '/home/username/applications/guru-digital-pelangi',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

**Start Application:**
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 6. Nginx Configuration via ServerAvatar

**Melalui ServerAvatar Panel:**
1. **Create New Site** di ServerAvatar
2. **Domain Setup:** yourdomain.com
3. **SSL Certificate:** Auto-install via Let's Encrypt
4. **Custom Nginx Config:**

```nginx
# Redirect API calls ke backend
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# File uploads
location /uploads {
    alias /home/username/applications/guru-digital-pelangi/uploads;
    expires 1y;
    add_header Cache-Control "public, no-transform";
}

# Frontend static files
location / {
    try_files $uri $uri/ /index.html;
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

---

## 🐳 Alternative: Docker Deployment

### Prerequisites untuk Docker
- Docker & Docker Compose installed
- VPS dengan minimal 2GB RAM

### 1. Docker Configuration untuk MySQL

**Create `docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  # Database
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: guru_digital_pelangi
      MYSQL_USER: guru_user
      MYSQL_PASSWORD: your_password
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/setup-database.sql:/docker-entrypoint-initdb.d/setup.sql
    restart: unless-stopped
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./uploads:/var/www/uploads
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 3. Nginx Configuration

**Create `nginx.conf`:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream frontend {
        server frontend:4173;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static file uploads
        location /uploads/ {
            alias /var/www/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 4. Frontend Dockerfile

**Create `Dockerfile` in root:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5. Backend Dockerfile

**Create `backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
```

### 6. Deploy Commands

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

---

## ☁️ Cloud Deployment Options

### 🚀 Vercel + Railway (Easiest)

#### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

#### Backend + Database (Railway)
1. Create new Railway project
2. Add PostgreSQL service
3. Deploy backend from GitHub
4. Set environment variables

### 🌐 AWS Deployment

#### Using AWS ECS + RDS
1. **Database:** AWS RDS PostgreSQL
2. **Backend:** ECS Fargate container
3. **Frontend:** S3 + CloudFront
4. **Load Balancer:** Application Load Balancer

#### Using AWS App Runner
1. **Database:** AWS RDS PostgreSQL
2. **Application:** App Runner container service
3. **CDN:** CloudFront for static assets

### 🔷 Digital Ocean

#### Using App Platform
1. Create new App
2. Connect GitHub repository
3. Configure build settings
4. Add managed PostgreSQL database

---

## 🔧 Production Optimizations

### 1. Environment Variables
```bash
# Production settings
NODE_ENV=production
LOG_LEVEL=error
ENABLE_METRICS=true

# Database optimizations
DB_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=30000

# Caching
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-license-key
```

### 2. Database Optimizations
```sql
-- Create indexes for performance
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_xp_logs_student_id ON xp_logs(student_id);
```

### 3. Frontend Build Optimizations
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@heroui/react'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    minify: 'terser',
    sourcemap: false
  }
})
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install @sentry/node @sentry/integrations
npm install winston express-winston
```

### 2. Health Check Endpoints
```typescript
// Health check for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 3. Log Management
```yaml
# docker-compose.yml logging configuration
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🔒 Security Checklist

### Pre-deployment Security
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] JWT secrets are strong and unique
- [ ] File upload validation implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### SSL/TLS Configuration
- [ ] SSL certificate installed
- [ ] HTTP to HTTPS redirect configured
- [ ] Security headers configured
- [ ] HSTS enabled

### Access Control
- [ ] Database access restricted
- [ ] Admin interfaces secured
- [ ] File permissions set correctly
- [ ] Backup access secured

---

## 🔄 Backup & Recovery

### 1. Database Backup
```bash
# Automated daily backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U postgres guru_digital_pelangi > backup_$DATE.sql

# Keep only last 7 days
find . -name "backup_*.sql" -mtime +7 -delete
```

### 2. File Upload Backup
```bash
# Sync uploads to S3
aws s3 sync ./uploads s3://your-bucket/uploads/ --delete
```

### 3. Recovery Procedures
```bash
# Restore database
docker exec -i postgres psql -U postgres -d guru_digital_pelangi < backup_file.sql

# Restore file uploads
aws s3 sync s3://your-bucket/uploads/ ./uploads/
```

---

## 📈 Performance Monitoring

### Key Metrics to Monitor
- **Response Time:** API response times < 200ms
- **Throughput:** Requests per second
- **Error Rate:** < 1% error rate
- **Database Performance:** Query execution times
- **Memory Usage:** < 80% memory utilization
- **Disk Space:** Database and uploads storage

### Alerting Rules
```yaml
# Example alerting configuration
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    action: send_email
  
  - name: Slow Response Time
    condition: avg_response_time > 500ms
    action: send_slack_notification
  
  - name: Database Connection Issues
    condition: db_connection_errors > 10
    action: page_oncall
```

---

**Last Updated:** Juli 2025  
**Next Review:** September 2025

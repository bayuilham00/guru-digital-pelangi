# Technical Architecture
## Guru Digital Pelangi - System Architecture Document

### 1. SYSTEM OVERVIEW

**Architecture Pattern:** Three-tier Architecture (Presentation, Business Logic, Data)  
**Deployment Model:** Monolithic with microservice-ready structure  
**Database Strategy:** Single MySQL database with proper normalization  

### 2. TECHNOLOGY STACK

#### 2.1 Frontend Stack
```
Framework:     React 18 + TypeScript
UI Library:    HeroUI (NextUI-based components)
Styling:       Tailwind CSS
State Mgmt:    Zustand (lightweight state management)
Routing:       React Router DOM v6
HTTP Client:   Axios + Fetch API
Build Tool:    Vite (fast development & build)
Package Mgr:   Bun (fast package manager)
```

#### 2.2 Backend Stack
```
Runtime:       Node.js + Bun
Framework:     Express.js
Database:      MySQL 8.0+
ORM:           Prisma 5.x
Auth:          JWT (JSON Web Tokens)
Validation:    Joi / Zod
Logging:       Winston
Environment:   dotenv
```

#### 2.3 Database & Infrastructure
```
Database:      MySQL 8.0+ (Production VPS)
Connection:    Prisma Client with connection pooling
Migrations:    Prisma Migrate
Deployment:    VPS (Virtual Private Server)
Process Mgr:   PM2 (production process management)
```

### 3. SYSTEM ARCHITECTURE

#### 3.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Express)     │◄──►│    (MySQL)      │
│                 │    │                 │    │                 │
│ - Components    │    │ - REST APIs     │    │ - Tables        │
│ - State Mgmt    │    │ - Business      │    │ - Indexes       │
│ - Routing       │    │   Logic         │    │ - Constraints   │
│ - UI/UX         │    │ - Auth/Auth     │    │ - Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 3.2 Frontend Architecture
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── modules/         # Feature-specific components
│   │   ├── class/       # Class management
│   │   ├── student/     # Student management
│   │   ├── grade/       # Grading system
│   │   └── gamification/# Gamification features
│   └── layout/          # Layout components
├── services/            # API services & utilities
│   ├── apiClient.ts     # HTTP client configuration
│   ├── authService.ts   # Authentication services
│   └── types.ts         # TypeScript type definitions
├── stores/              # Zustand state stores
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── styles/              # Global styles & Tailwind config
```

#### 3.3 Backend Architecture
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── classController.js
│   │   ├── studentController.js
│   │   └── gamificationController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── validation.js# Request validation
│   │   └── errorHandler.js
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── prisma/              # Database schema & migrations
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration files
│   └── seed.js          # Database seeding
└── package.json         # Dependencies & scripts
```

### 4. DATA FLOW

#### 4.1 Authentication Flow
```
1. User Login Request
   Frontend → POST /api/auth/login → Backend

2. Credential Validation
   Backend → Validate → Database → Generate JWT

3. Token Response
   Backend → JWT Token → Frontend → Store in localStorage

4. Authenticated Requests
   Frontend → Authorization Header → Backend → Verify JWT
```

#### 4.2 CRUD Operations Flow
```
1. User Action (Create/Read/Update/Delete)
   Frontend Component → State Update → API Call

2. API Processing
   Backend Route → Middleware → Controller → Service → Database

3. Response Handling
   Database → Service → Controller → JSON Response → Frontend

4. UI Update
   Frontend → Update State → Re-render Components
```

#### 4.3 Gamification Flow
```
1. Student Activity (Assignment submission, Attendance)
   Frontend → API Call → Backend

2. XP Calculation
   Backend → Business Logic → Calculate XP → Update StudentXp

3. Achievement Check
   Backend → Check Achievements → Award Badges → Update Records

4. Leaderboard Update
   Backend → Recalculate Rankings → Cache Results

5. Real-time Updates
   Frontend → Periodic Refresh → Display Updated XP/Badges
```

### 5. SECURITY ARCHITECTURE

#### 5.1 Authentication & Authorization
```
- JWT Tokens: Stateless authentication
- Role-based Access Control (RBAC)
- Token Expiration: 7 days with refresh mechanism
- Password Hashing: bcrypt with salt rounds
```

#### 5.2 API Security
```
- Input Validation: Joi/Zod schemas
- SQL Injection Prevention: Prisma ORM
- XSS Protection: Input sanitization
- CORS Configuration: Restricted origins
- Rate Limiting: Express rate limiter
```

#### 5.3 Data Security
```
- Database Encryption: MySQL encryption at rest
- Connection Security: SSL/TLS connections
- Environment Variables: Sensitive data in .env
- Audit Logging: User action tracking
```

### 6. PERFORMANCE OPTIMIZATION

#### 6.1 Frontend Performance
```
- Code Splitting: React.lazy() for route-based splitting
- Component Optimization: React.memo() for expensive components
- State Management: Zustand for minimal re-renders
- Bundle Optimization: Vite tree-shaking & minification
- Image Optimization: WebP format & lazy loading
```

#### 6.2 Backend Performance
```
- Database Indexing: Strategic indexes on frequently queried fields
- Connection Pooling: Prisma connection pool management
- Query Optimization: Efficient Prisma queries with includes
- Caching Strategy: In-memory caching for static data
- Response Compression: gzip compression middleware
```

#### 6.3 Database Performance
```
- Primary Indexes: All primary keys (UUID)
- Secondary Indexes: Foreign keys, search fields
- Composite Indexes: Multi-column queries
- Query Optimization: EXPLAIN analysis
- Connection Limits: Proper pool sizing
```

### 7. SCALABILITY CONSIDERATIONS

#### 7.1 Horizontal Scaling
```
- Stateless Backend: JWT tokens enable load balancing
- Database Scaling: Read replicas for read-heavy operations
- CDN Integration: Static asset delivery
- Microservice Ready: Modular structure for future splitting
```

#### 7.2 Vertical Scaling
```
- Resource Monitoring: CPU, Memory, Disk usage
- Database Optimization: Query performance tuning
- Connection Pooling: Efficient resource utilization
- Caching Layers: Redis for session/data caching (future)
```

### 8. DEPLOYMENT ARCHITECTURE

#### 8.1 Production Environment
```
Server:        VPS (Virtual Private Server)
OS:            Ubuntu 20.04+ LTS
Web Server:    Nginx (reverse proxy)
Process Mgr:   PM2 (Node.js process management)
Database:      MySQL 8.0+ (dedicated instance)
SSL:           Let's Encrypt certificates
Monitoring:    PM2 monitoring + custom logging
```

#### 8.2 Deployment Pipeline
```
1. Development
   Local Development → Git Commit → GitHub Repository

2. Build Process
   GitHub → Manual Build → Production Assets

3. Deployment
   SCP/SFTP → VPS → PM2 Restart → Health Check

4. Database Migration
   Prisma Migrate → Schema Updates → Data Migration
```

### 9. MONITORING & LOGGING

#### 9.1 Application Monitoring
```
- Process Monitoring: PM2 dashboard
- Error Tracking: Winston logging
- Performance Metrics: Response times, memory usage
- Health Checks: API endpoint monitoring
```

#### 9.2 Database Monitoring
```
- Connection Pool: Active/idle connections
- Query Performance: Slow query logging
- Storage Usage: Disk space monitoring
- Backup Status: Automated backup verification
```

### 10. BACKUP & DISASTER RECOVERY

#### 10.1 Backup Strategy
```
- Database Backups: Daily automated MySQL dumps
- File Backups: Application code & uploads
- Retention Policy: 30 days rolling backups
- Storage Location: Multiple locations (local + cloud)
```

#### 10.2 Recovery Procedures
```
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Backup Testing: Monthly restore tests
- Documentation: Step-by-step recovery procedures
```

### 11. FUTURE ENHANCEMENTS

#### 11.1 Technical Improvements
```
- Real-time Features: WebSocket integration
- Caching Layer: Redis implementation
- API Gateway: Centralized API management
- Containerization: Docker deployment
- CI/CD Pipeline: Automated deployment
```

#### 11.2 Scalability Enhancements
```
- Microservices: Service decomposition
- Message Queue: Async processing (RabbitMQ/Redis)
- Load Balancing: Multiple server instances
- CDN Integration: Global content delivery
- Database Sharding: Horizontal database scaling
```

---

**Architecture Version:** 1.0  
**Last Updated:** Juni 2025  
**Next Review:** Juli 2025

# 🎓 Guru Digital Pelangi - Backend API

Modern Express.js backend dengan Prisma ORM dan MySQL untuk sistem manajemen sekolah.

## 🚀 **Tech Stack**

- **Runtime**: Bun (super fast JavaScript runtime)
- **Framework**: Express.js 4.21.2
- **Database**: MySQL 8.0+
- **ORM**: Prisma 6.1.0
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## 📋 **Prerequisites**

- Bun >= 1.0.0
- MySQL >= 8.0
- Node.js >= 18.0 (fallback jika tidak ada Bun)

## ⚡ **Quick Start**

### 1. Install Dependencies
```bash
cd backend
bun install
```

### 2. Setup Database
```bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE guru_digital_pelangi;
exit;
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit .env file dengan database credentials Anda
DATABASE_URL="mysql://blinkihc:39255471f76e90383731@alpha_guruku:3306/guru_digital_pelangi"
```

### 4. Database Migration & Seeding
```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Seed database dengan sample data
bun run db:seed
```

### 5. Start Development Server
```bash
bun run dev
```

Server akan berjalan di: http://localhost:5000

## 🔐 **Sample Login Credentials**

### Admin
- **Email**: admin@smadigitalpelangi.sch.id
- **Password**: admin123

### Guru
- **Email**: guru1@smadigitalpelangi.sch.id
- **Password**: guru123

### Siswa (Login dengan NISN)
- **NISN**: 1234567890
- **Password**: 1234567890

## 📚 **API Endpoints**

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Schools
- `GET /api/schools` - Get all schools
- `POST /api/schools` - Create school (admin only)
- `PUT /api/schools/:id` - Update school (admin only)
- `DELETE /api/schools/:id` - Delete school (admin only)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/:id/students` - Get class students

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/grades` - Get student grades
- `GET /api/students/:id/attendance` - Get student attendance

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance
- `POST /api/attendance/bulk` - Bulk create attendance
- `PUT /api/attendance/:id` - Update attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Grades
- `GET /api/grades` - Get all grades
- `POST /api/grades` - Create grade
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

## 🛠️ **Development Commands**

```bash
# Development
bun run dev          # Start development server with hot reload

# Database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run db:deploy    # Deploy migrations (production)
bun run db:studio    # Open Prisma Studio
bun run db:seed      # Seed database with sample data
bun run db:reset     # Reset database (careful!)

# Production
bun run start        # Start production server
```

## 🔒 **Security Features**

- JWT Authentication
- Password hashing dengan bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation dengan Zod
- SQL injection protection (Prisma)

## 📁 **Project Structure**

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── index.js         # Main server file
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.js          # Sample data
├── .env                 # Environment variables
└── package.json
```

## 🐛 **Troubleshooting**

### Database Connection Error
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Prisma Issues
```bash
# Reset Prisma client
bun run db:generate

# Reset database
bun run db:reset
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

## 📝 **Environment Variables**

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/guru_digital_pelangi"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🚀 **Deployment**

### VPS Deployment
1. Clone repository
2. Install dependencies: `bun install`
3. Setup environment variables
4. Run migrations: `bun run db:deploy`
5. Start with PM2: `pm2 start ecosystem.config.js`

### Docker Deployment
```bash
# Build image
docker build -t guru-digital-pelangi-backend .

# Run container
docker run -p 5000:5000 guru-digital-pelangi-backend
```

## 📞 **Support**

Jika ada masalah atau pertanyaan:
1. Check logs: `tail -f logs/app.log`
2. Check database connection
3. Verify environment variables
4. Contact development team

---

**Happy Coding! 🎉**

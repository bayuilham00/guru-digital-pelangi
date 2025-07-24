# 🚀 Development Setup Guide - Guru Digital Pelangi

Panduan setup development environment untuk Guru Digital Pelangi.

## 📋 Prerequisites

- **Bun** >= 1.0.0 (recommended) atau Node.js >= 18.0
- **MySQL** >= 8.0
- **Git**

## 🏗️ Project Structure

```
guru-digital-pelangi/
├── src/               # Frontend React application
├── backend/           # Backend API server
├── docs/              # Documentation
└── public/            # Static assets
```

---

## 🔧 Quick Setup

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd guru-digital-pelangi

# Install frontend dependencies
bun install

# Install backend dependencies
cd backend
bun install
cd ..
```

### 2. Database Setup

#### Manual MySQL Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE guru_digital_pelangi;
exit

# Set environment variables
cd backend
cp .env.example .env
# Edit .env file with your database credentials

# Run migrations
bun run db:migrate

# Seed initial data
bun run db:seed
```

### 3. Environment Configuration

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Guru Digital Pelangi"
```

#### Backend (.env)
```bash
DATABASE_URL="mysql://username:password@localhost:3306/guru_digital_pelangi"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend API
cd backend
bun run dev

# Terminal 2 - Frontend
bun run dev
```

### 5. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api-docs

---

## 🔐 Default Login Credentials

After seeding the database, you can use these credentials:

### Admin
- **Email:** admin@guru.digital
- **Password:** admin123

### Teacher
- **Email:** guru@guru.digital  
- **Password:** guru123

### Student
- **Email:** siswa@guru.digital
- **Password:** siswa123

---

## 🛠️ Available Scripts

### Frontend
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Run ESLint
```

### Backend
```bash
bun run dev          # Start development server with hot reload
bun run start        # Start production server
bun run db:migrate   # Run database migrations
bun run db:seed      # Seed database with sample data
bun run db:reset     # Reset database and reseed
```

---

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
bun run test

# Backend tests
cd backend
bun run test
```

### Test Data
The seeded database includes:
- 3 user roles with sample accounts
- Sample classes and subjects
- Student progress data
- Sample assignments and grades

---

## 🔧 Development Tools

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Prisma**
- **Thunder Client** (for API testing)

### Database GUI Tools
- **Prisma Studio:** `cd backend && npx prisma studio`
- **MySQL Workbench:** For MySQL management
- **DBeaver:** Universal database tool

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5173
npx kill-port 5173
```

### Database Connection Issues
```bash
# Check MySQL status (Linux/Mac)
sudo systemctl status mysql

# Check MySQL status (Windows)
sc query mysql80

# Restart MySQL (Linux/Mac)
sudo systemctl restart mysql

# Start MySQL (Windows)
net start mysql80
```

### Prisma Issues
```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# Reset database if needed
npx prisma migrate reset
```

### Node Modules Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules bun.lockb
bun install

# Backend
cd backend
rm -rf node_modules bun.lock
bun install
```

---

## 📚 Next Steps

1. **Read Documentation:**
   - [API Documentation](docs/API_DOCUMENTATION.md)
   - [Development Roadmap](DEVELOPMENT_ROADMAP.md)
   - [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

2. **Start Development:**
   - Check current features in Student Dashboard
   - Review the codebase structure
   - Plan your contributions based on the roadmap

3. **Join Development:**
   - Follow the Contributing guidelines
   - Create feature branches for new work
   - Submit PRs for review

---

**Need Help?** Check the [API Documentation](docs/API_DOCUMENTATION.md) or open an issue on GitHub.

**Last Updated:** Juli 2025


# Start frontend development server
bun run dev
```

**Frontend akan berjalan di**: http://localhost:5173

---

## 🔐 **STEP 5: TEST LOGIN**

### **Sample Credentials:**

#### **👨‍💼 Admin**
- **Email**: admin@smadigitalpelangi.sch.id
- **Password**: admin123

#### **👨‍🏫 Guru**
- **Email**: guru1@smadigitalpelangi.sch.id
- **Password**: guru123

#### **👨‍🎓 Siswa**
- **NISN**: 1234567890
- **Password**: 1234567890

---

## 🧪 **STEP 6: TESTING FEATURES**

### **Test CRUD Operations:**
1. **Login** dengan credentials admin/guru
2. **Navigate** ke menu Kelas
3. **Create** kelas baru
4. **Navigate** ke menu Siswa
5. **Create** siswa baru
6. **Navigate** ke menu Presensi
7. **Create** presensi untuk siswa

### **Test API Endpoints:**
```bash
# Get classes (need auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/classes

# Get students
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/students

# Get attendance
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/attendance
```

---

## 🔄 **DEVELOPMENT WORKFLOW**

### **Backend Development:**
```bash
cd backend

# Development with hot reload
bun run dev

# Database operations
bun run db:studio      # Open Prisma Studio
bun run db:migrate     # Run new migrations
bun run db:reset       # Reset database (careful!)

# Production
bun run start
```

### **Frontend Development:**
```bash
# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Backend (VPS):**
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start ecosystem.config.js

# Setup nginx reverse proxy
# Point to localhost:5000
```

### **Frontend (Vercel/Netlify):**
```bash
# Build frontend
bun run build

# Deploy dist/ folder to hosting
```

---

## 🐛 **TROUBLESHOOTING**

### **Database Connection Error:**
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Verify credentials in .env
```

### **Backend Port Error:**
```bash
# Change port in backend/.env
PORT=5001

# Update frontend .env
VITE_API_URL=http://localhost:5001/api
```

### **Frontend API Error:**
```bash
# Check backend is running
curl http://localhost:5000/health

# Check CORS settings in backend
# Verify FRONTEND_URL in backend/.env
```

### **Prisma Issues:**
```bash
cd backend

# Regenerate client
bun run db:generate

# Reset database
bun run db:reset
```

---

## 📚 **AVAILABLE SCRIPTS**

### **Frontend:**
- `bun run dev` - Development server
- `bun run build` - Production build
- `bun run preview` - Preview build
- `bun run lint` - Lint code

### **Backend:**
- `bun run dev` - Development server
- `bun run start` - Production server
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run migrations
- `bun run db:seed` - Seed database
- `bun run db:studio` - Open Prisma Studio

---

## 🎯 **NEXT STEPS**

1. **✅ Setup Complete** - Backend + Frontend running
2. **🧪 Test Features** - CRUD operations working
3. **🎮 Gamifikasi** - Implement XP system (HARI 3)
4. **📚 RPP Module** - Learning plans feature
5. **❓ Bank Soal** - Question bank system
6. **🚀 Production** - Deploy to VPS

---

## 📞 **SUPPORT**

Jika ada masalah:
1. **Check logs**: Backend console & browser console
2. **Verify environment**: Database connection & API URL
3. **Test endpoints**: Use curl atau Postman
4. **Reset database**: `bun run db:reset` (last resort)

**Happy Coding! 🎉**

# 🔌 API Documentation - Guru Digital Pelangi

## 🚀 Getting Started

Base URL: `http://localhost:3000/api`

### Authentication
Semua protected endpoints memerlukan JWT token dalam header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
Login untuk semua role (Admin, Guru, Siswa)

**Request Body:**
```json
{
  "identifier": "admin@pelangi.sch.id",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "STUDENT|TEACHER|ADMIN",
    "fullName": "User Full Name"
  }
}
```

### POST `/auth/logout`
Logout user (invalidate token)

---

## 👨‍🎓 Student Endpoints

### GET `/students/dashboard`
Mendapatkan data dashboard siswa (protected)

**Response:**
```json
{
  "profile": {
    "id": "student_id",
    "fullName": "Student Name",
    "studentId": "12345",
    "profilePhoto": "/uploads/photo.jpg",
    "class": {
      "name": "Kelas 10A",
      "academicYear": "2024/2025"
    }
  },
  "xp": {
    "totalXp": 150,
    "currentLevel": 2,
    "levelName": "Pemula",
    "nextLevelXp": 200,
    "progressToNextLevel": 75
  },
  "stats": {
    "averageGrade": 85.5,
    "attendancePercentage": 95,
    "completedAssignments": 8,
    "totalAssignments": 10,
    "classRank": 5,
    "totalClassmates": 30
  },
  "badges": [...],
  "achievements": [...],
  "recentGrades": [...]
}
```

### POST `/students/profile-photo`
Upload foto profil siswa (protected)

**Request:** Multipart form data
- `photo`: File (image)

**Response:**
```json
{
  "success": true,
  "photoUrl": "/uploads/students/photo.jpg"
}
```

### GET `/students/leaderboard`
Mendapatkan leaderboard siswa

---

## 👩‍🏫 Teacher Endpoints

### GET `/teachers/dashboard`
Dashboard data untuk guru (protected)

### GET `/teachers/classes`
Daftar kelas yang diajar guru

### GET `/teachers/students/:classId`
Daftar siswa dalam kelas tertentu

---

## 👨‍💼 Admin Endpoints

### GET `/admin/dashboard`
Dashboard data untuk admin (protected)

### Student Management
- `GET /admin/students` - Daftar semua siswa
- `POST /admin/students` - Tambah siswa baru
- `PUT /admin/students/:id` - Update data siswa
- `DELETE /admin/students/:id` - Hapus siswa

### Teacher Management
- `GET /admin/teachers` - Daftar semua guru
- `POST /admin/teachers` - Tambah guru baru
- `PUT /admin/teachers/:id` - Update data guru
- `DELETE /admin/teachers/:id` - Hapus guru

### Class Management
- `GET /admin/classes` - Daftar semua kelas
- `POST /admin/classes` - Tambah kelas baru
- `PUT /admin/classes/:id` - Update data kelas
- `DELETE /admin/classes/:id` - Hapus kelas

---

## 📝 Assignment Endpoints

### GET `/assignments`
Daftar tugas (filter berdasarkan role)

### POST `/assignments`
Buat tugas baru (Teacher/Admin only)

**Request Body:**
```json
{
  "title": "Assignment Title",
  "description": "Assignment description",
  "type": "HOMEWORK|QUIZ|EXAM|PRACTICE",
  "classId": "class_id",
  "subjectId": "subject_id",
  "dueDate": "2025-07-15T23:59:59Z",
  "maxScore": 100,
  "xpReward": 25
}
```

### GET `/assignments/:id/submissions`
Daftar submission untuk tugas tertentu

### POST `/assignments/:id/submit`
Submit tugas (Student only)

---

## 🎮 Gamification Endpoints

### GET `/gamification/xp-history/:studentId`
Riwayat perolehan XP siswa

### GET `/gamification/badges/:studentId`
Daftar badge yang dimiliki siswa

### GET `/gamification/achievements/:studentId`
Daftar achievement siswa

### GET `/gamification/leaderboard`
Global leaderboard

---

## 📊 Analytics Endpoints

### GET `/analytics/student-performance/:studentId`
Analisis performa siswa

### GET `/analytics/class-overview/:classId`
Overview performa kelas

### GET `/analytics/school-stats`
Statistik sekolah (Admin only)

---

## 🔧 Utility Endpoints

### GET `/subjects`
Daftar mata pelajaran

### GET `/levels`
Daftar level dan requirement XP

### GET `/badges`
Daftar semua badge yang tersedia

---

## 📋 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Validation error details"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 📝 Development Notes

### Request/Response Format
- Semua request dan response menggunakan JSON format
- Tanggal menggunakan ISO 8601 format
- File upload menggunakan multipart/form-data

### Pagination
Untuk endpoint yang mengembalikan list data:
```
GET /endpoint?page=1&limit=20&sort=createdAt&order=desc
```

**Response with pagination:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Rate Limiting
- 100 requests per minute untuk authenticated users
- 20 requests per minute untuk unauthenticated users

---

**Last Updated:** Juli 2025  
**Version:** 1.0

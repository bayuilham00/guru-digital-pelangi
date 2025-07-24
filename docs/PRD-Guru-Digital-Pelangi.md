# Product Requirements Document (PRD)
## Guru Digital Pelangi - Sistem Manajemen Sekolah

### 1. OVERVIEW

**Product Name:** Guru Digital Pelangi  
**Version:** 1.0  
**Date:** Juni 2025  
**Team:** Development Team  

**Product Vision:**  
Sistem manajemen sekolah digital yang komprehensif dengan fitur gamifikasi untuk meningkatkan engagement siswa dan efisiensi administrasi sekolah.

**Target Users:**
- **Admin Sekolah:** Mengelola seluruh sistem, data master, dan konfigurasi
- **Guru:** Mengelola kelas, siswa, tugas, dan penilaian
- **Siswa:** Mengakses tugas, melihat nilai, dan berpartisipasi dalam sistem gamifikasi

### 2. FUNCTIONAL REQUIREMENTS

#### 2.1 Authentication & Authorization
- **Login System:** Email/password authentication dengan JWT token
- **Role-based Access Control:** Admin, Guru, Siswa dengan permission berbeda
- **Profile Management:** Edit profil, ganti password, foto profil

#### 2.2 Dashboard
- **Admin Dashboard:** Overview statistik sekolah, siswa, guru, kelas
- **Guru Dashboard:** Kelas yang diajar, tugas pending, statistik siswa
- **Siswa Dashboard:** Tugas, nilai, XP, badge, leaderboard

#### 2.3 Manajemen Kelas
- **CRUD Kelas:** Create, Read, Update, Delete kelas
- **Assignment Guru:** Assign multiple guru ke kelas
- **Subject Integration:** Setiap kelas terkait dengan mata pelajaran
- **Student Management:** Assign siswa ke kelas

#### 2.4 Manajemen Siswa
- **CRUD Siswa:** Manajemen data siswa lengkap
- **Bulk Import:** Import siswa dari file Excel/CSV
- **Class Assignment:** Assign siswa ke kelas tertentu
- **Academic Records:** Tracking nilai dan progress akademik

#### 2.5 Manajemen Guru
- **CRUD Guru:** Manajemen data guru
- **Subject Specialization:** Guru bisa mengajar multiple mata pelajaran
- **Class Assignment:** Assign guru ke multiple kelas

#### 2.6 Sistem Tugas (Assignment)
- **Create Assignment:** Guru bisa membuat tugas untuk kelas
- **Assignment Types:** Tugas Harian, Quiz, Ulangan Harian, PTS, PAS, Praktik
- **Due Date Management:** Set deadline dan reminder
- **Submission Tracking:** Track status pengumpulan siswa

#### 2.7 Sistem Penilaian (Grading)
- **Grade Entry:** Input nilai dengan skala 0-100
- **Multiple Assessment Types:** Support berbagai jenis penilaian
- **Grade Analytics:** Statistik dan analisis nilai
- **Report Generation:** Generate laporan nilai

#### 2.8 Sistem Gamifikasi
- **XP System:** Point system untuk aktivitas siswa
- **Badge System:** Achievement badges untuk pencapaian tertentu
- **Level System:** 10 level dengan benefit berbeda
- **Challenge System:** Tantangan untuk siswa
- **Leaderboard:** Ranking siswa berdasarkan XP
- **Reward System:** Admin/guru bisa memberikan reward

#### 2.9 Settings & Configuration
- **School Settings:** Konfigurasi data sekolah
- **Academic Year:** Manajemen tahun ajaran
- **Subject Management:** CRUD mata pelajaran
- **System Configuration:** Various system settings

### 3. TECHNICAL REQUIREMENTS

#### 3.1 Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** HeroUI (NextUI-based)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Build Tool:** Vite

#### 3.2 Backend
- **Runtime:** Node.js + Bun
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT
- **API Style:** RESTful API

#### 3.3 Database Schema
- **Users:** Admin, Guru, Siswa dengan role-based access
- **Schools:** Multi-tenant support
- **Classes:** Kelas dengan subject dan teacher assignment
- **Subjects:** Mata pelajaran master data
- **Assignments:** Tugas dengan multiple types
- **Grades:** Sistem penilaian
- **Gamification:** XP, Badges, Levels, Challenges

### 4. USER STORIES

#### 4.1 Admin Stories
- Sebagai admin, saya ingin mengelola data sekolah, guru, dan siswa
- Sebagai admin, saya ingin melihat dashboard overview seluruh sistem
- Sebagai admin, saya ingin mengkonfigurasi sistem gamifikasi
- Sebagai admin, saya ingin generate laporan komprehensif

#### 4.2 Guru Stories
- Sebagai guru, saya ingin mengelola kelas yang saya ajar
- Sebagai guru, saya ingin membuat dan mengelola tugas
- Sebagai guru, saya ingin input dan track nilai siswa
- Sebagai guru, saya ingin memberikan reward kepada siswa

#### 4.3 Siswa Stories
- Sebagai siswa, saya ingin melihat tugas dan deadline
- Sebagai siswa, saya ingin track nilai dan progress saya
- Sebagai siswa, saya ingin melihat XP, badge, dan ranking saya
- Sebagai siswa, saya ingin berpartisipasi dalam challenge

### 5. NON-FUNCTIONAL REQUIREMENTS

#### 5.1 Performance
- **Response Time:** < 2 detik untuk operasi normal
- **Concurrent Users:** Support 100+ concurrent users
- **Database Performance:** Optimized queries dengan indexing

#### 5.2 Security
- **Authentication:** JWT dengan expiration
- **Authorization:** Role-based access control
- **Data Validation:** Input validation di frontend dan backend
- **SQL Injection Prevention:** Prisma ORM protection

#### 5.3 Usability
- **Responsive Design:** Mobile-first approach
- **Intuitive UI:** Clean dan user-friendly interface
- **Accessibility:** WCAG 2.1 compliance
- **Multi-language:** Support Bahasa Indonesia

#### 5.4 Scalability
- **Database:** MySQL dengan proper indexing
- **API:** RESTful dengan pagination
- **Frontend:** Component-based architecture
- **Deployment:** VPS-ready dengan Docker support

### 6. FUTURE ENHANCEMENTS

#### 6.1 Phase 2 Features
- **Mobile App:** React Native mobile application
- **Real-time Notifications:** WebSocket-based notifications
- **Advanced Analytics:** AI-powered insights
- **Parent Portal:** Parent access untuk monitoring anak

#### 6.2 Phase 3 Features
- **Video Conferencing:** Integrated online learning
- **Content Management:** Digital learning materials
- **Exam System:** Online examination platform
- **Integration APIs:** Third-party integrations

### 7. SUCCESS METRICS

#### 7.1 User Adoption
- **Active Users:** 80% monthly active users
- **Feature Usage:** 70% feature adoption rate
- **User Satisfaction:** 4.5/5 rating

#### 7.2 Performance Metrics
- **System Uptime:** 99.5% availability
- **Response Time:** < 2 seconds average
- **Error Rate:** < 1% error rate

#### 7.3 Business Impact
- **Administrative Efficiency:** 50% reduction in manual work
- **Student Engagement:** 40% increase in participation
- **Academic Performance:** 20% improvement in grades

### 8. RISKS & MITIGATION

#### 8.1 Technical Risks
- **Database Performance:** Regular optimization dan monitoring
- **Security Vulnerabilities:** Regular security audits
- **Scalability Issues:** Load testing dan performance monitoring

#### 8.2 User Adoption Risks
- **Training Requirements:** Comprehensive user training program
- **Change Resistance:** Gradual rollout dengan support
- **Technical Literacy:** User-friendly design dan documentation

### 9. TIMELINE & MILESTONES

#### 9.1 Development Phases
- **Phase 1 (Completed):** Core functionality - Authentication, CRUD operations
- **Phase 2 (Current):** Gamification system, Advanced features
- **Phase 3 (Future):** Mobile app, Advanced analytics

#### 9.2 Key Milestones
- ✅ **MVP Release:** Basic CRUD functionality
- ✅ **Gamification System:** XP, Badges, Levels
- 🔄 **Production Deployment:** VPS deployment
- 📅 **User Training:** Training program rollout
- 📅 **Go-Live:** Full system launch

### 10. API SPECIFICATION

#### 10.1 Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

#### 10.2 User Management
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

#### 10.3 School Management
```
GET    /api/schools
POST   /api/schools
GET    /api/schools/:id
PUT    /api/schools/:id
```

#### 10.4 Class Management
```
GET    /api/classes
POST   /api/classes
GET    /api/classes/:id
PUT    /api/classes/:id
DELETE /api/classes/:id
```

#### 10.5 Student Management
```
GET    /api/students
POST   /api/students
POST   /api/students/bulk
GET    /api/students/:id
PUT    /api/students/:id
DELETE /api/students/:id
```

#### 10.6 Assignment & Grading
```
GET    /api/assignments
POST   /api/assignments
GET    /api/assignments/:id
PUT    /api/assignments/:id
DELETE /api/assignments/:id

GET    /api/grades
POST   /api/grades
GET    /api/grades/:id
PUT    /api/grades/:id
```

#### 10.7 Gamification System
```
GET    /api/gamification/leaderboard/:classId
GET    /api/gamification/student/:studentId
GET    /api/gamification/badges
POST   /api/gamification/badges
GET    /api/gamification/challenges
POST   /api/gamification/challenges
POST   /api/gamification/rewards
```

---

**Document Version:** 1.0
**Last Updated:** Juni 2025
**Next Review:** Juli 2025

# 🎓 Guru Digital Pelangi

Sistem Manajemen Sekolah Digital dengan Fitur Gamifikasi untuk meningkatkan engagement siswa dan efisiensi administrasi sekolah.

## 📖 Deskripsi Project

**Guru Digital Pelangi** adalah platform manajemen sekolah berbasis web yang menggabungkan sistem administrasi lengkap dengan elemen gamifikasi. Platform ini dirancang untuk tiga jenis pengguna utama:

- **👨‍💼 Admin Sekolah** - Mengelola seluruh sistem, data master, dan konfigurasi
- **👩‍🏫 Guru** - Mengelola kelas, siswa, tugas, dan penilaian  
- **👨‍🎓 Siswa** - Mengakses tugas, melihat nilai, dan berpartisipasi dalam sistem gamifikasi

### ✨ Fitur Utama

#### 🔐 Authentication & Authorization
- Login system dengan JWT token
- Role-based access control (Admin, Guru, Siswa)
- Profile management dengan foto profil

#### 📊 Dashboard
- **Admin Dashboard:** Overview statistik sekolah lengkap
- **Guru Dashboard:** Manajemen kelas dan monitoring siswa
- **Siswa Dashboard:** Progress akademik, XP, badge, dan leaderboard

#### 🏫 Manajemen Sekolah
- **Manajemen Kelas:** CRUD kelas dengan assignment guru dan siswa
- **Manajemen Siswa:** Data siswa lengkap dengan bulk import
- **Manajemen Guru:** Assignment mata pelajaran dan kelas

#### 📝 Sistem Tugas & Penilaian
- Berbagai jenis tugas (Harian, Quiz, Ulangan, PTS, PAS)
- Sistem penilaian terintegrasi
- Rubrik penilaian yang fleksibel

#### 🎮 Sistem Gamifikasi
- **XP (Experience Points):** Reward untuk pencapaian akademik
- **Level System:** Progres siswa dalam bentuk level
- **Badge & Achievement:** Pencapaian khusus untuk motivasi
- **Leaderboard:** Kompetisi sehat antar siswa

#### 🤖 Modul Pembelajaran AI-Powered (In Development)
- **📚 Bank Soal:** Question bank dengan AI generation
- **📋 Teacher Planner:** Perencanaan pembelajaran dengan AI assistance
- **📖 RPP Builder:** Rencana Pelaksanaan Pembelajaran otomatis
- **📓 Jurnal Pembelajaran:** Daily learning journal dengan AI insights

## 🛠️ Teknologi Yang Digunakan

### Frontend
- **React 18** - Library JavaScript untuk UI
- **TypeScript** - Type safety dan better development experience
- **Vite** - Fast build tool dan development server
- **Tailwind CSS** - Utility-first CSS framework
- **HeroUI** - Modern React UI component library
- **Framer Motion** - Animation library
- **Zustand** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma ORM** - Database toolkit dan ORM
- **MySQL** - Primary database
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### Development Tools
- **Bun** - Fast package manager dan runtime
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization untuk database

## 🚀 Quick Start

### Prerequisites
- **Bun** >= 1.0.0 atau Node.js >= 18.0
- **MySQL** >= 8.0
- **Git**

### Installation

```bash
# Clone repository
git clone <repository-url>
cd guru-digital-pelangi

# Install dependencies
bun install

# Setup database (lihat SETUP_GUIDE.md untuk detail)
cd backend
bun install
bun run db:migrate
bun run db:seed

# Start development servers
# Terminal 1 - Backend
cd backend
bun run dev

# Terminal 2 - Frontend  
bun run dev
```

## 📁 Struktur Project

```
guru-digital-pelangi/
├── 📂 src/                    # Frontend source code
│   ├── 📂 components/         # Reusable React components
│   ├── 📂 pages/             # Page components
│   ├── 📂 hooks/             # Custom React hooks
│   ├── 📂 stores/            # Zustand state stores
│   ├── 📂 services/          # API service layers
│   ├── 📂 utils/             # Utility functions
│   └── 📂 types/             # TypeScript type definitions
├── 📂 backend/               # Backend API server
│   ├── 📂 src/               # Backend source code
│   ├── 📂 prisma/            # Database schema & migrations
│   └── 📂 routes/            # API route definitions
├── 📂 docs/                  # Project documentation
└── 📂 public/                # Static assets
```

## 📚 Dokumentasi

- **[Setup Guide](SETUP_GUIDE.md)** - Panduan lengkap setup development
- **[Product Requirements](docs/PRD-Guru-Digital-Pelangi.md)** - Spesifikasi fitur lengkap
- **[Technical Architecture](docs/Technical-Architecture.md)** - Arsitektur sistem
- **[Database Schema](docs/ERD-Guru-Digital-Pelangi.md)** - Entity Relationship Diagram

## 🚧 Development Status

### ✅ Completed Features (v1.0)
- Authentication system (Login/Logout) dengan JWT
- Student Dashboard dengan gamifikasi (XP, Level, Badge)
- Profile photo management dengan upload
- Basic CRUD operations untuk siswa, guru, kelas
- Responsive design dengan mobile-first approach
- Modern UI dengan HeroUI components dan Tailwind CSS

### 🔄 In Progress (v1.1)
- **Bank Soal** dengan AI question generation
- **Teacher Planner** dengan AI-assisted planning
- **RPP Builder** dengan auto-generation features
- **Jurnal Pembelajaran** dengan AI insights
- Advanced grading system dengan rubrik

### 📋 Upcoming Features (v2.0+)
- Parent portal dan communication system
- Advanced AI features across all modules
- Mobile app development (PWA)
- Multi-school support dan enterprise features


## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Development Team - Guru Digital Pelangi

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buka issue di repository ini.

---

⭐ **Star this repository if you find it helpful!**

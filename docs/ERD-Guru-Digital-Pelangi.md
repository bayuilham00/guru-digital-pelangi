# Entity Relationship Diagram (ERD)
## Guru Digital Pelangi - Database Schema

### Database Overview

Database ini dirancang untuk mendukung sistem manajemen sekolah dengan fitur gamifikasi. Menggunakan MySQL sebagai database utama dengan Prisma sebagai ORM.

### Core Entities

#### 1. **Users** - Tabel utama untuk semua pengguna sistem
- **id**: Primary key (UUID)
- **email**: Email unik untuk login
- **password**: Hashed password
- **role**: ADMIN | GURU | SISWA
- **fullName**: Nama lengkap
- **nip**: Nomor Induk Pegawai (untuk guru/admin)
- **contact**: Nomor kontak
- **schoolId**: Foreign key ke Schools
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

#### 2. **Schools** - Data sekolah (multi-tenant support)
- **id**: Primary key (UUID)
- **name**: Nama sekolah
- **address**: Alamat sekolah
- **phone**: Telepon sekolah
- **email**: Email sekolah
- **principal**: Nama kepala sekolah
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

#### 3. **Subjects** - Master data mata pelajaran
- **id**: Primary key (UUID)
- **name**: Nama mata pelajaran (IPA, Matematika, dll)
- **code**: Kode mata pelajaran (IPA, MTK, dll)
- **description**: Deskripsi mata pelajaran
- **schoolId**: Foreign key ke Schools
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

#### 4. **Classes** - Data kelas
- **id**: Primary key (UUID)
- **name**: Nama kelas (7A, 8B, dll)
- **gradeLevel**: Tingkat kelas (7, 8, 9)
- **academicYear**: Tahun ajaran (2024/2025)
- **subjectId**: Foreign key ke Subjects
- **schoolId**: Foreign key ke Schools
- **description**: Deskripsi kelas
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

#### 5. **ClassTeachers** - Relasi many-to-many antara Class dan Teachers
- **id**: Primary key (UUID)
- **classId**: Foreign key ke Classes
- **teacherId**: Foreign key ke Users (role: GURU)
- **isPrimary**: Apakah guru utama
- **createdAt, updatedAt**: Timestamp

#### 6. **Students** - Data siswa (extends Users)
- **id**: Primary key (UUID) - sama dengan Users.id
- **studentId**: NIS (Nomor Induk Siswa)
- **classId**: Foreign key ke Classes
- **parentName**: Nama orang tua
- **parentContact**: Kontak orang tua
- **address**: Alamat siswa
- **birthDate**: Tanggal lahir
- **gender**: Jenis kelamin
- **enrollmentDate**: Tanggal masuk
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

### Assignment & Grading System

#### 7. **Assignments** - Data tugas
- **id**: Primary key (UUID)
- **title**: Judul tugas
- **description**: Deskripsi tugas
- **type**: TUGAS_HARIAN | QUIZ | ULANGAN_HARIAN | PTS | PAS | PRAKTIK | SIKAP | KETERAMPILAN
- **classId**: Foreign key ke Classes
- **subjectId**: Foreign key ke Subjects
- **teacherId**: Foreign key ke Users (pembuat tugas)
- **dueDate**: Deadline tugas
- **maxScore**: Nilai maksimal (default: 100)
- **instructions**: Instruksi pengerjaan
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

#### 8. **Grades** - Data nilai
- **id**: Primary key (UUID)
- **studentId**: Foreign key ke Students
- **assignmentId**: Foreign key ke Assignments
- **classId**: Foreign key ke Classes
- **subjectId**: Foreign key ke Subjects
- **score**: Nilai (0-100)
- **gradeType**: Jenis penilaian (sama dengan Assignment.type)
- **gradedBy**: Foreign key ke Users (guru yang menilai)
- **gradedAt**: Tanggal penilaian
- **notes**: Catatan tambahan
- **createdAt, updatedAt**: Timestamp

### Gamification System

#### 9. **StudentXp** - Data XP siswa
- **id**: Primary key (UUID)
- **studentId**: Foreign key ke Students
- **totalXp**: Total XP yang dimiliki
- **level**: Level saat ini (1-10)
- **levelName**: Nama level (Pemula, Berkembang, dll)
- **attendanceStreak**: Streak kehadiran
- **assignmentStreak**: Streak pengumpulan tugas
- **lastAttendance**: Tanggal kehadiran terakhir
- **lastAssignment**: Tanggal tugas terakhir
- **updatedAt**: Timestamp update terakhir

#### 10. **Badges** - Master data badge
- **id**: Primary key (UUID)
- **name**: Nama badge
- **description**: Deskripsi badge
- **icon**: Icon badge (emoji/unicode)
- **xpReward**: XP yang didapat
- **schoolId**: Foreign key ke Schools
- **isActive**: Status aktif
- **createdAt, updatedAt**: Timestamp

#### 11. **StudentBadges** - Badge yang dimiliki siswa
- **id**: Primary key (UUID)
- **studentId**: Foreign key ke Students
- **badgeId**: Foreign key ke Badges
- **earnedAt**: Tanggal mendapat badge
- **awardedBy**: Foreign key ke Users (yang memberikan)
- **reason**: Alasan pemberian badge

#### 12. **Challenges** - Data tantangan
- **id**: Primary key (UUID)
- **title**: Judul challenge
- **description**: Deskripsi challenge
- **duration**: Durasi dalam hari
- **targetType**: ALL_STUDENTS | SPECIFIC_CLASS | SPECIFIC_GRADE
- **targetValue**: Nilai target (classId atau gradeLevel)
- **xpReward**: XP reward
- **startDate**: Tanggal mulai
- **endDate**: Tanggal selesai
- **isActive**: Status aktif
- **createdBy**: Foreign key ke Users
- **schoolId**: Foreign key ke Schools
- **createdAt, updatedAt**: Timestamp

#### 13. **StudentChallenges** - Partisipasi siswa dalam challenge
- **id**: Primary key (UUID)
- **studentId**: Foreign key ke Students
- **challengeId**: Foreign key ke Challenges
- **progress**: Progress completion (0-100)
- **isCompleted**: Status selesai
- **completedAt**: Tanggal selesai
- **xpEarned**: XP yang didapat

#### 14. **Achievements** - Pencapaian otomatis sistem
- **id**: Primary key (UUID)
- **studentId**: Foreign key ke Students
- **type**: PERFECT_SCORE | ATTENDANCE_STREAK | ASSIGNMENT_STREAK | dll
- **title**: Judul pencapaian
- **description**: Deskripsi pencapaian
- **xpReward**: XP reward
- **earnedAt**: Tanggal pencapaian
- **metadata**: JSON data tambahan

### System Tables

#### 15. **AcademicYears** - Data tahun ajaran
- **id**: Primary key (UUID)
- **name**: Nama tahun ajaran (2024/2025)
- **startDate**: Tanggal mulai
- **endDate**: Tanggal selesai
- **isActive**: Status aktif
- **schoolId**: Foreign key ke Schools
- **createdAt, updatedAt**: Timestamp

#### 16. **Attendances** - Data kehadiran (future enhancement)
- **id**: Primary key (UUID)
- **studentId**: Foreign key ke Students
- **classId**: Foreign key ke Classes
- **date**: Tanggal kehadiran
- **status**: HADIR | IZIN | SAKIT | ALPHA
- **notes**: Catatan
- **recordedBy**: Foreign key ke Users
- **createdAt, updatedAt**: Timestamp

### Key Relationships

1. **Users ↔ Schools**: Many-to-One (Users belong to one School)
2. **Classes ↔ Subjects**: Many-to-One (Classes have one Subject)
3. **Classes ↔ Teachers**: Many-to-Many (via ClassTeachers)
4. **Students ↔ Classes**: Many-to-One (Students belong to one Class)
5. **Assignments ↔ Classes**: Many-to-One (Assignments for one Class)
6. **Grades ↔ Students**: Many-to-One (Multiple Grades per Student)
7. **StudentXp ↔ Students**: One-to-One (Each Student has one XP record)
8. **StudentBadges ↔ Students**: Many-to-One (Students can have multiple Badges)
9. **Challenges ↔ Students**: Many-to-Many (via StudentChallenges)

### Indexes & Performance

#### Primary Indexes
- All primary keys (id fields)
- Unique indexes on email, studentId, nip

#### Secondary Indexes
- **Users**: schoolId, role, email
- **Classes**: schoolId, subjectId, academicYear
- **Students**: classId, studentId
- **Assignments**: classId, subjectId, teacherId, dueDate
- **Grades**: studentId, assignmentId, classId, subjectId
- **StudentXp**: studentId, totalXp, level
- **StudentBadges**: studentId, badgeId, earnedAt

#### Composite Indexes
- **ClassTeachers**: (classId, teacherId)
- **Grades**: (studentId, subjectId), (classId, gradeType)
- **StudentChallenges**: (studentId, challengeId)

### Data Constraints

#### Business Rules
1. **Email Uniqueness**: User emails must be unique across system
2. **Student Class Assignment**: Students can only be in one active class
3. **Grade Range**: Scores must be between 0-100
4. **XP Non-negative**: XP values cannot be negative
5. **Academic Year**: Only one active academic year per school
6. **Role Permissions**: Role-based access control enforced

#### Foreign Key Constraints
- All foreign keys have CASCADE DELETE where appropriate
- Soft deletes used for critical data (Users, Students, Classes)
- Hard deletes for transactional data (Grades, Attendances)

### Security Considerations

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Role-based Access**: Strict permission checking
4. **Data Validation**: Input validation at API level
5. **SQL Injection Prevention**: Prisma ORM protection
6. **Audit Trail**: CreatedAt/UpdatedAt timestamps

---

**Schema Version:** 1.0  
**Database Engine:** MySQL 8.0+  
**ORM:** Prisma 5.x  
**Last Updated:** Juni 2025

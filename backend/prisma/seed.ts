import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Mulai seeding database...`);

  // --- Create a default School ---
  const school = await prisma.school.upsert({
    where: { id: 'clw5w4q1g00001234abcd' },
    update: {},
    create: {
      id: 'clw5w4q1g00001234abcd',
      name: 'UPT SMP Negeri 01 Buay Rawan',
      address: 'Jl. Pendidikan No. 1, Buay Rawan, OKU Timur, Sumatera Selatan',
      phone: '0734-123456',
      email: 'smpn01buayrawan@gmail.com',
    },
  });
  console.log(`✅ Created school: ${school.name}`);

  // --- Create Admin User ---
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smpn01buayrawan.sch.id' },
    update: {},
    create: {
      email: 'admin@smpn01buayrawan.sch.id',
      fullName: 'Kepala Sekolah',
      nip: 'ADMIN001',
      password: hashedAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Created admin user: ${admin.fullName}`);

  // --- Create Subjects ---
  const subjects = [
    { name: 'Matematika', code: 'MTK', description: 'Mata pelajaran Matematika untuk SMP' },
    { name: 'Bahasa Indonesia', code: 'BIN', description: 'Mata pelajaran Bahasa Indonesia' },
    { name: 'Bahasa Inggris', code: 'ENG', description: 'Mata pelajaran Bahasa Inggris' },
    { name: 'Ilmu Pengetahuan Alam (IPA)', code: 'IPA', description: 'Mata pelajaran IPA Terpadu' },
    { name: 'Ilmu Pengetahuan Sosial (IPS)', code: 'IPS', description: 'Mata pelajaran IPS Terpadu' },
    { name: 'Pendidikan Pancasila dan Kewarganegaraan', code: 'PKN', description: 'Mata pelajaran PPKn' },
    { name: 'Pendidikan Agama Islam', code: 'PAI', description: 'Mata pelajaran Pendidikan Agama Islam' },
    { name: 'Seni Budaya', code: 'SBK', description: 'Mata pelajaran Seni Budaya' },
    { name: 'PJOK', code: 'PJOK', description: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
    { name: 'Prakarya', code: 'PKY', description: 'Mata pelajaran Prakarya' },
    { name: 'Bahasa Daerah', code: 'BD', description: 'Mata pelajaran Bahasa Daerah (Bahasa Palembang)' },
    { name: 'TIK', code: 'TIK', description: 'Teknologi Informasi dan Komunikasi' },
  ];

  const createdSubjects: any[] = [];
  for (const subject of subjects) {
    const createdSubject = await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    });
    createdSubjects.push(createdSubject);
  }
  console.log(`✅ Created ${createdSubjects.length} subjects`);

  // --- Create Teacher Users ---
  const hashedTeacherPassword = await bcrypt.hash('guru123', 10);
  const teachers = [
    { email: 'matematika@smpn01buayrawan.sch.id', fullName: 'Drs. Budi Santoso', nip: 'GURU001' },
    { email: 'bahasa@smpn01buayrawan.sch.id', fullName: 'Siti Nurhaliza, S.Pd', nip: 'GURU002' },
    { email: 'inggris@smpn01buayrawan.sch.id', fullName: 'Rahmawati, S.Pd', nip: 'GURU003' },
    { email: 'ipa@smpn01buayrawan.sch.id', fullName: 'Dr. Ahmad Wijaya, M.Pd', nip: 'GURU004' },
    { email: 'ips@smpn01buayrawan.sch.id', fullName: 'Dewi Sartika, S.Pd', nip: 'GURU005' },
    { email: 'pkn@smpn01buayrawan.sch.id', fullName: 'Drs. Hadi Susanto', nip: 'GURU006' },
    { email: 'pai@smpn01buayrawan.sch.id', fullName: 'Ustadz Muhammad Ridho, S.Ag', nip: 'GURU007' },
    { email: 'seni@smpn01buayrawan.sch.id', fullName: 'Rina Handayani, S.Sn', nip: 'GURU008' },
  ];

  const createdTeachers: any[] = [];
  for (const teacher of teachers) {
    const createdTeacher = await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: {
        ...teacher,
        password: hashedTeacherPassword,
        role: 'GURU',
        status: 'ACTIVE',
      },
    });
    createdTeachers.push(createdTeacher);
  }
  console.log(`✅ Created ${createdTeachers.length} teacher users`);

  // --- Create Classes (Physical Classes) ---
  const classes = [
    { 
      name: 'VII A', 
      description: 'Kelas 7A',
      gradeLevel: '7',
      schoolId: school.id,
      studentCount: 28,
      isPhysicalClass: true
    },
    { 
      name: 'VII B', 
      description: 'Kelas 7B',
      gradeLevel: '7',
      schoolId: school.id,
      studentCount: 30,
      isPhysicalClass: true
    },
    { 
      name: 'VIII A', 
      description: 'Kelas 8A',
      gradeLevel: '8',
      schoolId: school.id,
      studentCount: 29,
      isPhysicalClass: true
    },
    { 
      name: 'VIII B', 
      description: 'Kelas 8B',
      gradeLevel: '8',
      schoolId: school.id,
      studentCount: 27,
      isPhysicalClass: true
    },
    { 
      name: 'IX A', 
      description: 'Kelas 9A',
      gradeLevel: '9',
      schoolId: school.id,
      studentCount: 25,
      isPhysicalClass: true
    },
    { 
      name: 'IX B', 
      description: 'Kelas 9B',
      gradeLevel: '9',
      schoolId: school.id,
      studentCount: 26,
      isPhysicalClass: true
    },
  ];

  const createdClasses: any[] = [];
  for (const classData of classes) {
    const createdClass = await prisma.class.create({
      data: classData,
    });
    createdClasses.push(createdClass);
  }
  console.log(`✅ Created ${createdClasses.length} classes`);

  // --- Create Class-Subject Relations (Multi-Subject per Class) ---
  const classSubjectMappings = [
    // Kelas VII A - 4 subjects
    { classId: createdClasses[0].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id },
    { classId: createdClasses[0].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id },
    { classId: createdClasses[0].id, subjectId: createdSubjects.find(s => s.code === 'ENG')?.id },
    { classId: createdClasses[0].id, subjectId: createdSubjects.find(s => s.code === 'IPA')?.id },
    
    // Kelas VII B - 5 subjects
    { classId: createdClasses[1].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id },
    { classId: createdClasses[1].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id },
    { classId: createdClasses[1].id, subjectId: createdSubjects.find(s => s.code === 'IPS')?.id },
    { classId: createdClasses[1].id, subjectId: createdSubjects.find(s => s.code === 'PKN')?.id },
    { classId: createdClasses[1].id, subjectId: createdSubjects.find(s => s.code === 'PAI')?.id },
    
    // Kelas VIII A - 3 subjects
    { classId: createdClasses[2].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id },
    { classId: createdClasses[2].id, subjectId: createdSubjects.find(s => s.code === 'IPA')?.id },
    { classId: createdClasses[2].id, subjectId: createdSubjects.find(s => s.code === 'SBK')?.id },
    
    // Kelas VIII B - 6 subjects
    { classId: createdClasses[3].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id },
    { classId: createdClasses[3].id, subjectId: createdSubjects.find(s => s.code === 'ENG')?.id },
    { classId: createdClasses[3].id, subjectId: createdSubjects.find(s => s.code === 'IPS')?.id },
    { classId: createdClasses[3].id, subjectId: createdSubjects.find(s => s.code === 'PJOK')?.id },
    { classId: createdClasses[3].id, subjectId: createdSubjects.find(s => s.code === 'PKY')?.id },
    { classId: createdClasses[3].id, subjectId: createdSubjects.find(s => s.code === 'BD')?.id },
    
    // Kelas IX A - 2 subjects
    { classId: createdClasses[4].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id },
    { classId: createdClasses[4].id, subjectId: createdSubjects.find(s => s.code === 'IPA')?.id },
    
    // Kelas IX B - 4 subjects
    { classId: createdClasses[5].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id },
    { classId: createdClasses[5].id, subjectId: createdSubjects.find(s => s.code === 'IPS')?.id },
    { classId: createdClasses[5].id, subjectId: createdSubjects.find(s => s.code === 'TIK')?.id },
    { classId: createdClasses[5].id, subjectId: createdSubjects.find(s => s.code === 'PAI')?.id },
  ];

  for (const mapping of classSubjectMappings) {
    await prisma.classSubject.create({
      data: mapping,
    });
  }
  console.log(`✅ Created ${classSubjectMappings.length} class-subject mappings`);

  // --- Assign Teachers to Class-Subject combinations ---
  const classTeacherSubjectAssignments = [
    // Kelas VII A
    { classId: createdClasses[0].id, teacherId: createdTeachers[0].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id }, // Budi - MTK
    { classId: createdClasses[0].id, teacherId: createdTeachers[1].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id }, // Siti - BIN
    { classId: createdClasses[0].id, teacherId: createdTeachers[2].id, subjectId: createdSubjects.find(s => s.code === 'ENG')?.id }, // Rahmawati - ENG
    { classId: createdClasses[0].id, teacherId: createdTeachers[3].id, subjectId: createdSubjects.find(s => s.code === 'IPA')?.id }, // Ahmad - IPA
    
    // Kelas VII B
    { classId: createdClasses[1].id, teacherId: createdTeachers[0].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id }, // Budi - MTK
    { classId: createdClasses[1].id, teacherId: createdTeachers[1].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id }, // Siti - BIN
    { classId: createdClasses[1].id, teacherId: createdTeachers[4].id, subjectId: createdSubjects.find(s => s.code === 'IPS')?.id }, // Dewi - IPS
    { classId: createdClasses[1].id, teacherId: createdTeachers[5].id, subjectId: createdSubjects.find(s => s.code === 'PKN')?.id }, // Hadi - PKN
    { classId: createdClasses[1].id, teacherId: createdTeachers[6].id, subjectId: createdSubjects.find(s => s.code === 'PAI')?.id }, // Ridho - PAI
    
    // Kelas VIII A
    { classId: createdClasses[2].id, teacherId: createdTeachers[0].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id }, // Budi - MTK
    { classId: createdClasses[2].id, teacherId: createdTeachers[3].id, subjectId: createdSubjects.find(s => s.code === 'IPA')?.id }, // Ahmad - IPA
    { classId: createdClasses[2].id, teacherId: createdTeachers[7].id, subjectId: createdSubjects.find(s => s.code === 'SBK')?.id }, // Rina - SBK
    
    // Kelas VIII B
    { classId: createdClasses[3].id, teacherId: createdTeachers[1].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id }, // Siti - BIN
    { classId: createdClasses[3].id, teacherId: createdTeachers[2].id, subjectId: createdSubjects.find(s => s.code === 'ENG')?.id }, // Rahmawati - ENG
    { classId: createdClasses[3].id, teacherId: createdTeachers[4].id, subjectId: createdSubjects.find(s => s.code === 'IPS')?.id }, // Dewi - IPS
    { classId: createdClasses[3].id, teacherId: createdTeachers[0].id, subjectId: createdSubjects.find(s => s.code === 'PJOK')?.id }, // Budi - PJOK (double role)
    { classId: createdClasses[3].id, teacherId: createdTeachers[7].id, subjectId: createdSubjects.find(s => s.code === 'PKY')?.id }, // Rina - PKY
    { classId: createdClasses[3].id, teacherId: createdTeachers[5].id, subjectId: createdSubjects.find(s => s.code === 'BD')?.id }, // Hadi - BD
    
    // Kelas IX A
    { classId: createdClasses[4].id, teacherId: createdTeachers[0].id, subjectId: createdSubjects.find(s => s.code === 'MTK')?.id }, // Budi - MTK
    { classId: createdClasses[4].id, teacherId: createdTeachers[3].id, subjectId: createdSubjects.find(s => s.code === 'IPA')?.id }, // Ahmad - IPA
    
    // Kelas IX B
    { classId: createdClasses[5].id, teacherId: createdTeachers[1].id, subjectId: createdSubjects.find(s => s.code === 'BIN')?.id }, // Siti - BIN
    { classId: createdClasses[5].id, teacherId: createdTeachers[4].id, subjectId: createdSubjects.find(s => s.code === 'IPS')?.id }, // Dewi - IPS
    { classId: createdClasses[5].id, teacherId: createdTeachers[2].id, subjectId: createdSubjects.find(s => s.code === 'TIK')?.id }, // Rahmawati - TIK (double role)
    { classId: createdClasses[5].id, teacherId: createdTeachers[6].id, subjectId: createdSubjects.find(s => s.code === 'PAI')?.id }, // Ridho - PAI
  ];

  for (const assignment of classTeacherSubjectAssignments) {
    await prisma.classTeacherSubject.create({
      data: {
        ...assignment,
        isActive: true
      },
    });
  }
  console.log(`✅ Created ${classTeacherSubjectAssignments.length} class-teacher-subject assignments`);

  // --- Create Sample Students ---
  const students = [
    // Kelas VII A
    { studentId: 'NISN2024001', fullName: 'Andi Pratama', email: 'andi@student.com', classId: createdClasses[0].id, gender: 'L' as const },
    { studentId: 'NISN2024002', fullName: 'Sari Indah', email: 'sari@student.com', classId: createdClasses[0].id, gender: 'P' as const },
    { studentId: 'NISN2024003', fullName: 'Rizki Ananda', email: 'rizki@student.com', classId: createdClasses[0].id, gender: 'L' as const },
    
    // Kelas VII B
    { studentId: 'NISN2024004', fullName: 'Maya Sari', email: 'maya@student.com', classId: createdClasses[1].id, gender: 'P' as const },
    { studentId: 'NISN2024005', fullName: 'Dika Pratama', email: 'dika@student.com', classId: createdClasses[1].id, gender: 'L' as const },
    
    // Kelas VIII A
    { studentId: 'NISN2023001', fullName: 'Budi Setiawan', email: 'budi@student.com', classId: createdClasses[2].id, gender: 'L' as const },
    { studentId: 'NISN2023002', fullName: 'Putri Maharani', email: 'putri@student.com', classId: createdClasses[2].id, gender: 'P' as const },
    
    // Kelas VIII B
    { studentId: 'NISN2023003', fullName: 'Rudi Hartono', email: 'rudi@student.com', classId: createdClasses[3].id, gender: 'L' as const },
    { studentId: 'NISN2023004', fullName: 'Dewi Anggraini', email: 'dewi@student.com', classId: createdClasses[3].id, gender: 'P' as const },
    
    // Kelas IX A
    { studentId: 'NISN2022001', fullName: 'Fajar Ramadhan', email: 'fajar@student.com', classId: createdClasses[4].id, gender: 'L' as const },
    { studentId: 'NISN2022002', fullName: 'Aulia Safitri', email: 'aulia@student.com', classId: createdClasses[4].id, gender: 'P' as const },
    
    // Kelas IX B
    { studentId: 'NISN2022003', fullName: 'Bagus Nugroho', email: 'bagus@student.com', classId: createdClasses[5].id, gender: 'L' as const },
    { studentId: 'NISN2022004', fullName: 'Ayu Permatasari', email: 'ayu@student.com', classId: createdClasses[5].id, gender: 'P' as const },
  ];

  const createdStudents: any[] = [];
  for (const student of students) {
    const createdStudent = await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: {
        ...student,
        dateOfBirth: new Date('2006-01-15'),
        address: 'Jakarta',
        phone: '08123456789',
        parentName: 'Orang Tua',
        parentPhone: '08198765432',
        status: 'ACTIVE',
      },
    });
    createdStudents.push(createdStudent);
  }
  console.log(`✅ Created ${createdStudents.length} students`);

  // --- Create Student Subject Enrollments ---
  const studentEnrollments = [];
  
  // Enroll students to all subjects in their class
  for (const student of createdStudents) {
    // Get all subjects for this student's class
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId: student.classId },
      include: { subject: true }
    });
    
    // Enroll student to each subject in their class
    for (const classSubject of classSubjects) {
      studentEnrollments.push({
        studentId: student.id,
        classId: student.classId,
        subjectId: classSubject.subjectId,
        isActive: true
      });
    }
  }
  
  // Create all enrollments
  for (const enrollment of studentEnrollments) {
    await prisma.studentSubjectEnrollment.create({
      data: enrollment,
    });
  }
  console.log(`✅ Created ${studentEnrollments.length} student subject enrollments`);

  // --- Create Student XP Records ---
  for (const student of createdStudents) {
    await prisma.studentXp.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        totalXp: Math.floor(Math.random() * 500) + 100, // Random XP between 100-600
        level: Math.floor(Math.random() * 3) + 1, // Level 1-3
        levelName: ['Pemula', 'Berkembang', 'Mahir'][Math.floor(Math.random() * 3)],
        attendanceStreak: Math.floor(Math.random() * 10),
        assignmentStreak: Math.floor(Math.random() * 5),
      },
    });
  }
  console.log(`✅ Created student XP records`);

  // --- Create Badges ---
  const badges = [
    { name: 'Rajin Belajar', description: 'Menyelesaikan 10 tugas tepat waktu', icon: '📚', xpReward: 100, schoolId: school.id },
    { name: 'Bintang Kelas', description: 'Mendapatkan nilai rata-rata di atas 90', icon: '⭐', xpReward: 250, schoolId: school.id },
    { name: 'Absen Sempurna', description: 'Hadir 100% dalam sebulan', icon: '🎯', xpReward: 150, schoolId: school.id },
    { name: 'Sang Juara', description: 'Peringkat 1 di kelas', icon: '🏆', xpReward: 500, schoolId: school.id },
    { name: 'Penolong Teman', description: 'Aktif membantu teman', icon: '🤝', xpReward: 75, schoolId: school.id },
    { name: 'Kreatif', description: 'Mengumpulkan tugas dengan kreativitas tinggi', icon: '🎨', xpReward: 125, schoolId: school.id },
    { name: 'Disiplin', description: 'Tidak pernah terlambat selama sebulan', icon: '⏰', xpReward: 100, schoolId: school.id },
  ];

  const createdBadges: any[] = [];
  for (const badge of badges) {
    const createdBadge = await prisma.badge.create({
      data: badge,
    });
    createdBadges.push(createdBadge);
  }
  console.log(`✅ Created ${createdBadges.length} badges`);

  // --- Create Gamification Settings ---
  const gamificationSettings = await prisma.gamificationSettings.upsert({
    where: { name: 'Default Settings' },
    update: {},
    create: {
      name: 'Default Settings',
      description: 'Pengaturan gamifikasi standar untuk SMA Digital Pelangi',
      xpPerGrade: 1,
      xpAttendanceBonus: 10,
      xpAbsentPenalty: 5,
      levelThresholds: {
        levels: [
          { level: 1, name: 'Pemula', xp: 0 },
          { level: 2, name: 'Berkembang', xp: 100 },
          { level: 3, name: 'Mahir', xp: 300 },
          { level: 4, name: 'Ahli', xp: 600 },
          { level: 5, name: 'Master', xp: 1000 },
          { level: 6, name: 'Grandmaster', xp: 1500 },
          { level: 7, name: 'Legend', xp: 2000 },
          { level: 8, name: 'Mythic', xp: 2500 },
          { level: 9, name: 'Immortal', xp: 3000 },
          { level: 10, name: 'Divine', xp: 4000 },
        ]
      },
    },
  });
  console.log(`✅ Created gamification settings: ${gamificationSettings.name}`);

  // --- Create Sample Assignments ---
  const assignments = [
    {
      title: 'Latihan Soal Aljabar Kelas VII',
      description: 'Kerjakan soal-soal aljabar dasar pada buku halaman 25-30',
      instructions: 'Kerjakan dengan rapi dan tunjukkan langkah-langkah penyelesaian',
      points: 100,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'PUBLISHED' as const,
      type: 'TUGAS_HARIAN' as const,
      classId: createdClasses[0].id, // Kelas VII A
      teacherId: createdTeachers[0].id, // Budi Santoso (MTK)
    },
    {
      title: 'Quiz IPA - Sistem Tata Surya',
      description: 'Quiz tentang materi sistem tata surya dan planet-planet',
      instructions: 'Jawab semua pertanyaan dengan benar dan lengkap',
      points: 50,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'PUBLISHED' as const,
      type: 'QUIZ' as const,
      classId: createdClasses[0].id, // Kelas VII A
      teacherId: createdTeachers[3].id, // Ahmad Wijaya (IPA)
    },
    {
      title: 'Tugas Bahasa Indonesia - Menulis Puisi',
      description: 'Buat puisi dengan tema alam sebanyak 4 bait',
      instructions: 'Gunakan majas dan kata-kata yang indah, tulis tangan di kertas folio',
      points: 75,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'PUBLISHED' as const,
      type: 'TUGAS_HARIAN' as const,
      classId: createdClasses[1].id, // Kelas VII B
      teacherId: createdTeachers[1].id, // Siti Nurhaliza (BIN)
    },
  ];

  const createdAssignments: any[] = [];
  for (const assignment of assignments) {
    const createdAssignment = await prisma.assignment.create({
      data: assignment,
    });
    createdAssignments.push(createdAssignment);
  }
  console.log(`✅ Created ${createdAssignments.length} assignments`);

  // --- Create Sample Grades ---
  const sampleGrades = [
    { studentId: createdStudents[0].id, subjectId: createdSubjects[0].id, classId: createdClasses[0].id, gradeType: 'TUGAS_HARIAN' as const, score: 85, maxScore: 100 },
    { studentId: createdStudents[1].id, subjectId: createdSubjects[0].id, classId: createdClasses[0].id, gradeType: 'TUGAS_HARIAN' as const, score: 92, maxScore: 100 },
    { studentId: createdStudents[2].id, subjectId: createdSubjects[3].id, classId: createdClasses[1].id, gradeType: 'QUIZ' as const, score: 78, maxScore: 100 },
    { studentId: createdStudents[3].id, subjectId: createdSubjects[3].id, classId: createdClasses[1].id, gradeType: 'QUIZ' as const, score: 88, maxScore: 100 },
  ];

  for (const grade of sampleGrades) {
    await prisma.grade.create({
      data: {
        ...grade,
        description: `Nilai ${grade.gradeType.toLowerCase().replace('_', ' ')}`,
        date: new Date(),
        createdBy: createdTeachers[0].id,
      },
    });
  }
  console.log(`✅ Created sample grades`);

  // --- Create Assignment Submissions ---
  const submissions = [
    {
      assignmentId: createdAssignments[0].id, // Latihan Soal Aljabar
      studentId: createdStudents[0].id, // Andi Pratama (VII A)
      content: 'Jawaban soal aljabar:\n1. 2x + 3 = 15, maka x = 6\n2. 3y - 7 = 20, maka y = 9\n3. 4z + 5 = 29, maka z = 6\n\nLangkah penyelesaian sudah ditunjukkan dengan detail.',
      status: 'SUBMITTED' as const,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      assignmentId: createdAssignments[0].id, // Latihan Soal Aljabar
      studentId: createdStudents[1].id, // Sari Indah (VII A)
      content: 'Penyelesaian soal aljabar lengkap dengan langkah-langkah yang rapi dan benar.',
      score: 95,
      feedback: 'Excellent work! Jawaban sangat detail dan benar semua. Pertahankan!',
      status: 'GRADED' as const,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      gradedBy: createdTeachers[0].id, // Budi Santoso (Guru Matematika)
    },
    {
      assignmentId: createdAssignments[1].id, // Quiz IPA
      studentId: createdStudents[0].id, // Andi Pratama (VII A)
      content: 'Jawaban quiz tata surya:\n1. Matahari adalah pusat tata surya\n2. Planet terdekat dengan matahari adalah Merkurius\n3. Bumi adalah planet ketiga dari matahari',
      score: 88,
      feedback: 'Good job! Jawaban benar tapi bisa lebih detail lagi.',
      status: 'GRADED' as const,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      gradedAt: new Date(),
      gradedBy: createdTeachers[3].id, // Ahmad Wijaya (Guru IPA)
    },
    {
      assignmentId: createdAssignments[1].id, // Quiz IPA
      studentId: createdStudents[2].id, // Rizki Ananda (VII A)
      content: 'Quiz IPA sudah dikerjakan semua dengan jawaban lengkap dan gambar.',
      status: 'SUBMITTED' as const,
      submittedAt: new Date(), // Just submitted
    },
    {
      assignmentId: createdAssignments[2].id, // Tugas Bahasa Indonesia
      studentId: createdStudents[3].id, // Maya Sari (VII B)
      content: 'Puisi dengan tema alam:\n\nKeindahan Alam\n\nHijau daun bergoyang lembut\nAngin sepoi menerpa wajah\nBurung berkicau merdu\nAlam begitu indah\n\n(3 bait lainnya...)',
      score: 82,
      feedback: 'Puisi bagus, tapi bisa ditambah majas yang lebih beragam.',
      status: 'GRADED' as const,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      gradedBy: createdTeachers[1].id, // Siti Nurhaliza (Guru Bahasa Indonesia)
    },
    // Late submission example
    {
      assignmentId: createdAssignments[0].id, // Latihan Soal Aljabar
      studentId: createdStudents[4].id, // Dika Pratama (VII B) - mengerjakan tugas kelas VII A
      content: 'Maaf terlambat mengumpulkan. Jawaban soal aljabar sudah dikerjakan dengan lengkap.',
      status: 'LATE_SUBMITTED' as const,
      submittedAt: new Date(), // Late submission
    },
  ];

  for (const submission of submissions) {
    await prisma.assignmentSubmission.create({
      data: submission,
    });
  }
  console.log(`✅ Created ${submissions.length} assignment submissions`);

  // --- Create Sample Topics and Question Categories ---
  const topics = [
    { name: 'Aljabar Dasar', description: 'Topik tentang operasi aljabar dasar untuk SMP', subjectId: createdSubjects[0].id, gradeLevel: '7' },
    { name: 'Geometri Bidang', description: 'Topik tentang bangun datar dan sifat-sifatnya', subjectId: createdSubjects[0].id, gradeLevel: '7' },
    { name: 'Tata Surya', description: 'Topik tentang sistem tata surya dan planet-planet', subjectId: createdSubjects[3].id, gradeLevel: '7' },
    { name: 'Makhluk Hidup dan Lingkungannya', description: 'Topik tentang ekosistem dan interaksi makhluk hidup', subjectId: createdSubjects[3].id, gradeLevel: '7' },
    { name: 'Teks Puisi', description: 'Topik tentang jenis-jenis puisi dan cara membuatnya', subjectId: createdSubjects[1].id, gradeLevel: '7' },
    { name: 'Keragaman Budaya Indonesia', description: 'Topik tentang keberagaman suku dan budaya di Indonesia', subjectId: createdSubjects[4].id, gradeLevel: '8' },
  ];

  const createdTopics: any[] = [];
  for (const topic of topics) {
    const createdTopic = await prisma.topic.create({
      data: topic,
    });
    createdTopics.push(createdTopic);
  }
  console.log(`✅ Created ${createdTopics.length} topics`);

  const questionCategories = [
    { name: 'Soal Mudah', description: 'Kategori soal dengan tingkat kesulitan mudah', subjectId: createdSubjects[0].id },
    { name: 'Soal Sedang', description: 'Kategori soal dengan tingkat kesulitan sedang', subjectId: createdSubjects[0].id },
    { name: 'Soal Sulit', description: 'Kategori soal dengan tingkat kesulitan sulit', subjectId: createdSubjects[0].id },
    { name: 'Pengetahuan Dasar IPA', description: 'Soal tentang konsep dasar IPA SMP', subjectId: createdSubjects[3].id },
    { name: 'Pemahaman Teks', description: 'Soal tentang pemahaman teks Bahasa Indonesia', subjectId: createdSubjects[1].id },
    { name: 'Konsep Sosial', description: 'Soal tentang konsep dasar IPS', subjectId: createdSubjects[4].id },
  ];

  const createdCategories: any[] = [];
  for (const category of questionCategories) {
    const createdCategory = await prisma.questionCategory.create({
      data: category,
    });
    createdCategories.push(createdCategory);
  }
  console.log(`✅ Created ${createdCategories.length} question categories`);

  // --- Create Sample Questions ---
  const questions = [
    {
      questionText: 'Jika 3x + 7 = 22, berapakah nilai x?',
      questionType: 'MULTIPLE_CHOICE' as const,
      difficulty: 'EASY' as const,
      subjectId: createdSubjects[0].id, // Matematika
      categoryId: createdCategories[0].id,
      topicId: createdTopics[0].id,
      gradeLevel: '7',
      correctAnswer: 'A',
      explanation: 'Untuk menyelesaikan 3x + 7 = 22, kita kurangi 7 dari kedua sisi: 3x = 15, kemudian bagi dengan 3: x = 5',
      points: 5,
      timeLimit: 300, // 5 minutes
      createdBy: createdTeachers[0].id,
    },
    {
      questionText: 'Planet mana yang paling dekat dengan Matahari?',
      questionType: 'MULTIPLE_CHOICE' as const,
      difficulty: 'EASY' as const,
      subjectId: createdSubjects[3].id, // IPA
      categoryId: createdCategories[3].id,
      topicId: createdTopics[2].id,
      gradeLevel: '7',
      correctAnswer: 'B',
      explanation: 'Merkurius adalah planet yang paling dekat dengan Matahari dalam sistem tata surya kita',
      points: 5,
      timeLimit: 300,
      createdBy: createdTeachers[3].id,
    },
    {
      questionText: 'Jelaskan ciri-ciri puisi dan sebutkan 3 jenis puisi yang kamu ketahui!',
      questionType: 'ESSAY' as const,
      difficulty: 'MEDIUM' as const,
      subjectId: createdSubjects[1].id, // Bahasa Indonesia
      categoryId: createdCategories[4].id,
      topicId: createdTopics[4].id,
      gradeLevel: '7',
      correctAnswer: 'Puisi memiliki ciri-ciri: menggunakan bahasa kiasan, memiliki rima dan irama, padat makna. Jenis puisi: puisi lama (pantun, syair), puisi baru (sonnet, balada), puisi bebas.',
      explanation: 'Puisi adalah karya sastra yang mengungkapkan perasaan dan pikiran penyair dengan bahasa yang indah dan bermakna.',
      points: 10,
      timeLimit: 900, // 15 minutes
      createdBy: createdTeachers[1].id,
    },
    {
      questionText: 'Apa yang dimaksud dengan ekosistem?',
      questionType: 'ESSAY' as const,
      difficulty: 'MEDIUM' as const,
      subjectId: createdSubjects[3].id, // IPA
      categoryId: createdCategories[3].id,
      topicId: createdTopics[3].id,
      gradeLevel: '7',
      correctAnswer: 'Ekosistem adalah suatu sistem ekologi yang terbentuk oleh hubungan timbal balik antara makhluk hidup dengan lingkungannya. Ekosistem terdiri dari komponen biotik (makhluk hidup) dan abiotik (benda mati).',
      explanation: 'Dalam ekosistem terjadi aliran energi dan siklus materi yang membuat sistem ini dapat berfungsi secara seimbang.',
      points: 10,
      timeLimit: 600, // 10 minutes
      createdBy: createdTeachers[3].id,
    },
  ];

  const createdQuestions: any[] = [];
  for (const question of questions) {
    const createdQuestion = await prisma.question.create({
      data: question,
    });
    createdQuestions.push(createdQuestion);
  }
  console.log(`✅ Created ${createdQuestions.length} questions`);

  // --- Create Question Options (for multiple choice questions) ---
  const questionOptions = [
    // Options for first question (3x + 7 = 22)
    { questionId: createdQuestions[0].id, optionText: 'x = 5', isCorrect: true, orderIndex: 1 },
    { questionId: createdQuestions[0].id, optionText: 'x = 7', isCorrect: false, orderIndex: 2 },
    { questionId: createdQuestions[0].id, optionText: 'x = 15', isCorrect: false, orderIndex: 3 },
    { questionId: createdQuestions[0].id, optionText: 'x = 3', isCorrect: false, orderIndex: 4 },
    
    // Options for second question (planet terdekat matahari)
    { questionId: createdQuestions[1].id, optionText: 'Venus', isCorrect: false, orderIndex: 1 },
    { questionId: createdQuestions[1].id, optionText: 'Merkurius', isCorrect: true, orderIndex: 2 },
    { questionId: createdQuestions[1].id, optionText: 'Mars', isCorrect: false, orderIndex: 3 },
    { questionId: createdQuestions[1].id, optionText: 'Bumi', isCorrect: false, orderIndex: 4 },
  ];

  for (const option of questionOptions) {
    await prisma.questionOption.create({
      data: option,
    });
  }
  console.log(`✅ Created ${questionOptions.length} question options`);

  // --- Create Assignment Questions (link questions to assignments) ---
  const assignmentQuestions = [
    { assignmentId: createdAssignments[0].id, questionId: createdQuestions[0].id, orderIndex: 1, pointsOverride: 25 },
    { assignmentId: createdAssignments[1].id, questionId: createdQuestions[1].id, orderIndex: 1, pointsOverride: 25 },
    { assignmentId: createdAssignments[1].id, questionId: createdQuestions[3].id, orderIndex: 2, pointsOverride: 25 },
    { assignmentId: createdAssignments[2].id, questionId: createdQuestions[2].id, orderIndex: 1, pointsOverride: 75 },
  ];

  for (const aq of assignmentQuestions) {
    await prisma.assignmentQuestion.create({
      data: aq,
    });
  }
  console.log(`✅ Created ${assignmentQuestions.length} assignment-question links`);

  // --- Create Sample Student Answers ---
  const studentAnswers = [
    {
      questionId: createdQuestions[0].id,
      studentId: createdStudents[0].id, // Andi Pratama
      assignmentId: createdAssignments[0].id,
      answerText: 'A',
      isCorrect: true,
      score: 25,
      timeTaken: 180, // 3 minutes
    },
    {
      questionId: createdQuestions[1].id,
      studentId: createdStudents[0].id, // Andi Pratama
      assignmentId: createdAssignments[1].id,
      answerText: 'B',
      isCorrect: true,
      score: 25,
      timeTaken: 240, // 4 minutes
    },
    {
      questionId: createdQuestions[3].id,
      studentId: createdStudents[0].id, // Andi Pratama
      assignmentId: createdAssignments[1].id,
      answerText: 'Ekosistem adalah tempat dimana makhluk hidup saling berinteraksi. Ada yang memakan dan dimakan.',
      isCorrect: true,
      score: 20, // Not perfect but good for SMP level
      timeTaken: 480, // 8 minutes
    },
    {
      questionId: createdQuestions[2].id,
      studentId: createdStudents[3].id, // Maya Sari
      assignmentId: createdAssignments[2].id,
      answerText: 'Puisi itu indah, ada rimanya, dan bercerita. Jenis puisi ada pantun, syair, dan puisi bebas.',
      isCorrect: true,
      score: 65, // Good but could be more detailed
      timeTaken: 600, // 10 minutes
    },
  ];

  for (const answer of studentAnswers) {
    await prisma.studentAnswer.create({
      data: answer,
    });
  }
  console.log(`✅ Created ${studentAnswers.length} student answers`);

  // --- Create Sample Attendance Records ---
  const attendanceRecords = [
    { studentId: createdStudents[0].id, classId: createdClasses[0].id, date: new Date(), status: 'PRESENT' as const },
    { studentId: createdStudents[1].id, classId: createdClasses[0].id, date: new Date(), status: 'PRESENT' as const },
    { studentId: createdStudents[2].id, classId: createdClasses[1].id, date: new Date(), status: 'LATE' as const, timeIn: '08:15' },
    { studentId: createdStudents[3].id, classId: createdClasses[1].id, date: new Date(), status: 'ABSENT' as const, reason: 'SAKIT' as const },
    { studentId: createdStudents[4].id, classId: createdClasses[2].id, date: new Date(), status: 'PRESENT' as const },
  ];

  for (const attendance of attendanceRecords) {
    await prisma.attendance.create({
      data: attendance,
    });
  }
  console.log(`✅ Created ${attendanceRecords.length} attendance records`);

  // --- Create Sample Student Badges ---
  const studentBadgeAwards = [
    { studentId: createdStudents[1].id, badgeId: createdBadges[1].id, awardedBy: createdTeachers[0].id, reason: 'Mendapat nilai 95 pada tugas aljabar' },
    { studentId: createdStudents[0].id, badgeId: createdBadges[0].id, awardedBy: createdTeachers[0].id, reason: 'Mengumpulkan tugas tepat waktu' },
    { studentId: createdStudents[2].id, badgeId: createdBadges[0].id, awardedBy: createdTeachers[3].id, reason: 'Mengumpulkan quiz fisika tepat waktu' },
  ];

  for (const badge of studentBadgeAwards) {
    await prisma.studentBadge.create({
      data: badge,
    });
  }
  console.log(`✅ Created ${studentBadgeAwards.length} student badge awards`);

  console.log(`🎉 Seeding selesai! Database UPT SMP Negeri 01 Buay Rawan berhasil diisi dengan data sample lengkap:`);
  console.log(`   - 1 Sekolah: UPT SMP Negeri 01 Buay Rawan`);
  console.log(`   - ${createdSubjects.length} Mata Pelajaran SMP`);
  console.log(`   - ${createdTeachers.length} Guru`);
  console.log(`   - ${createdClasses.length} Kelas (VII A, VII B, VIII A, VIII B, IX A, IX B)`);
  console.log(`   - ${classSubjectMappings.length} Class-Subject Mappings (Multi-Subject per Class)`);
  console.log(`   - ${classTeacherSubjectAssignments.length} Teacher-Subject Assignments`);
  console.log(`   - ${createdStudents.length} Siswa`);
  console.log(`   - ${studentEnrollments.length} Student Subject Enrollments`);
  console.log(`   - ${createdAssignments.length} Assignments dengan submissions, questions, dan gamifikasi`);
  console.log(`   - Data lengkap untuk testing multi-subject assignment system!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

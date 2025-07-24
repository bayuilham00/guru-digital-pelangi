// Students Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentGrades,
  getStudentAttendance,
  getStudentAttendanceSubjects, // NEW: Import new function
  uploadProfilePhoto,
  getProfilePhoto,
  updateProfilePhoto,
  deleteProfilePhoto
} from '../controllers/studentController.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';
import { validateStudent } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/students - Get all students
router.get('/', getStudents);

// GET /api/students/:id - Get student by ID
router.get('/:id', getStudentById);

// GET /api/students/:id/grades - Get student grades
router.get('/:id/grades', getStudentGrades);

// GET /api/students/:id/attendance - Get student attendance
router.get('/:id/attendance', getStudentAttendance);

// NEW: GET /api/students/:id/attendance/subjects - Get available subjects for attendance
router.get('/:id/attendance/subjects', getStudentAttendanceSubjects);

// POST /api/students - Create new student
router.post('/', adminAndGuru, validateStudent, createStudent);

// PUT /api/students/bulk-assign-class - Bulk assign class to students (MUST be before /:id route)
router.put('/bulk-assign-class', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Bulk assign class request received');
    console.log('📝 Request body:', req.body);
    
    const { studentIds, classId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      console.error('📝 Invalid student IDs:', studentIds);
      return res.status(400).json({
        success: false,
        error: 'Student IDs tidak valid atau kosong'
      });
    }

    if (!classId) {
      console.error('📝 Class ID is required');
      return res.status(400).json({
        success: false,
        error: 'Class ID harus diisi'
      });
    }

    console.log('📝 Processing bulk assign for', studentIds.length, 'students to class:', classId);

    // Verify that all students exist
    const existingStudents = await prisma.student.findMany({
      where: {
        id: {
          in: studentIds
        }
      },
      select: { id: true, fullName: true, studentId: true }
    });

    const existingStudentIds = existingStudents.map(s => s.id);
    const missingStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));

    if (missingStudentIds.length > 0) {
      console.error('📝 Students not found:', missingStudentIds);
      return res.status(400).json({
        success: false,
        error: 'Beberapa siswa tidak ditemukan',
        missingStudentIds
      });
    }

    // Verify class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true }
    });

    if (!targetClass) {
      console.error('📝 Class not found:', classId);
      return res.status(400).json({
        success: false,
        error: 'Kelas tidak ditemukan'
      });
    }

    console.log('📝 Target class:', targetClass);

    // Perform bulk update
    const updateResult = await prisma.student.updateMany({
      where: {
        id: {
          in: studentIds
        }
      },
      data: {
        classId: classId
      }
    });

    console.log('📝 Bulk update result:', updateResult);

    // Get updated students for response
    const updatedStudents = await prisma.student.findMany({
      where: {
        id: {
          in: studentIds
        }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        }
      }
    });

    console.log('📝 Bulk assign class completed successfully');

    res.status(200).json({
      success: true,
      data: {
        updated: updateResult.count,
        students: updatedStudents,
        targetClass
      },
      message: `Berhasil mengassign ${updateResult.count} siswa ke kelas ${targetClass.name}`
    });

  } catch (error) {
    console.error('📝 Error bulk assigning class:', error);
    console.error('📝 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Gagal melakukan bulk assign class',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', adminAndGuru, validateStudent, updateStudent);

// DELETE /api/students/:id - Delete student
router.delete('/:id', adminAndGuru, deleteStudent);

// POST /api/students/bulk - Bulk import students
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Bulk import request received');
    console.log('📥 Request body:', req.body);
    console.log('📥 Students data:', req.body.students);
    
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      console.error('📥 Invalid students data:', students);
      return res.status(400).json({
        success: false,
        error: 'Data siswa tidak valid atau kosong'
      });
    }

    console.log('📥 Processing', students.length, 'students');

    // Validate each student data
    const validationErrors = [];
    const validStudents = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNumber = i + 1;

      // Required fields validation
      if (!student.studentId || !student.fullName) {
        validationErrors.push(`Baris ${rowNumber}: NISN dan Nama Lengkap wajib diisi`);
        continue;
      }

      // Check if studentId already exists
      const existingStudent = await prisma.student.findUnique({
        where: { studentId: student.studentId }
      });

      if (existingStudent) {
        validationErrors.push(`Baris ${rowNumber}: NISN ${student.studentId} sudah terdaftar`);
        continue;
      }

      // Validate class if provided
      if (student.classId) {
        const classExists = await prisma.class.findUnique({
          where: { id: student.classId }
        });

        if (!classExists) {
          validationErrors.push(`Baris ${rowNumber}: Kelas dengan ID ${student.classId} tidak ditemukan`);
          continue;
        }
      }

      // Validate gender if provided
      if (student.gender && !['L', 'P'].includes(student.gender)) {
        validationErrors.push(`Baris ${rowNumber}: Jenis kelamin harus 'L' atau 'P'`);
        continue;
      }

      // Validate date format if provided
      if (student.dateOfBirth) {
        const date = new Date(student.dateOfBirth);
        if (isNaN(date.getTime())) {
          validationErrors.push(`Baris ${rowNumber}: Format tanggal lahir tidak valid`);
          continue;
        }
      }

      validStudents.push({
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email || null,
        classId: student.classId || null,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
        gender: student.gender || null,
        address: student.address || null,
        asalSekolah: student.asalSekolah || null,
        kecamatan: student.kecamatan || null,
        desaKelurahan: student.desaKelurahan || null,
        phone: student.phone || null,
        parentName: student.parentName || null,
        parentPhone: student.parentPhone || null,
        status: 'ACTIVE'
      });
    }

    console.log('📥 Valid students after validation:', validStudents.length);
    console.log('📥 Validation errors:', validationErrors.length);

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Terdapat kesalahan validasi',
        validationErrors,
        validCount: validStudents.length,
        errorCount: validationErrors.length
      });
    }

    if (validStudents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tidak ada data siswa yang valid untuk diproses'
      });
    }

    console.log('📥 Creating students in database...');

    // Bulk create students
    const createdStudents = await prisma.student.createMany({
      data: validStudents,
      skipDuplicates: true
    });

    console.log('📥 Created students count:', createdStudents.count);

    // Get the newly created students to get their database IDs
    const newStudents = await prisma.student.findMany({
      where: {
        studentId: {
          in: validStudents.map(s => s.studentId)
        }
      }
    });

    console.log('📥 Found new students:', newStudents.length);

    // Create XP records with correct student IDs (database IDs, not studentId/NISN)
    if (newStudents.length > 0) {
      console.log('📥 Creating StudentXp records...');
      
      const xpRecords = newStudents.map(student => ({
        studentId: student.id, // Use the database ID, not the NISN
        totalXp: 0,
        level: 1,
        levelName: 'Pemula'
      }));

      console.log('📥 XP records to create:', xpRecords);

      await prisma.studentXp.createMany({
        data: xpRecords,
        skipDuplicates: true
      });

      console.log('📥 StudentXp records created successfully');
    }

    console.log('📥 Bulk import completed successfully');

    res.status(201).json({
      success: true,
      data: {
        created: createdStudents.count,
        students: newStudents
      },
      message: `Berhasil menambahkan ${createdStudents.count} siswa`
    });

  } catch (error) {
    console.error('📥 Error bulk importing students:', error);
    console.error('📥 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Gagal melakukan bulk import siswa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Profile Photo Routes
// POST /api/students/:id/profile-photo - Upload profile photo
router.post('/:id/profile-photo', uploadProfilePhoto);

// GET /api/students/:id/profile-photo - Get profile photo
router.get('/:id/profile-photo', getProfilePhoto);

// PUT /api/students/:id/profile-photo - Update profile photo  
router.put('/:id/profile-photo', updateProfilePhoto);

// DELETE /api/students/:id/profile-photo - Delete profile photo
router.delete('/:id/profile-photo', deleteProfilePhoto);

// GET /api/students/:id/classmates - Get student's classmates
router.get('/:id/classmates', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Getting classmates for student:', id);
    
    // First, get the student's class
    const student = await prisma.student.findUnique({
      where: { id },
      select: { 
        id: true, 
        fullName: true,
        classId: true,
        class: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Siswa tidak ditemukan'
      });
    }

    if (!student.classId) {
      return res.json({
        success: true,
        data: {
          classmates: [],
          className: null
        },
        message: 'Siswa belum memiliki kelas'
      });
    }

    // Get all classmates (students in the same class, excluding the requesting student)
    const classmates = await prisma.student.findMany({
      where: {
        classId: student.classId,
        id: {
          not: id // Exclude the requesting student
        }
      },
      select: {
        id: true,
        fullName: true,
        studentId: true,
        profilePhoto: true, // Correct field name from schema
        studentXp: {
          select: {
            totalXp: true,
            level: true,
            levelName: true
          }
        },
        grades: {
          select: {
            score: true
          }
        }
      },
      orderBy: [
        {
          studentXp: {
            totalXp: 'desc'
          }
        },
        {
          fullName: 'asc'
        }
      ]
    });

    // Transform data to match frontend expectations
    const transformedClassmates = classmates.map((classmate, index) => {
      // Calculate average grade
      const scores = classmate.grades.map(g => g.score);
      const averageGrade = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;

      return {
        id: classmate.id,
        fullName: classmate.fullName,
        studentId: classmate.studentId,
        profilePhoto: classmate.profilePhoto,
        rank: index + 1, // Ranking based on XP order
        totalXp: classmate.studentXp?.totalXp || 0,
        level: classmate.studentXp?.level || 1,
        levelName: classmate.studentXp?.levelName || 'Pemula',
        averageGrade: Math.round(averageGrade * 10) / 10 // Round to 1 decimal place
      };
    });

    console.log('✅ Found', transformedClassmates.length, 'classmates for student', id);
    console.log('📊 Sample classmate data:', transformedClassmates[0] ? {
      id: transformedClassmates[0].id,
      fullName: transformedClassmates[0].fullName,
      averageGrade: transformedClassmates[0].averageGrade,
      totalXp: transformedClassmates[0].totalXp
    } : 'No classmates found');

    res.json({
      success: true,
      data: {
        classmates: transformedClassmates,
        className: student.class?.name || null,
        totalClassmates: transformedClassmates.length
      },
      message: 'Berhasil mengambil data teman sekelas'
    });

  } catch (error) {
    console.error('❌ Error fetching classmates:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data teman sekelas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

// Routes untuk manajemen guru (Admin only)
import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: hanya admin yang bisa akses
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// GET /api/teachers - Get all teachers
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    const where = {
      role: 'GURU',
      ...(search && {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { nip: { contains: search } }
        ]
      }),
      ...(status && { status })
    };

    const teachers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        nip: true,
        status: true,
        createdAt: true,
        classTeacherSubjects: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                gradeLevel: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        _count: {
          select: {
            classTeacherSubjects: true,
            grades: true
          }
        }
      },
      orderBy: [
        { fullName: 'asc' }
      ]
    });

    // Transform data untuk menambahkan classes info
    const transformedTeachers = teachers.map(teacher => {
      // Group class-subject assignments by class
      const classesMap = new Map();
      
      teacher.classTeacherSubjects.forEach(cts => {
        const classId = cts.class.id;
        if (!classesMap.has(classId)) {
          classesMap.set(classId, {
            id: cts.class.id,
            name: cts.class.name,
            gradeLevel: cts.class.gradeLevel,
            subjects: []
          });
        }
        classesMap.get(classId).subjects.push({
          id: cts.subject.id,
          name: cts.subject.name,
          code: cts.subject.code
        });
      });

      const classes = Array.from(classesMap.values());
      
      return {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
        nip: teacher.nip,
        status: teacher.status,
        createdAt: teacher.createdAt,
        classes: classes,
        totalClasses: classes.length,
        totalSubjects: teacher.classTeacherSubjects.length,
        totalGrades: teacher._count.grades
      };
    });

    res.json({
      success: true,
      data: transformedTeachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data guru'
    });
  }
});

// GET /api/teachers/:id - Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.user.findUnique({
      where: { 
        id,
        role: 'GURU'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        nip: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        classTeacherSubjects: {
          include: {
            class: {
              include: {
                students: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        grades: {
          include: {
            student: true,
            subject: true,
            class: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Transform data
    const classesMap = new Map();
    
    teacher.classTeacherSubjects.forEach(cts => {
      const classId = cts.class.id;
      if (!classesMap.has(classId)) {
        classesMap.set(classId, {
          id: cts.class.id,
          name: cts.class.name,
          studentCount: cts.class.students.length,
          subjects: []
        });
      }
      classesMap.get(classId).subjects.push({
        id: cts.subject.id,
        name: cts.subject.name,
        code: cts.subject.code
      });
    });

    const classes = Array.from(classesMap.values());
    
    const transformedTeacher = {
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      nip: teacher.nip,
      status: teacher.status,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
      classes: classes,
      totalClasses: classes.length,
      totalSubjects: teacher.classTeacherSubjects.length,
      recentGrades: teacher.grades
    };

    res.json({
      success: true,
      data: transformedTeacher
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data guru'
    });
  }
});

// POST /api/teachers - Create new teacher
router.post('/', async (req, res) => {
  try {
    const { fullName, email, nip, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan password wajib diisi'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan'
      });
    }

    // Check if NIP already exists (if provided)
    if (nip) {
      const existingNip = await prisma.user.findUnique({
        where: { nip }
      });

      if (existingNip) {
        return res.status(400).json({
          success: false,
          message: 'NIP sudah digunakan'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await prisma.user.create({
      data: {
        fullName,
        email,
        nip,
        password: hashedPassword,
        role: 'GURU',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        nip: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Guru berhasil dibuat',
      data: teacher
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat akun guru'
    });
  }
});

// PUT /api/teachers/:id - Update teacher
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, nip, status, password } = req.body;

    // Check if teacher exists
    const existingTeacher = await prisma.user.findUnique({
      where: { 
        id,
        role: 'GURU'
      }
    });

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Check email uniqueness (if being changed)
    if (email && email !== existingTeacher.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }
    }

    // Check NIP uniqueness (if being changed)
    if (nip && nip !== existingTeacher.nip) {
      const nipExists = await prisma.user.findUnique({
        where: { nip }
      });

      if (nipExists) {
        return res.status(400).json({
          success: false,
          message: 'NIP sudah digunakan'
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...(email && { email }),
      ...(nip !== undefined && { nip }),
      ...(status && { status }),
      ...(fullName && { fullName })
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const teacher = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        nip: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Data guru berhasil diperbarui',
      data: teacher
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data guru'
    });
  }
});

// DELETE /api/teachers/:id - Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const existingTeacher = await prisma.user.findUnique({
      where: { 
        id,
        role: 'GURU'
      },
      include: {
        classTeachers: true,
        _count: {
          select: {
            classTeachers: true,
            grades: true
          }
        }
      }
    });

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Check if teacher has active classes or grades
    if (existingTeacher._count.classTeachers > 0 || existingTeacher._count.grades > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus guru yang masih memiliki kelas atau nilai aktif. Hapus data terkait terlebih dahulu.'
      });
    }

    // Delete teacher
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Guru berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus guru'
    });
  }
});

// GET /api/teachers/template - Download Excel template
router.get('/template', async (req, res) => {
  try {
    // Simple CSV template with fullName
    const csvContent = `fullName,email,nip,password
Budi Santoso,budi.santoso@example.com,123456789,password123
Siti Nurhaliza,siti.nurhaliza@example.com,987654321,password456
Ahmad Wijaya,ahmad.wijaya@example.com,111222333,password789`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="template-guru.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat template'
    });
  }
});

// POST /api/teachers/bulk-import - Bulk import teachers from Excel/CSV
router.post('/bulk-import', async (req, res) => {
  try {
    // For now, return a placeholder response
    // This would need proper file upload handling with multer and Excel parsing
    res.json({
      success: true,
      message: 'Fitur bulk import akan segera tersedia',
      imported: 0
    });
  } catch (error) {
    console.error('Error bulk importing teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengimpor data guru'
    });
  }
});

export default router;

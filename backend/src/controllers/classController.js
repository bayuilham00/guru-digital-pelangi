// Class Controller
// Handles CRUD operations for classes
import { PrismaClient } from '@prisma/client';
import { getConfigValue } from '../../controllers/configController.js';

const prisma = new PrismaClient();

/**
 * Get all classes
 * GET /api/classes
 */
export const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, gradeLevel, schoolId, teacherId, subjectId } = req.query;
    const { user } = req;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { gradeLevel: { contains: search } },
        { subject: { name: { contains: search } } }
      ];
    }

    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    // Role-based filtering
    if (user.role === 'GURU') {
      // Guru hanya bisa lihat kelas yang mereka ajar
      where.classTeacherSubjects = {
        some: {
          teacherId: user.id,
          isActive: true
        }
      };
    } else if (teacherId) {
      // Admin bisa filter berdasarkan guru
      where.classTeacherSubjects = {
        some: {
          teacherId: teacherId,
          isActive: true
        }
      };
    }

    // Get classes with pagination
    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          school: {
            select: {
              id: true,
              name: true
            }
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          classTeacherSubjects: {
            where: {
              isActive: true
            },
            include: {
              teacher: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
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
            select: { students: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.class.count({ where })
    ]);

    // Transform data untuk menambahkan teachers info
    const classesWithCount = classes.map(cls => ({
      ...cls,
      studentCount: cls._count.students,
      teachers: cls.classTeacherSubjects.map(cts => ({
        id: cts.teacher.id,
        fullName: cts.teacher.fullName,
        email: cts.teacher.email,
        subject: {
          id: cts.subject.id,
          name: cts.subject.name,
          code: cts.subject.code
        }
      }))
    }));

    res.json({
      success: true,
      data: {
        classes: classesWithCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data kelas'
    });
  }
};

/**
 * Get class by ID
 * GET /api/classes/:id
 */
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        // Multi-subject support: Get subjects via ClassSubject junction
        classSubjects: {
          where: { isActive: true },
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                description: true
              }
            }
          }
        },
        // Multi-subject support: Get teachers via ClassTeacherSubject
        classTeacherSubjects: {
          where: { isActive: true },
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true,
                nip: true
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
        // Backward compatibility: Old schema
        classTeachers: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true,
                nip: true
              }
            }
          }
        },
        // Backward compatibility: Single subject
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            status: true
          },
          orderBy: { fullName: 'asc' }
        },
        _count: {
          select: { students: true }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Check permission for GURU role
    if (user.role === 'GURU') {
      // Check both new and old schema for teacher access
      const isTeacherOfClass = 
        classData.classTeacherSubjects.some(cts => cts.teacherId === user.id) ||
        classData.classTeachers.some(ct => ct.teacherId === user.id);
        
      if (!isTeacherOfClass) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses ke kelas ini'
        });
      }
    }

    // Transform data for multi-subject support
    let subjects = [];
    let teachers = [];

    // Process multi-subject data (new schema)
    if (classData.classSubjects && classData.classSubjects.length > 0) {
      subjects = classData.classSubjects.map(cs => cs.subject);
    }
    
    if (classData.classTeacherSubjects && classData.classTeacherSubjects.length > 0) {
      // Group teachers by subject
      const teachersBySubject = {};
      classData.classTeacherSubjects.forEach(cts => {
        const subjectId = cts.subject.id;
        if (!teachersBySubject[subjectId]) {
          teachersBySubject[subjectId] = [];
        }
        teachersBySubject[subjectId].push({
          id: cts.teacher.id,
          fullName: cts.teacher.fullName,
          email: cts.teacher.email,
          nip: cts.teacher.nip
        });
      });

      // Create subjects with teachers
      subjects = subjects.map(subject => ({
        ...subject,
        teachers: teachersBySubject[subject.id] || []
      }));

      // Get all unique teachers
      const uniqueTeachers = new Map();
      classData.classTeacherSubjects.forEach(cts => {
        if (!uniqueTeachers.has(cts.teacher.id)) {
          uniqueTeachers.set(cts.teacher.id, {
            id: cts.teacher.id,
            fullName: cts.teacher.fullName,
            email: cts.teacher.email,
            nip: cts.teacher.nip
          });
        }
      });
      teachers = Array.from(uniqueTeachers.values());
    }

    // Fallback to old schema if no multi-subject data
    if (subjects.length === 0 && classData.subject) {
      subjects = [classData.subject];
    }
    
    if (teachers.length === 0 && classData.classTeachers.length > 0) {
      teachers = classData.classTeachers.map(ct => ({
        id: ct.teacher.id,
        fullName: ct.teacher.fullName,
        email: ct.teacher.email,
        nip: ct.teacher.nip
      }));
    }
    res.json({
      success: true,
      message: 'Class data retrieved successfully',
      data: {
        id: classData.id,
        name: classData.name,
        gradeLevel: classData.gradeLevel,
        description: classData.description,
        academicYear: classData.academicYear,
        school: classData.school,
        subjects: subjects,
        teachers: teachers,
        students: classData.students,
        studentCount: classData._count.students,
        createdAt: classData.createdAt,
        updatedAt: classData.updatedAt
      }
    });

  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data kelas'
    });
  }
};

/**
 * Create new class
 * POST /api/classes
 */
export const createClass = async (req, res) => {
  try {
    const { name, subjectId, teacherIds, description, gradeLevel } = req.body;
    const { user } = req;

    // Updated validation - subjectId is now optional
    if (!name || !gradeLevel) {
      return res.status(400).json({
        success: false,
        message: 'Nama kelas dan tingkat kelas wajib diisi'
      });
    }

    // If subjectId is provided, validate it
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId }
      });

      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Mata pelajaran tidak ditemukan'
        });
      }

      // Check for duplicate class name + subject combination
      const existingClass = await prisma.class.findFirst({
        where: {
          name,
          subjectId
        }
      });

      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'Kelas dengan nama dan mata pelajaran yang sama sudah ada'
        });
      }
    } else {
      // For classes without subject, just check if class name already exists
      const existingClass = await prisma.class.findFirst({
        where: {
          name,
          subjectId: null
        }
      });

      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'Kelas dengan nama yang sama sudah ada'
        });
      }
    }

    // Determine teachers to assign (only if subjectId is provided)
    let finalTeacherIds = [];
    if (subjectId) {
      if (user.role === 'ADMIN') {
        // Admin bisa assign guru lain
        finalTeacherIds = teacherIds || [];
      } else {
        // Guru otomatis assign ke diri sendiri
        finalTeacherIds = [user.id];
      }

      // Validate teacher IDs
      if (finalTeacherIds.length > 0) {
        const validTeachers = await prisma.user.findMany({
          where: {
            id: { in: finalTeacherIds },
            role: 'GURU'
          }
        });

        if (validTeachers.length !== finalTeacherIds.length) {
          return res.status(400).json({
            success: false,
            message: 'Beberapa guru yang dipilih tidak valid'
          });
        }
      }
    }

    // Create class with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get configuration values
      const defaultSchoolId = await getConfigValue('DEFAULT_SCHOOL_ID');
      const defaultAcademicYear = await getConfigValue('DEFAULT_ACADEMIC_YEAR');

      // Create class (subjectId can be null)
      const classData = await tx.class.create({
        data: {
          name,
          subjectId: subjectId || null,
          description,
          gradeLevel,
          schoolId: defaultSchoolId || null,
          academicYear: defaultAcademicYear || '2024/2025'
        }
      });

      // Create class-teacher relationships only if teachers are specified
      if (finalTeacherIds.length > 0) {
        await tx.classTeacher.createMany({
          data: finalTeacherIds.map(teacherId => ({
            classId: classData.id,
            teacherId
          }))
        });
      }

      return classData;
    });

    // Fetch complete class data
    const completeClassData = await prisma.class.findUnique({
      where: { id: result.id },
      include: {
        subject: subjectId ? true : false, // Only include subject if it exists
        classTeachers: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: subjectId 
        ? 'Kelas berhasil dibuat' 
        : 'Kelas berhasil dibuat. Gunakan fitur "Kelola Mata Pelajaran" untuk menambahkan subject dan guru.',
      data: { class: completeClassData }
    });

  } catch (error) {
    console.error('Create class error:', error);
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.message
    });
  }
};

/**
 * Update class
 * PUT /api/classes/:id
 */
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subjectId, teacherIds, description, gradeLevel } = req.body;
    const { user } = req;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        classTeachers: true
      }
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Check permission for GURU role
    if (user.role === 'GURU') {
      const isTeacherOfClass = existingClass.classTeachers.some(ct => ct.teacherId === user.id);
      if (!isTeacherOfClass) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk mengedit kelas ini'
        });
      }
    }

    // Validate subject if provided
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId }
      });

      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Mata pelajaran tidak ditemukan'
        });
      }

      // Check for duplicate class name + subject (excluding current class)
      if (name || subjectId) {
        const duplicateClass = await prisma.class.findFirst({
          where: {
            name: name || existingClass.name,
            subjectId: subjectId || existingClass.subjectId,
            NOT: { id }
          }
        });

        if (duplicateClass) {
          return res.status(400).json({
            success: false,
            message: 'Kelas dengan nama dan mata pelajaran yang sama sudah ada'
          });
        }
      }
    }

    // Update with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update class basic info
      const classData = await tx.class.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(subjectId && { subjectId }),
          ...(description !== undefined && { description }),
          ...(gradeLevel && { gradeLevel })
        }
      });

      // Update teacher assignments (only for ADMIN)
      if (user.role === 'ADMIN' && teacherIds !== undefined) {
        // Delete existing assignments
        await tx.classTeacher.deleteMany({
          where: { classId: id }
        });

        // Create new assignments
        if (teacherIds.length > 0) {
          // Validate teacher IDs
          const validTeachers = await tx.user.findMany({
            where: {
              id: { in: teacherIds },
              role: 'GURU'
            }
          });

          if (validTeachers.length !== teacherIds.length) {
            throw new Error('Beberapa guru yang dipilih tidak valid');
          }

          await tx.classTeacher.createMany({
            data: teacherIds.map(teacherId => ({
              classId: id,
              teacherId
            }))
          });
        }
      }

      return classData;
    });

    // Fetch complete updated class data
    const completeClassData = await prisma.class.findUnique({
      where: { id },
      include: {
        subject: true,
        classTeachers: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Kelas berhasil diupdate',
      data: { class: completeClassData }
    });

  } catch (error) {
    console.error('Update class error:', error);
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.message
    });
  }
};

/**
 * Delete class
 * DELETE /api/classes/:id
 */
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔧 Delete Class - ID:', id);

    // Check if class exists and count students
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        _count: {
          select: { students: true }
        }
      }
    });

    console.log('🔧 Delete Class - Existing class:', existingClass ? 'Found' : 'Not found');
    console.log('🔧 Delete Class - Students array length:', existingClass?.students?.length || 0);
    console.log('🔧 Delete Class - Students count:', existingClass?._count?.students || 0);

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Use count instead of array length for more accurate check
    const studentCount = existingClass._count.students;

    if (studentCount > 0) {
      console.log('🔧 Delete Class - Blocked: Has', studentCount, 'students');
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kelas yang masih memiliki ${studentCount} siswa`
      });
    }

    console.log('🔧 Delete Class - Proceeding with deletion');
    await prisma.class.delete({
      where: { id }
    });

    console.log('🔧 Delete Class - Successfully deleted');
    res.json({
      success: true,
      message: 'Kelas berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus kelas'
    });
  }
};

/**
 * Get students in class
 * GET /api/classes/:id/students
 */
export const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id }
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: { classId: id },
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          gender: true,
          status: true,
          createdAt: true
        },
        orderBy: { fullName: 'asc' }
      }),
      prisma.student.count({
        where: { classId: id }
      })
    ]);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data siswa'
    });
  }
};

/**
 * Add student to class
 * POST /api/classes/:id/students
 */
export const addStudentToClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id }
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan'
      });
    }

    // Update student's class
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { classId: id },
      select: {
        id: true,
        studentId: true,
        fullName: true,
        email: true
      }
    });

    res.json({
      success: true,
      message: 'Siswa berhasil ditambahkan ke kelas',
      data: { student }
    });

  } catch (error) {
    console.error('Add student to class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menambahkan siswa ke kelas'
    });
  }
};

/**
 * Remove student from class
 * DELETE /api/classes/:id/students/:studentId
 */
export const removeStudentFromClass = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Update student's class to null
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { classId: null },
      select: {
        id: true,
        studentId: true,
        fullName: true
      }
    });

    res.json({
      success: true,
      message: 'Siswa berhasil dihapus dari kelas',
      data: { student }
    });

  } catch (error) {
    console.error('Remove student from class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus siswa dari kelas'
    });
  }
};
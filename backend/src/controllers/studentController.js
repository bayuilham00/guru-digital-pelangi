// Student Controller
// Handles CRUD operations for students
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all students
 * GET /api/students
 */
export const getStudents = async (req, res) => {
  try {
    console.log('📋 Get students request:', req.query);
    
    const { page, limit = 1000, search, classId, status } = req.query;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search } }
      ];
    }
    
    if (classId) {
      where.classId = classId;
    }
    
    if (status) {
      where.status = status;
    }

    console.log('📋 Where clause:', where);

    // Only apply pagination if page is explicitly provided
    const queryOptions = {
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        studentXp: {
          select: {
            totalXp: true,
            level: true,
            levelName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    };

    if (page) {
      const skip = (page - 1) * limit;
      queryOptions.skip = parseInt(skip);
      queryOptions.take = parseInt(limit);
    } else if (limit !== '1000') {
      // Apply limit only if explicitly set and not our default
      queryOptions.take = parseInt(limit);
    }

    console.log('📋 Query options:', queryOptions);

    // Get students with conditional pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany(queryOptions),
      prisma.student.count({ where })
    ]);

    console.log('📋 Found students:', students.length);
    console.log('📋 Total count:', total);
    console.log('📋 Student names:', students.map(s => s.fullName));

    const response = {
      success: true,
      data: {
        students,
      }
    };

    // Only include pagination info if page was requested
    if (page) {
      response.data.pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data siswa'
    });
  }
};

/**
 * Get student by ID
 * GET /api/students/:id
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
            classTeachers: {
              select: {
                teacher: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        studentXp: {
          select: {
            totalXp: true,
            level: true,
            levelName: true
          }
        },
        studentBadges: {
          include: {
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Calculate student statistics
    const stats = await calculateStudentStats(student.id, student.classId);
    
    // Add stats to student data
    const studentWithStats = {
      ...student,
      stats
    };

    res.json({
      success: true,
      data: { student: studentWithStats }
    });

  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data siswa'
    });
  }
};

// Helper function to calculate student statistics
async function calculateStudentStats(studentId, classId) {
  try {
    // Get all assignments for the student's class
    const classAssignments = await prisma.assignment.findMany({
      where: { classId },
      include: {
        submissions: {
          where: { studentId },
          select: {
            status: true,
            score: true
          }
        }
      }
    });

    const totalAssignments = classAssignments.length;
    const submittedAssignments = classAssignments.filter(a => 
      a.submissions.length > 0 && 
      ['SUBMITTED', 'LATE_SUBMITTED', 'GRADED'].includes(a.submissions[0]?.status)
    );
    const completedAssignments = submittedAssignments.length;
    
    // Calculate average grade from graded assignments
    const gradedAssignments = classAssignments.filter(a => 
      a.submissions.length > 0 && 
      a.submissions[0]?.status === 'GRADED' && 
      a.submissions[0]?.score !== null
    );
    
    const averageGrade = gradedAssignments.length > 0 
      ? gradedAssignments.reduce((sum, a) => sum + (a.submissions[0]?.score || 0), 0) / gradedAssignments.length
      : 0;

    // Calculate class ranking based on average scores
    const classStudents = await prisma.student.findMany({
      where: { classId },
      include: {
        submissions: {
          where: { 
            status: 'GRADED',
            score: { not: null }
          },
          select: { score: true }
        }
      }
    });

    // Calculate average score for each student
    const studentAverages = classStudents.map(student => {
      const scores = student.submissions.map(s => s.score);
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        studentId: student.id,
        average
      };
    }).sort((a, b) => b.average - a.average);

    const classRank = studentAverages.findIndex(s => s.studentId === studentId) + 1;
    const totalClassmates = classStudents.length;

    // Calculate actual attendance percentage
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Get attendance for current academic year (July to June)
    const academicYearStart = currentMonth >= 6 ? 
      new Date(currentYear, 6, 1) : // July 1st current year
      new Date(currentYear - 1, 6, 1); // July 1st previous year
    
    const academicYearEnd = currentMonth >= 6 ?
      new Date(currentYear + 1, 5, 30) : // June 30th next year
      new Date(currentYear, 5, 30); // June 30th current year

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: academicYearStart,
          lte: academicYearEnd
        }
      }
    });

    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => 
      ['PRESENT', 'LATE'].includes(record.status) // Count PRESENT and LATE as attendance
    ).length;
    
    const attendancePercentage = totalAttendanceDays > 0 ? 
      Math.round((presentDays / totalAttendanceDays) * 100) : 
      0; // 0% if no attendance records

    return {
      averageGrade: Math.round(averageGrade * 100) / 100, // Round to 2 decimal places
      attendancePercentage,
      completedAssignments,
      totalAssignments,
      classRank: classRank > 0 ? classRank : null,
      totalClassmates
    };
  } catch (error) {
    console.error('Error calculating student stats:', error);
    return {
      averageGrade: 0,
      attendancePercentage: 0, // 0% if there's an error calculating attendance
      completedAssignments: 0,
      totalAssignments: 0,
      classRank: null,
      totalClassmates: 0
    };
  }
}

/**
 * Create new student
 * POST /api/students
 */
export const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      fullName,
      email,
      classId,
      dateOfBirth,
      gender,
      address,
      phone,
      parentName,
      parentPhone,
      asalSekolah,
      kecamatan,
      desaKelurahan,
      status = 'ACTIVE'
    } = req.body;

    // Check if student ID already exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentId }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'NISN sudah terdaftar'
      });
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        studentId,
        fullName,
        email: email || null,
        classId: classId || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        phone,
        parentName,
        parentPhone,
        asalSekolah,
        kecamatan,
        desaKelurahan,
        status
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

    // Create initial XP record
    await prisma.studentXp.create({
      data: {
        studentId: student.id,
        totalXp: 0,
        level: 1,
        levelName: 'Pemula'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Siswa berhasil dibuat',
      data: { student }
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat membuat siswa'
    });
  }
};

/**
 * Update student
 * PUT /api/students/:id
 */
export const updateStudent = async (req, res) => {
  try {
    console.log('📝 Update student request for ID:', req.params.id);
    console.log('📝 Request body:', req.body);
    
    const { id } = req.params;
    const {
      studentId,
      fullName,
      email,
      classId,
      dateOfBirth,
      gender,
      address,
      phone,
      parentName,
      parentPhone,
      asalSekolah,
      kecamatan,
      desaKelurahan,
      status
    } = req.body;

    console.log('📝 Extracted fields:', {
      studentId, fullName, email, classId, dateOfBirth, 
      gender, address, phone, parentName, parentPhone,
      asalSekolah, kecamatan, desaKelurahan, status
    });

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Check if new student ID is already taken by another student
    if (studentId !== existingStudent.studentId) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { studentId }
      });

      if (duplicateStudent) {
        return res.status(400).json({
          success: false,
          message: 'NISN sudah digunakan oleh siswa lain'
        });
      }
    }

    console.log('📝 About to update student with data:', {
      studentId,
      fullName,
      email: email || null,
      classId: classId || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      address,
      phone,
      parentName,
      parentPhone,
      asalSekolah,
      kecamatan,
      desaKelurahan,
      status
    });

    const student = await prisma.student.update({
      where: { id },
      data: {
        studentId,
        fullName,
        email: email || null,
        classId: classId || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        phone,
        parentName,
        parentPhone,
        asalSekolah,
        kecamatan,
        desaKelurahan,
        status
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

    res.json({
      success: true,
      message: 'Siswa berhasil diupdate',
      data: { student }
    });

  } catch (error) {
    console.error('❌ Update student error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error stack:', error.stack);
    
    // Return specific error messages
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'NISN sudah digunakan oleh siswa lain'
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error saat update siswa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete student
 * DELETE /api/students/:id
 */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Delete student (cascade will handle related records)
    await prisma.student.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Siswa berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus siswa'
    });
  }
};

/**
 * Get student grades
 * GET /api/students/:id/grades
 */
export const getStudentGrades = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectId, gradeType } = req.query;

    // Build where clause
    const where = { studentId: id };
    if (subjectId) where.subjectId = subjectId;
    if (gradeType) where.gradeType = gradeType;

    const grades = await prisma.grade.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: { grades }
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil nilai siswa'
    });
  }
};

/**
 * Get student attendance
 * GET /api/students/:id/attendance
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, subjectId } = req.query; // NEW: Add subjectId parameter

    console.log('🔍 Getting attendance for student:', id, 'month:', month, 'year:', year, 'subject:', subjectId);

    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed
      const endDate = new Date(year, month, 0); // Last day of the month
      dateFilter = {
        gte: startDate,
        lte: endDate
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = {
        gte: startDate,
        lte: endDate
      };
    }

    // Build where clause
    const where = { studentId: id };
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter;
    }
    
    // NEW: Add subject filtering if provided
    if (subjectId) {
      where.subjectId = subjectId;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: { // NEW: Include subject information
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Transform attendance data to match frontend expectations
    const attendanceData = attendance.map(record => ({
      date: record.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: record.status, // 'PRESENT', 'ABSENT', 'LATE', 'SICK', 'PERMISSION'
      notes: record.notes || undefined,
      subject: record.subject ? { // NEW: Include subject info if available
        id: record.subject.id,
        name: record.subject.name,
        code: record.subject.code
      } : null,
      class: record.class ? {
        id: record.class.id,
        name: record.class.name
      } : null
    }));

    // Calculate summary statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const absentDays = attendance.filter(a => a.status === 'ABSENT').length;
    const lateDays = attendance.filter(a => a.status === 'LATE').length;
    const sickDays = attendance.filter(a => a.status === 'SICK').length;
    const permissionDays = attendance.filter(a => a.status === 'PERMISSION').length;
    
    // Calculate attendance percentage (PRESENT + LATE count as attended)
    const attendedDays = presentDays + lateDays;
    const attendancePercentage = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 0;

    const summary = {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      sickDays,
      permissionDays,
      attendancePercentage
    };

    console.log('✅ Found', attendance.length, 'attendance records for student', id);
    console.log('📊 Attendance summary:', summary);

    res.json({
      success: true,
      data: { 
        attendanceData,
        summary
      },
      message: 'Berhasil mengambil data absensi'
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil presensi siswa'
    });
  }
};

/**
 * Get subjects available for student attendance
 * GET /api/students/:id/attendance/subjects
 */
export const getStudentAttendanceSubjects = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Getting attendance subjects for student:', id);

    // Get student's class to find available subjects
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            classSubjects: {
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
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // Extract subjects from class
    const subjects = student.class?.classSubjects?.map(cs => cs.subject) || [];

    // Also get subjects that have attendance records for this student (for backward compatibility)
    const attendanceSubjects = await prisma.attendance.findMany({
      where: {
        studentId: id,
        subjectId: { not: null }
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        }
      },
      distinct: ['subjectId']
    });

    // Merge and deduplicate subjects
    const allSubjects = [...subjects];
    attendanceSubjects.forEach(att => {
      if (att.subject && !subjects.find(s => s.id === att.subject.id)) {
        allSubjects.push(att.subject);
      }
    });

    console.log('✅ Found', allSubjects.length, 'subjects for student', id);

    res.json({
      success: true,
      data: allSubjects,
      message: 'Berhasil mengambil daftar mata pelajaran'
    });

  } catch (error) {
    console.error('Get student attendance subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil daftar mata pelajaran'
    });
  }
};

/**
 * Upload student profile photo
 * POST /api/students/:id/profile-photo
 */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { profilePhoto } = req.body; // Base64 or file path

    console.log('📸 Upload profile photo for student:', id);

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    // For now, we'll store the photo as a string (base64 or file path)
    // In production, you might want to save to file system or cloud storage
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { profilePhoto },
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

    res.json({
      success: true,
      data: updatedStudent,
      message: 'Foto profil berhasil diupload'
    });

  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengupload foto profil'
    });
  }
};

/**
 * Get student profile photo
 * GET /api/students/:id/profile-photo
 */
export const getProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📸 Get profile photo for student:', id);

    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        profilePhoto: true,
        fullName: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: {
        id: student.id,
        profilePhoto: student.profilePhoto || '/placeholder.svg',
        fullName: student.fullName
      }
    });

  } catch (error) {
    console.error('Get profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil foto profil'
    });
  }
};

/**
 * Update student profile photo
 * PUT /api/students/:id/profile-photo
 */
export const updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { profilePhoto } = req.body;

    console.log('📸 Update profile photo for student:', id);

    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { profilePhoto },
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

    res.json({
      success: true,
      data: updatedStudent,
      message: 'Foto profil berhasil diupdate'
    });

  } catch (error) {
    console.error('Update profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengupdate foto profil'
    });
  }
};

/**
 * Delete student profile photo
 * DELETE /api/students/:id/profile-photo
 */
export const deleteProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📸 Delete profile photo for student:', id);

    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan'
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { profilePhoto: null },
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

    res.json({
      success: true,
      data: updatedStudent,
      message: 'Foto profil berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus foto profil'
    });
  }
};

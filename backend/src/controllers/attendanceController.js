// Attendance Controller
// Handles CRUD operations for attendance
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get attendance records
 * GET /api/attendance
 */
export const getAttendance = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      classId, 
      studentId, 
      startDate, 
      endDate, 
      status,
      subjectId 
    } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (subjectId) where.subjectId = subjectId;
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get attendance with pagination
    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              fullName: true
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { student: { fullName: 'asc' } }
        ]
      }),
      prisma.attendance.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data presensi'
    });
  }
};

/**
 * Get attendance by specific date
 * GET /api/attendance/date/:date
 */
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { classId } = req.query;

    const where = {
      date: new Date(date)
    };

    if (classId) where.classId = classId;

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        }
      },
      orderBy: {
        student: { fullName: 'asc' }
      }
    });

    // Get all students in class if classId provided
    let allStudents = [];
    if (classId) {
      allStudents = await prisma.student.findMany({
        where: { 
          classId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          studentId: true,
          fullName: true
        },
        orderBy: { fullName: 'asc' }
      });
    }

    res.json({
      success: true,
      data: {
        attendance,
        allStudents,
        date: new Date(date)
      }
    });

  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data presensi'
    });
  }
};

/**
 * Create attendance record
 * POST /api/attendance
 */
export const createAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status, reason, timeIn, notes } = req.body;

    // Check if attendance already exists for this student, class, and date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_classId_date: {
          studentId,
          classId,
          date: new Date(date)
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Presensi untuk siswa ini pada tanggal tersebut sudah ada'
      });
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        date: new Date(date),
        status,
        reason: status === 'ABSENT' ? reason : null,
        timeIn,
        notes
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update student XP based on attendance
    await updateStudentXpFromAttendance(studentId, status);

    res.status(201).json({
      success: true,
      message: 'Presensi berhasil dibuat',
      data: { attendance }
    });

  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat membuat presensi'
    });
  }
};

/**
 * Bulk create attendance records
 * POST /api/attendance/bulk
 */
export const bulkCreateAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data presensi harus berupa array dan tidak boleh kosong'
      });
    }

    // Process each record
    const processedRecords = attendanceRecords.map(record => ({
      studentId: record.studentId,
      classId: record.classId,
      subjectId: record.subjectId || null, // Add subjectId
      date: new Date(record.date),
      status: record.status,
      reason: record.status === 'ABSENT' ? record.reason : null,
      timeIn: record.timeIn || null,
      notes: record.notes || null
    }));

    // Use upsert to handle duplicates with correct unique constraint
    const results = await Promise.allSettled(
      processedRecords.map(record =>
        prisma.attendance.upsert({
          where: {
            studentId_classId_date_subjectId: {
              studentId: record.studentId,
              classId: record.classId,
              date: record.date,
              subjectId: record.subjectId
            }
          },
          update: {
            status: record.status,
            reason: record.reason,
            timeIn: record.timeIn,
            notes: record.notes
          },
          create: record,
          include: {
            student: {
              select: {
                fullName: true
              }
            }
          }
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Presensi berhasil diproses: ${successful} berhasil, ${failed} gagal`,
      data: {
        successful,
        failed,
        total: attendanceRecords.length
      }
    });

  } catch (error) {
    console.error('Bulk create attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat membuat presensi bulk'
    });
  }
};

/**
 * Update attendance record
 * PUT /api/attendance/:id
 */
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, timeIn, notes } = req.body;

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: 'Data presensi tidak ditemukan'
      });
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        reason: status === 'ABSENT' ? reason : null,
        timeIn,
        notes
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Presensi berhasil diupdate',
      data: { attendance }
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat update presensi'
    });
  }
};

/**
 * Delete attendance record
 * DELETE /api/attendance/:id
 */
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: 'Data presensi tidak ditemukan'
      });
    }

    await prisma.attendance.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Presensi berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus presensi'
    });
  }
};

/**
 * Get attendance statistics
 * GET /api/attendance/stats
 */
export const getAttendanceStats = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    const where = {};
    if (classId) where.classId = classId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get attendance counts by status
    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    // Format stats
    const formattedStats = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat._count.status;
      formattedStats[stat.status.toLowerCase()] = stat._count.status;
    });

    // Calculate percentage
    const percentages = {};
    Object.keys(formattedStats).forEach(key => {
      if (key !== 'total') {
        percentages[key] = formattedStats.total > 0 
          ? Math.round((formattedStats[key] / formattedStats.total) * 100)
          : 0;
      }
    });

    res.json({
      success: true,
      data: {
        counts: formattedStats,
        percentages
      }
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil statistik presensi'
    });
  }
};

/**
 * Helper function to update student XP from attendance
 */
const updateStudentXpFromAttendance = async (studentId, status) => {
  try {
    // Get gamification settings
    const settings = await prisma.gamificationSettings.findFirst({
      where: { isActive: true }
    });

    if (!settings) return;

    let xpChange = 0;
    let streakUpdate = {};

    switch (status) {
      case 'PRESENT':
        xpChange = settings.xpAttendanceBonus;
        streakUpdate = {
          attendanceStreak: { increment: 1 },
          lastAttendance: new Date()
        };
        break;
      case 'LATE':
        xpChange = Math.floor(settings.xpAttendanceBonus / 2); // Half bonus for late
        streakUpdate = {
          attendanceStreak: { increment: 1 },
          lastAttendance: new Date()
        };
        break;
      case 'ABSENT':
        xpChange = -settings.xpAbsentPenalty;
        streakUpdate = {
          attendanceStreak: 0 // Reset streak
        };
        break;
      case 'EXCUSED':
        // No XP change for excused absence, but don't reset streak
        xpChange = 0;
        break;
    }

    // Update or create student XP
    await prisma.studentXp.upsert({
      where: { studentId },
      update: {
        totalXp: {
          increment: xpChange
        },
        ...streakUpdate
      },
      create: {
        studentId,
        totalXp: Math.max(0, xpChange), // Don't allow negative starting XP
        ...streakUpdate
      }
    });

    // Check for attendance achievements
    await checkAttendanceAchievements(studentId);

  } catch (error) {
    console.error('Error updating student XP from attendance:', error);
  }
};

/**
 * Helper function to check attendance achievements
 */
const checkAttendanceAchievements = async (studentId) => {
  try {
    const studentXp = await prisma.studentXp.findUnique({
      where: { studentId }
    });

    if (!studentXp) return;

    // Perfect Attendance Streak Achievement
    if (studentXp.attendanceStreak >= 30) {
      const existingAchievement = await prisma.studentAchievement.findFirst({
        where: {
          studentId,
          type: 'PERFECT_ATTENDANCE_30'
        }
      });

      if (!existingAchievement) {
        await prisma.studentAchievement.create({
          data: {
            studentId,
            type: 'PERFECT_ATTENDANCE_30',
            title: 'Kehadiran Sempurna!',
            description: 'Hadir berturut-turut selama 30 hari',
            xpReward: 200,
            metadata: { streak: studentXp.attendanceStreak }
          }
        });

        // Add bonus XP
        await prisma.studentXp.update({
          where: { studentId },
          data: {
            totalXp: {
              increment: 200
            }
          }
        });
      }
    }

    // Weekly Perfect Attendance
    if (studentXp.attendanceStreak >= 7 && studentXp.attendanceStreak % 7 === 0) {
      const weekCount = Math.floor(studentXp.attendanceStreak / 7);
      const achievementType = `WEEKLY_PERFECT_${weekCount}`;

      const existingAchievement = await prisma.studentAchievement.findFirst({
        where: {
          studentId,
          type: achievementType
        }
      });

      if (!existingAchievement) {
        await prisma.studentAchievement.create({
          data: {
            studentId,
            type: achievementType,
            title: `Kehadiran Mingguan ${weekCount}!`,
            description: `Hadir sempurna selama ${weekCount} minggu berturut-turut`,
            xpReward: 50 * weekCount,
            metadata: { weeks: weekCount, streak: studentXp.attendanceStreak }
          }
        });

        // Add bonus XP
        await prisma.studentXp.update({
          where: { studentId },
          data: {
            totalXp: {
              increment: 50 * weekCount
            }
          }
        });
      }
    }

  } catch (error) {
    console.error('Error checking attendance achievements:', error);
  }
};

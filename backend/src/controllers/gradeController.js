// Enhanced Grade Controller with Gamification
// Handles CRUD operations for grades and XP integration
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all grades
 * GET /api/grades
 */
export const getGrades = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      classId, 
      studentId, 
      subjectId, 
      gradeType 
    } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (gradeType) where.gradeType = gradeType;

    // Get grades with pagination
    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
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
              name: true,
              gradeLevel: true
            }
          },
          createdByUser: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.grade.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        grades,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data nilai'
    });
  }
};

/**
 * Get grade by ID
 * GET /api/grades/:id
 */
export const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
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
            name: true,
            gradeLevel: true
          }
        },
        createdByUser: {
          select: {
            fullName: true
          }
        }
      }
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Nilai tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: { grade }
    });

  } catch (error) {
    console.error('Get grade by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data nilai'
    });
  }
};

/**
 * Create new grade
 * POST /api/grades
 */
export const createGrade = async (req, res) => {
  try {
    const {
      studentId,
      subjectId,
      classId,
      gradeType,
      score,
      maxScore,
      description,
      date
    } = req.body;

    console.log('📚 Create grade request:', {
      studentId,
      subjectId,
      classId,
      gradeType,
      score,
      maxScore,
      description,
      date
    });

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      console.error('❌ Subject not found:', subjectId);
      return res.status(400).json({
        success: false,
        message: `Subject dengan ID ${subjectId} tidak ditemukan`
      });
    }

    console.log('✅ Subject found:', subject);

    // Check if grade already exists for this student, subject, type, and date
    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId,
        subjectId,
        gradeType,
        date: new Date(date)
      }
    });

    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Nilai untuk siswa ini pada jenis dan tanggal yang sama sudah ada'
      });
    }

    // Log the user info for debugging
    console.log('🔑 User info:', req.user);
    console.log('🔑 User ID:', req.user?.id);

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        classId,
        gradeType,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        description,
        date: new Date(date),
        createdBy: req.user.id
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
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

    // Calculate XP and update student XP
    try {
      await updateStudentXpFromGrade(studentId, parseFloat(score), parseFloat(maxScore));
    } catch (xpError) {
      console.error('XP update failed, but grade created successfully:', xpError);
      // Continue without failing the grade creation
    }

    res.status(201).json({
      success: true,
      message: 'Nilai berhasil dibuat',
      data: { grade }
    });

  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat membuat nilai'
    });
  }
};

/**
 * Update grade
 * PUT /api/grades/:id
 */
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId,
      subjectId,
      classId,
      gradeType,
      score,
      maxScore,
      description,
      date
    } = req.body;

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id }
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Nilai tidak ditemukan'
      });
    }

    const grade = await prisma.grade.update({
      where: { id },
      data: {
        studentId,
        subjectId,
        classId,
        gradeType,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        description,
        date: new Date(date)
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
            
          }
        },
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
      }
    });

    res.json({
      success: true,
      message: 'Nilai berhasil diupdate',
      data: { grade }
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat update nilai'
    });
  }
};

/**
 * Delete grade
 * DELETE /api/grades/:id
 */
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id }
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Nilai tidak ditemukan'
      });
    }

    await prisma.grade.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Nilai berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus nilai'
    });
  }
};

/**
 * Get grades by class
 * GET /api/grades/class/:classId
 */
export const getGradesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectId, gradeType } = req.query;

    const where = { classId };
    if (subjectId) where.subjectId = subjectId;
    if (gradeType) where.gradeType = gradeType;

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
            
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { student: { fullName: 'asc' } },
        { date: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: { grades }
    });

  } catch (error) {
    console.error('Get grades by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil nilai kelas'
    });
  }
};

/**
 * Get grades by student
 * GET /api/grades/student/:studentId
 */
export const getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, gradeType } = req.query;

    const where = { studentId };
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

    // Calculate average by subject
    const subjectAverages = {};
    grades.forEach(grade => {
      const subjectId = grade.subject.id;
      if (!subjectAverages[subjectId]) {
        subjectAverages[subjectId] = {
          subject: grade.subject,
          grades: [],
          average: 0
        };
      }
      subjectAverages[subjectId].grades.push(grade);
    });

    // Calculate averages
    Object.keys(subjectAverages).forEach(subjectId => {
      const subjectGrades = subjectAverages[subjectId].grades;
      const totalScore = subjectGrades.reduce((sum, grade) => {
        return sum + (grade.score / grade.maxScore) * 100;
      }, 0);
      subjectAverages[subjectId].average = totalScore / subjectGrades.length;
    });

    res.json({
      success: true,
      data: { 
        grades,
        subjectAverages: Object.values(subjectAverages)
      }
    });

  } catch (error) {
    console.error('Get grades by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil nilai siswa'
    });
  }
};

/**
 * Bulk create grades
 * POST /api/grades/bulk
 */
export const bulkCreateGrades = async (req, res) => {
  try {
    const { grades } = req.body;
    const createdBy = req.user.userId;

    const results = await Promise.allSettled(
      grades.map(async (gradeData) => {
        const { studentId, subjectId, classId, gradeType, score, maxScore, description, date } = gradeData;

        // Check if grade already exists
        const existingGrade = await prisma.grade.findFirst({
          where: {
            studentId,
            subjectId,
            gradeType,
            date: new Date(date)
          }
        });

        if (existingGrade) {
          throw new Error(`Nilai untuk siswa ${studentId} sudah ada`);
        }

        const grade = await prisma.grade.create({
          data: {
            studentId,
            subjectId,
            classId,
            gradeType,
            score: parseFloat(score),
            maxScore: parseFloat(maxScore),
            description,
            date: new Date(date),
            createdBy
          }
        });

        // Update XP
        await updateStudentXpFromGrade(studentId, parseFloat(score), parseFloat(maxScore));

        return grade;
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Bulk create selesai: ${successful} berhasil, ${failed} gagal`,
      data: {
        successful,
        failed,
        total: grades.length
      }
    });

  } catch (error) {
    console.error('Bulk create grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat bulk create nilai'
    });
  }
};

/**
 * Get grade statistics for a class
 * GET /api/grades/stats/class/:classId
 */
export const getClassGradeStats = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectId, gradeType } = req.query;

    const where = { classId };
    if (subjectId) where.subjectId = subjectId;
    if (gradeType) where.gradeType = gradeType;

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true
          }
        },
        subject: {
          select: {
            name: true
          }
        }
      }
    });

    if (grades.length === 0) {
      return res.json({
        success: true,
        data: {
          totalGrades: 0,
          average: 0,
          highest: 0,
          lowest: 0,
          distribution: {}
        }
      });
    }

    // Calculate statistics
    const scores = grades.map(g => (g.score / g.maxScore) * 100);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Grade distribution
    const distribution = {
      'A (90-100)': scores.filter(s => s >= 90).length,
      'B (80-89)': scores.filter(s => s >= 80 && s < 90).length,
      'C (70-79)': scores.filter(s => s >= 70 && s < 80).length,
      'D (60-69)': scores.filter(s => s >= 60 && s < 70).length,
      'E (<60)': scores.filter(s => s < 60).length
    };

    res.json({
      success: true,
      data: {
        totalGrades: grades.length,
        average: Math.round(average * 100) / 100,
        highest: Math.round(highest * 100) / 100,
        lowest: Math.round(lowest * 100) / 100,
        distribution
      }
    });

  } catch (error) {
    console.error('Get class grade stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil statistik nilai kelas'
    });
  }
};

/**
 * Helper function to update student XP from grade
 */
const updateStudentXpFromGrade = async (studentId, score, maxScore) => {
  try {
    console.log('🎮 Starting XP update for student:', studentId, 'score:', score, 'maxScore:', maxScore);
    
    // Get gamification settings
    const settings = await prisma.gamificationSettings.findFirst({
      where: { isActive: true }
    });

    console.log('🎮 Gamification settings:', settings);

    if (!settings) {
      console.log('🎮 No active gamification settings found');
      return;
    }

    // Calculate XP based on score percentage
    const percentage = (score / maxScore) * 100;
    const xpGained = Math.floor(percentage * settings.xpPerGrade);
    
    console.log('🎮 Calculated XP:', xpGained, 'from percentage:', percentage);

    // Update or create student XP
    const updatedXp = await prisma.studentXp.upsert({
      where: { studentId },
      update: {
        totalXp: {
          increment: xpGained
        },
        lastAssignment: new Date(),
        assignmentStreak: {
          increment: 1
        }
      },
      create: {
        studentId,
        totalXp: xpGained,
        lastAssignment: new Date(),
        assignmentStreak: 1
      }
    });

    console.log('🎮 Updated student XP:', updatedXp);

    // Update level based on new total XP
    await updateStudentLevel(studentId);

    // Check for achievements
    await checkGradeAchievements(studentId, score, maxScore);

  } catch (error) {
    console.error('🚨 Error updating student XP from grade:', error);
    throw error; // Re-throw to see the actual error
  }
};

/**
 * Helper function to update student level
 */
const updateStudentLevel = async (studentId) => {
  try {
    const studentXp = await prisma.studentXp.findUnique({
      where: { studentId }
    });

    if (!studentXp) return;

    const settings = await prisma.gamificationSettings.findFirst({
      where: { isActive: true }
    });

    if (!settings || !settings.levelThresholds) return;

    const thresholds = settings.levelThresholds;
    let newLevel = 1;
    let newLevelName = 'Pemula';

    // Find appropriate level based on total XP
    for (let i = 0; i < thresholds.length; i++) {
      if (studentXp.totalXp >= thresholds[i].xp) {
        newLevel = thresholds[i].level;
        newLevelName = thresholds[i].name;
      }
    }

    // Update level if changed
    if (newLevel !== studentXp.level) {
      await prisma.studentXp.update({
        where: { studentId },
        data: {
          level: newLevel,
          levelName: newLevelName
        }
      });
    }

  } catch (error) {
    console.error('Error updating student level:', error);
  }
};

/**
 * Helper function to check grade achievements
 */
const checkGradeAchievements = async (studentId, score, maxScore) => {
  try {
    const percentage = (score / maxScore) * 100;

    // Perfect Score Achievement
    if (percentage === 100) {
      const existingAchievement = await prisma.studentAchievement.findFirst({
        where: {
          studentId,
          type: 'PERFECT_SCORE'
        }
      });

      if (!existingAchievement) {
        await prisma.studentAchievement.create({
          data: {
            studentId,
            type: 'PERFECT_SCORE',
            title: 'Nilai Sempurna!',
            description: 'Mendapat nilai 100 untuk pertama kali',
            xpReward: 50,
            metadata: { score, maxScore }
          }
        });

        // Add bonus XP
        await prisma.studentXp.update({
          where: { studentId },
          data: {
            totalXp: {
              increment: 50
            }
          }
        });
      }
    }

    // High Achiever (90+ score)
    if (percentage >= 90) {
      const recentHighScores = await prisma.grade.count({
        where: {
          studentId,
          score: {
            gte: 90
          },
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      if (recentHighScores >= 5) {
        const existingAchievement = await prisma.studentAchievement.findFirst({
          where: {
            studentId,
            type: 'HIGH_ACHIEVER'
          }
        });

        if (!existingAchievement) {
          await prisma.studentAchievement.create({
            data: {
              studentId,
              type: 'HIGH_ACHIEVER',
              title: 'Prestasi Tinggi!',
              description: 'Mendapat nilai 90+ sebanyak 5 kali dalam 30 hari',
              xpReward: 100,
              metadata: { count: recentHighScores }
            }
          });

          // Add bonus XP
          await prisma.studentXp.update({
            where: { studentId },
            data: {
              totalXp: {
                increment: 100
              }
            }
          });
        }
      }
    }

  } catch (error) {
    console.error('Error checking grade achievements:', error);
  }
};

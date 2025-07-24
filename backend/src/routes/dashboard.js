// Dashboard Routes - Guru Digital Pelangi
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'ADMIN') {
      // Admin sees all data
      const [totalClasses, totalStudents, totalAssignments, averageGrade] = await Promise.all([
        prisma.class.count(),
        prisma.student.count({ where: { status: 'ACTIVE' } }),
        prisma.assignment.count({ where: { status: 'PUBLISHED' } }),
        prisma.grade.aggregate({
          _avg: { score: true }
        })
      ]);

      stats = {
        totalClasses,
        totalStudents,
        activeAssignments: totalAssignments,
        averageGrade: averageGrade._avg.score ? Math.round(averageGrade._avg.score * 10) / 10 : 0
      };
    } else {
      // Guru only sees their own data
      const teacherClasses = await prisma.classTeacher.findMany({
        where: { teacherId: userId },
        include: { class: true }
      });

      const classIds = teacherClasses.map(ct => ct.classId);

      const [totalStudents, totalAssignments, averageGrade] = await Promise.all([
        prisma.student.count({
          where: {
            classId: { in: classIds },
            status: 'ACTIVE'
          }
        }),
        prisma.assignment.count({
          where: {
            teacherId: userId,
            status: 'PUBLISHED'
          }
        }),
        prisma.grade.aggregate({
          where: {
            createdBy: userId
          },
          _avg: { score: true }
        })
      ]);

      stats = {
        totalClasses: teacherClasses.length,
        totalStudents,
        activeAssignments: totalAssignments,
        averageGrade: averageGrade._avg.score ? Math.round(averageGrade._avg.score * 10) / 10 : 0
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil statistik dashboard'
    });
  }
});

// GET /api/dashboard/recent-classes - Get recent classes with multi-subject support
router.get('/recent-classes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let classes = [];

    if (userRole === 'ADMIN') {
      // Admin sees all classes with composite data
      classes = await prisma.class.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true, // Main subject if any
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
          },
          _count: {
            select: { students: true }
          }
        }
      });

      // Get additional subjects for each class using a separate query
      for (let classItem of classes) {
        // Find all class-teacher pairs for this class to get all subjects
        const allClassTeachers = await prisma.classTeacher.findMany({
          where: { classId: classItem.id },
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        });

        // Get unique subjects from all subjects taught in this class
        const subjectIds = new Set();
        if (classItem.subjectId) subjectIds.add(classItem.subjectId);
        
        const allSubjects = await prisma.subject.findMany({
          where: {
            classes: {
              some: { id: classItem.id }
            }
          }
        });

        // Add multi-subject data to class
        classItem.allSubjects = allSubjects;
        classItem.allTeachers = allClassTeachers.map(ct => ct.teacher);
        classItem.subjectCount = allSubjects.length;
        classItem.teacherCount = allClassTeachers.length;
      }

    } else {
      // Guru only sees classes they teach
      const teacherClasses = await prisma.classTeacher.findMany({
        where: { teacherId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          class: {
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
              },
              _count: {
                select: { students: true }
              }
            }
          }
        }
      });

      classes = teacherClasses.map(tc => {
        const classItem = tc.class;
        
        // For teachers, show only the subjects they teach in this class
        classItem.allSubjects = classItem.subject ? [classItem.subject] : [];
        classItem.allTeachers = classItem.classTeachers
          .filter(ct => ct.teacherId === userId)
          .map(ct => ct.teacher);
        classItem.subjectCount = classItem.allSubjects.length;
        classItem.teacherCount = 1; // Teacher only sees themselves
        
        return classItem;
      });
    }

    res.json({
      success: true,
      data: classes
    });

  } catch (error) {
    console.error('Error fetching recent classes:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data kelas terbaru'
    });
  }
});

// GET /api/dashboard/recent-activities - Get recent activities
router.get('/recent-activities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let activities = [];

    if (userRole === 'ADMIN') {
      // Admin sees all activities
      activities = await prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });
    } else {
      // Guru sees activities related to their classes/students
      activities = await prisma.activity.findMany({
        where: {
          OR: [
            { userId: userId },
            { type: 'GRADE' }, // Show grade activities
            { type: 'XP' }     // Show XP activities
          ]
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });
    }

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil aktivitas terbaru'
    });
  }
});

export default router;

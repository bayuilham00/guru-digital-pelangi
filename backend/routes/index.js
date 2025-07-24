/**
 * Express Router Configuration for Multi-Subject API Routes
 */

import express from 'express';
import { authenticateToken } from '../src/middleware/auth.js';
import { requireAdmin, checkTeacherAccess } from '../src/middleware/permissions.js';
import {
  addSubjectToClass,
  removeSubjectFromClass,
  assignTeacherToSubject,
  getTeacherClasses,
  getClassSubjectStudents,
  getFullClassData
} from '../src/routes/multiSubjectRoutes.js';

const router = express.Router();

// =============================================================================
// ADMIN-ONLY ROUTES
// =============================================================================

// Class-Subject Management
router.post('/admin/classes/:classId/subjects', 
  authenticateToken, 
  requireAdmin, 
  addSubjectToClass
);

router.delete('/admin/classes/:classId/subjects/:subjectId', 
  authenticateToken, 
  requireAdmin, 
  removeSubjectFromClass
);

// Teacher Assignment
router.post('/admin/classes/:classId/subjects/:subjectId/teachers', 
  authenticateToken, 
  requireAdmin, 
  assignTeacherToSubject
);

// Full Class Data (Admin only)
router.get('/admin/classes/:classId/full', 
  authenticateToken, 
  requireAdmin, 
  getFullClassData
);

// =============================================================================
// TEACHER & ADMIN ROUTES (with permission checks)
// =============================================================================

// Get Teacher's Classes (filtered by subjects they teach)
router.get('/teachers/:teacherId/classes', 
  authenticateToken, 
  getTeacherClasses
);

// Get Students in Class-Subject (with teacher access check)
router.get('/classes/:classId/subjects/:subjectId/students', 
  authenticateToken, 
  checkTeacherAccess, 
  getClassSubjectStudents
);

// =============================================================================
// ENHANCED CLASS ROUTES (with dynamic student count)
// =============================================================================

// Get Classes with Dynamic Student Count
router.get('/classes/dynamic', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const classes = await prisma.class.findMany({
      include: {
        classSubjects: {
          where: { isActive: true },
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            _count: {
              select: {
                studentSubjectEnrollments: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            students: true // This is the actual enrolled students count
          }
        }
      }
    });

    // Calculate dynamic student count from StudentSubjectEnrollment
    const classesWithDynamicCount = await Promise.all(
      classes.map(async (cls) => {
        // Get unique students enrolled in any subject of this class
        const enrollments = await prisma.studentSubjectEnrollment.findMany({
          where: {
            classId: cls.id,
            isActive: true
          },
          select: {
            studentId: true
          },
          distinct: ['studentId']
        });

        const dynamicStudentCount = enrollments.length;

        return {
          id: cls.id,
          name: cls.name,
          description: cls.description,
          gradeLevel: cls.gradeLevel,
          isPhysicalClass: cls.isPhysicalClass,
          studentCount: dynamicStudentCount, // Dynamic count
          staticStudentCount: cls._count.students, // Static count for comparison
          subjects: cls.classSubjects.map(cs => ({
            id: cs.subject.id,
            name: cs.subject.name,
            code: cs.subject.code,
            enrolledStudents: cs._count.studentSubjectEnrollments
          })),
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt
        };
      })
    );

    await prisma.$disconnect();

    res.json({
      message: 'Classes with dynamic student count retrieved successfully',
      data: classesWithDynamicCount,
      totalClasses: classesWithDynamicCount.length
    });

  } catch (error) {
    console.error('Error getting classes with dynamic count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

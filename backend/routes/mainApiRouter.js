/**
 * Main API Router Configuration
 * Combines all routes with proper authentication and permission middleware
 */

import express from 'express';

// Import middleware
import { authenticateToken } from '../src/middleware/auth.js';
import { requireAdmin, requireAdminOrTeacher, checkTeacherAccess } from '../src/middleware/permissions.js';

// Import route handlers
import * as multiSubjectRoutes from '../src/routes/multiSubjectRoutes.js';
import * as approvalRoutes from './approvalRoutes.js';
import * as assignmentRoutes from './assignmentRoutes.js';
import * as gradeRoutes from './gradeRoutes.js';

const router = express.Router();

// =============================================================================
// MULTI-SUBJECT CLASS MANAGEMENT ROUTES
// =============================================================================

// Admin-only class-subject management
router.post('/admin/classes/:classId/subjects', 
  authenticateToken, 
  requireAdmin, 
  multiSubjectRoutes.addSubjectToClass
);

router.delete('/admin/classes/:classId/subjects/:subjectId', 
  authenticateToken, 
  requireAdmin, 
  multiSubjectRoutes.removeSubjectFromClass
);

router.post('/admin/classes/:classId/subjects/:subjectId/teachers', 
  authenticateToken, 
  requireAdmin, 
  multiSubjectRoutes.assignTeacherToSubject
);

router.get('/admin/classes/:classId/full', 
  authenticateToken, 
  requireAdmin, 
  multiSubjectRoutes.getFullClassData
);

// Teacher and admin routes
router.get('/teachers/:teacherId/classes', 
  authenticateToken, 
  multiSubjectRoutes.getTeacherClasses
);

router.get('/classes/:classId/subjects/:subjectId/students', 
  authenticateToken, 
  checkTeacherAccess, 
  multiSubjectRoutes.getClassSubjectStudents
);

router.get('/classes/dynamic', 
  authenticateToken, 
  async (req, res) => {
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
              }
            }
          },
          _count: {
            select: {
              students: true
            }
          }
        }
      });

      const classesWithDynamicCount = await Promise.all(
        classes.map(async (cls) => {
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
            studentCount: dynamicStudentCount,
            staticStudentCount: cls._count.students,
            subjects: cls.classSubjects.map(cs => ({
              id: cs.subject.id,
              name: cs.subject.name,
              code: cs.subject.code
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
  }
);

// =============================================================================
// APPROVAL SYSTEM ROUTES
// =============================================================================

// Student enrollment/transfer approval
router.post('/enrollments/request', 
  authenticateToken, 
  approvalRoutes.requestStudentEnrollment
);

router.put('/admin/approvals/:approvalId/process', 
  authenticateToken, 
  requireAdmin, 
  approvalRoutes.processEnrollmentApproval
);

router.get('/admin/approvals/pending', 
  authenticateToken, 
  requireAdmin, 
  approvalRoutes.getPendingApprovals
);

router.get('/students/:studentId/approvals', 
  authenticateToken, 
  approvalRoutes.getStudentApprovalHistory
);

router.post('/admin/approvals/bulk-approve', 
  authenticateToken, 
  requireAdmin, 
  approvalRoutes.bulkApproveEnrollments
);

// =============================================================================
// ASSIGNMENT MANAGEMENT ROUTES
// =============================================================================

// Assignment statistics endpoint (must be before general /assignments route)
router.get('/assignments/stats', authenticateToken, requireAdminOrTeacher, assignmentRoutes.getAssignmentStats);

// Get assignments for current teacher (simplified endpoint)
router.get('/assignments', 
  authenticateToken, 
  assignmentRoutes.getCurrentUserAssignments
);

// Create assignment for specific class-subject
router.post('/classes/:classId/subjects/:subjectId/assignments', 
  authenticateToken, 
  checkTeacherAccess, 
  assignmentRoutes.createAssignment
);

// Get teacher's assignments
router.get('/teachers/:teacherId/assignments', 
  authenticateToken, 
  assignmentRoutes.getTeacherAssignments
);

// Get assignments for class-subject
router.get('/classes/:classId/subjects/:subjectId/assignments', 
  authenticateToken, 
  checkTeacherAccess, 
  assignmentRoutes.getClassSubjectAssignments
);

// Get single assignment by ID
router.get('/assignments/:assignmentId', 
  authenticateToken, 
  assignmentRoutes.getAssignmentById
);

// Update/delete assignment
router.put('/assignments/:assignmentId', 
  authenticateToken, 
  assignmentRoutes.updateAssignment
);

router.delete('/assignments/:assignmentId', 
  authenticateToken, 
  assignmentRoutes.deleteAssignment
);

// Assignment submissions
router.get('/assignments/:assignmentId/submissions', 
  authenticateToken, 
  assignmentRoutes.getAssignmentSubmissions
);

router.put('/submissions/:submissionId/grade', 
  authenticateToken, 
  assignmentRoutes.gradeSubmission
);

// Bulk grade submissions
router.put('/assignments/:assignmentId/bulk-grade', 
  authenticateToken, 
  assignmentRoutes.bulkGradeSubmissions
);

// =============================================================================
// GRADE MANAGEMENT ROUTES
// =============================================================================

// Get grades for class-subject
router.get('/classes/:classId/subjects/:subjectId/grades', 
  authenticateToken, 
  checkTeacherAccess, 
  gradeRoutes.getClassSubjectGrades
);

// Add/update grade for student
router.post('/classes/:classId/subjects/:subjectId/students/:studentId/grade', 
  authenticateToken, 
  checkTeacherAccess, 
  gradeRoutes.addOrUpdateGrade
);

// Get student's grades across all subjects
router.get('/students/:studentId/grades', 
  authenticateToken, 
  gradeRoutes.getStudentGrades
);

// Generate grade report
router.get('/classes/:classId/subjects/:subjectId/grade-report', 
  authenticateToken, 
  checkTeacherAccess, 
  gradeRoutes.generateGradeReport
);

// =============================================================================
// ADMIN DASHBOARD ROUTES
// =============================================================================

router.get('/admin/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const [
      totalClasses,
      totalSubjects,
      totalStudents,
      totalTeachers,
      totalAssignments,
      pendingApprovals,
      activeEnrollments
    ] = await Promise.all([
      prisma.class.count(),
      prisma.subject.count(),
      prisma.student.count(),
      prisma.user.count({ where: { role: 'GURU' } }),
      prisma.assignment.count({ where: { isActive: true } }),
      prisma.enrollmentApproval.count({ where: { status: 'PENDING' } }),
      prisma.studentSubjectEnrollment.count({ where: { isActive: true } })
    ]);

    // Recent activity
    const recentAssignments = await prisma.assignment.findMany({
      where: { isActive: true },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentApprovals = await prisma.enrollmentApproval.findMany({
      where: { status: 'PENDING' },
      include: {
        student: { select: { fullName: true } },
        class: { select: { name: true } },
        subject: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    await prisma.$disconnect();

    res.json({
      message: 'Admin dashboard stats retrieved successfully',
      data: {
        overview: {
          totalClasses,
          totalSubjects,
          totalStudents,
          totalTeachers,
          totalAssignments,
          pendingApprovals,
          activeEnrollments
        },
        recentActivity: {
          assignments: recentAssignments,
          approvals: recentApprovals
        }
      }
    });

  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// HEALTH CHECK ROUTE
// =============================================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Multi-Subject API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      multiSubject: 'Classes, subjects, teacher assignments',
      approvals: 'Student enrollment approvals',
      assignments: 'Assignment management',
      grades: 'Grade management',
      admin: 'Admin dashboard'
    }
  });
});

export default router;

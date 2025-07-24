/**
 * Enhanced Class Management API Routes
 * Supports multi-subject classes with role-based permissions
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import PermissionService from '../services/permissionService.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';
import { validateClass } from '../middleware/validation.js';
import { checkClassAccess, getFullClassData } from './multiSubjectRoutes.js';
import {
  updateClass,
  deleteClass,
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass
} from '../controllers/classController.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get all classes (filtered by user permissions)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user; // Consistent with middleware auth structure

    const accessibleContent = await PermissionService.getAccessibleContent(userId, userRole);
    
    res.json({
      success: true,
      data: accessibleContent.classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    });
  }
});

/**
 * Create new class (Admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can create classes'
      });
    }

    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    // Check for duplicate names
    const existingClass = await prisma.class.findFirst({
      where: {
        name: name.trim(),
        isPhysicalClass: true
      }
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        error: `Class with name "${name}" already exists`
      });
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        isPhysicalClass: true,
        studentCount: 0
      }
    });

    res.json({
      success: true,
      data: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create class'
    });
  }
});

/**
 * Get complete class data (enhanced endpoint for ClassDetailPage)
 * Uses proper authentication and authorization middleware
 */
router.get('/:classId/full', authenticateToken, checkClassAccess, getFullClassData);

/**
 * Get class details with subjects and permissions
 */
router.get('/:classId', async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { classId } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classSubjects: {
          include: {
            subject: true,
            classTeacherSubjects: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              },
              where: {
                isActive: true
              }
            }
          },
          where: {
            isActive: true
          }
        },
        students: {
          include: {
            studentSubjectEnrollments: {
              where: {
                classId: classId,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Filter subjects based on user permissions
    let accessibleSubjects = classData.classSubjects;
    
    if (userRole === 'TEACHER') {
      // Filter to only subjects this teacher can access
      accessibleSubjects = classData.classSubjects.filter(cs => {
        return cs.classTeacherSubjects.some(cts => cts.teacherId === userId);
      });
    }

    const responseData = {
      id: classData.id,
      name: classData.name,
      isPhysicalClass: classData.isPhysicalClass,
      studentCount: classData.students.length,
      subjects: accessibleSubjects.map(cs => ({
        id: cs.subject.id,
        name: cs.subject.name,
        code: cs.subject.code,
        teachers: cs.classTeacherSubjects.map(cts => cts.teacher),
        canAccess: userRole === 'ADMIN' || cs.classTeacherSubjects.some(cts => cts.teacherId === userId)
      })),
      students: classData.students.map(student => ({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        enrolledSubjects: student.studentSubjectEnrollments.map(enrollment => enrollment.subjectId)
      }))
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class details'
    });
  }
});

/**
 * Add subject to class (Admin only)
 */
router.post('/:classId/subjects', authenticateToken, async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { classId } = req.params;
    const { subjectId, teacherId } = req.body;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can add subjects to classes'
      });
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if subject already exists in class
    const existingClassSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId
        }
      }
    });

    if (existingClassSubject) {
      return res.status(409).json({
        success: false,
        error: 'Subject already exists in this class'
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create ClassSubject
      const classSubject = await tx.classSubject.create({
        data: {
          classId,
          subjectId,
          isActive: true
        }
      });

      // Assign teacher if provided
      if (teacherId) {
        await tx.classTeacherSubject.create({
          data: {
            classId,
            teacherId,
            subjectId,
            isActive: true
          }
        });
      }

      // Auto-enroll all students in the class to this new subject
      const students = await tx.student.findMany({
        where: { classId }
      });

      if (students.length > 0) {
        const enrollments = students.map(student => ({
          studentId: student.id,
          classId,
          subjectId,
          isActive: true
        }));

        await tx.studentSubjectEnrollment.createMany({
          data: enrollments
        });
      }

      return { classSubject, enrolledStudents: students.length };
    });

    res.json({
      success: true,
      data: result,
      message: `Subject added successfully. ${result.enrolledStudents} students auto-enrolled.`
    });
  } catch (error) {
    console.error('Error adding subject to class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add subject to class'
    });
  }
});

/**
 * Assign teacher to subject in class (Admin only)
 */
router.post('/:classId/subjects/:subjectId/teachers', authenticateToken, async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { classId, subjectId } = req.params;
    const { teacherId } = req.body;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can assign teachers'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.classTeacherSubject.findUnique({
      where: {
        classId_teacherId_subjectId: {
          classId,
          teacherId,
          subjectId
        }
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: 'Teacher is already assigned to this subject in this class'
      });
    }

    const assignment = await prisma.classTeacherSubject.create({
      data: {
        classId,
        teacherId,
        subjectId,
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
      data: assignment
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign teacher'
    });
  }
});

/**
 * Get user permissions for class management
 */
router.get('/permissions/check', async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    
    const permissions = await PermissionService.getUserPermissions(userId, userRole);
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check permissions'
    });
  }
});

/**
 * Get students in a specific class
 */
router.get('/:classId/students', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    // Transform classId to id for controller compatibility
    req.params.id = classId;
    await getClassStudents(req, res);
  } catch (error) {
    console.error('Error getting class students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get class students'
    });
  }
});

/**
 * Update class information
 */
router.put('/:classId', authenticateToken, adminAndGuru, validateClass, async (req, res) => {
  try {
    const { classId } = req.params;
    // Transform classId to id for controller compatibility
    req.params.id = classId;
    await updateClass(req, res);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update class'
    });
  }
});

/**
 * Delete class
 */
router.delete('/:classId', authenticateToken, adminAndGuru, async (req, res) => {
  try {
    const { classId } = req.params;
    // Transform classId to id for controller compatibility
    req.params.id = classId;
    await deleteClass(req, res);
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete class'
    });
  }
});

/**
 * Add student to class
 */
router.post('/:classId/students', authenticateToken, adminAndGuru, async (req, res) => {
  try {
    const { classId } = req.params;
    // Transform classId to id for controller compatibility
    req.params.id = classId;
    await addStudentToClass(req, res);
  } catch (error) {
    console.error('Error adding student to class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add student to class'
    });
  }
});

/**
 * Remove student from class
 */
router.delete('/:classId/students/:studentId', authenticateToken, adminAndGuru, async (req, res) => {
  try {
    const { classId } = req.params;
    // Transform classId to id for controller compatibility
    req.params.id = classId;
    await removeStudentFromClass(req, res);
  } catch (error) {
    console.error('Error removing student from class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove student from class'
    });
  }
});

export default router;

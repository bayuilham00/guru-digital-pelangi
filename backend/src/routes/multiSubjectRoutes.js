/**
 * Multi-Subject Class Management API Routes
 * Handles permission-based operations for teachers and admins
 */

import { PrismaClient } from '@prisma/client';
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkTeacherAccess } from '../middleware/permissions.js';

const prisma = new PrismaClient();

// Middleware: Check if user has access to class (for general class operations)
export const checkClassAccess = async (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    return next(); // Admins have full access
  }

  if (req.user.role !== 'TEACHER') {
    return res.status(403).json({ error: 'Teacher or Admin access required' });
  }

  const { classId } = req.params;
  const teacherId = req.user.id;

  try {
    // Check if teacher has access to any subject in this class
    const hasAccess = await prisma.classTeacherSubject.findFirst({
      where: {
        classId,
        teacherId,
        isActive: true
      }
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this class' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking permissions' });
  }
};

// =============================================================================
// ADMIN-ONLY ROUTES
// =============================================================================

// POST /api/admin/classes/:classId/subjects
// Add subject to existing class (UPDATED for new multi-subject schema)
export const addSubjectToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectId } = req.body;

    console.log('🔧 addSubjectToClass called with:', { classId, subjectId });

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subjectExists) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Check if this class-subject relationship already exists
    const existingClassSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId
        }
      }
    });

    if (existingClassSubject) {
      return res.status(400).json({ error: 'Subject is already assigned to this class' });
    }

    // Create new ClassSubject relationship
    const classSubject = await prisma.classSubject.create({
      data: {
        classId,
        subjectId,
        isActive: true
      },
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
      }
    });

    // Also create StudentSubjectEnrollment for all students currently in the class
    const studentsInClass = await prisma.student.findMany({
      where: { 
        classId: classId,
        status: 'ACTIVE'
      },
      select: { id: true }
    });

    if (studentsInClass.length > 0) {
      const enrollmentData = studentsInClass.map(student => ({
        studentId: student.id,
        classId: classId,
        subjectId: subjectId,
        isActive: true
      }));

      await prisma.studentSubjectEnrollment.createMany({
        data: enrollmentData,
        skipDuplicates: true
      });

      console.log(`🔧 Created ${enrollmentData.length} student enrollments for new subject`);
    }

    console.log('🔧 ClassSubject created successfully:', classSubject);

    res.status(200).json({
      message: 'Subject assigned to class successfully',
      data: {
        id: classSubject.id,
        classId: classSubject.classId,
        className: classSubject.class.name,
        subject: classSubject.subject,
        studentsEnrolled: studentsInClass.length
      }
    });

  } catch (error) {
    console.error('🚨 Error adding subject to class:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

// DELETE /api/admin/classes/:classId/subjects/:subjectId
// Remove subject from class
export const removeSubjectFromClass = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;

    // Check if ClassSubject exists
    const classSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId
        }
      }
    });

    if (!classSubject) {
      return res.status(404).json({ error: 'Subject not found in this class' });
    }

    // Remove all student enrollments for this class-subject
    await prisma.studentSubjectEnrollment.deleteMany({
      where: {
        classId,
        subjectId
      }
    });

    // Remove all teacher assignments for this class-subject
    await prisma.classTeacherSubject.deleteMany({
      where: {
        classId,
        subjectId
      }
    });

    // Remove ClassSubject
    await prisma.classSubject.delete({
      where: {
        classId_subjectId: {
          classId,
          subjectId
        }
      }
    });

    res.json({
      message: 'Subject removed from class successfully',
      classId,
      subjectId
    });

  } catch (error) {
    console.error('Error removing subject from class:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/classes/:classId/subjects/:subjectId/teachers
// Assign teacher to class-subject (UPDATED for new schema)
export const assignTeacherToSubject = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    const { teacherId } = req.body;

    console.log('🔧 assignTeacherToSubject called with:', { classId, subjectId, teacherId });
    console.log('🔧 User from token:', req.user);
    console.log('🔧 Request URL:', req.originalUrl);
    console.log('🔧 Request params:', req.params);
    console.log('🔧 Request body:', req.body);

    // Check if ClassSubject exists
    const classSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId
        }
      }
    });

    console.log('🔧 ClassSubject found:', classSubject ? 'Yes' : 'No');

    if (!classSubject) {
      return res.status(404).json({ error: 'Class-subject relationship not found' });
    }

    // Check if teacher exists and is a teacher/admin
    const teacher = await prisma.user.findUnique({
      where: { 
        id: teacherId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true
      }
    });

    console.log('🔧 Teacher found:', teacher ? 'Yes' : 'No');
    console.log('🔧 Teacher data:', teacher);

    if (!teacher || teacher.status !== 'ACTIVE' || !['TEACHER', 'GURU', 'ADMIN'].includes(teacher.role)) {
      console.log('🔧 Teacher validation failed:', {
        found: !!teacher,
        status: teacher?.status,
        role: teacher?.role,
        isValidRole: teacher ? ['TEACHER', 'GURU', 'ADMIN'].includes(teacher.role) : false
      });
      return res.status(404).json({ error: 'Teacher not found or not authorized' });
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
      if (existingAssignment.isActive) {
        return res.status(400).json({ error: 'Teacher is already assigned to this class-subject' });
      } else {
        // Reactivate existing assignment
        const reactivatedAssignment = await prisma.classTeacherSubject.update({
          where: { id: existingAssignment.id },
          data: { isActive: true },
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

        return res.status(200).json({
          message: 'Teacher assignment reactivated successfully',
          data: reactivatedAssignment
        });
      }
    }

    // Create new assignment
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

    console.log('🔧 Teacher assigned successfully:', assignment);

    res.status(200).json({
      message: 'Teacher assigned to class-subject successfully',
      data: assignment
    });

  } catch (error) {
    console.error('🚨 Error assigning teacher to subject:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

// =============================================================================
// TEACHER & ADMIN ROUTES
// =============================================================================

// GET /api/teachers/:teacherId/classes
// Get classes assigned to teacher (filtered by subjects they teach)
export const getTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if requesting user is the teacher or admin
    if (req.user.role !== 'ADMIN' && req.user.id !== teacherId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const teacherAssignments = await prisma.classTeacherSubject.findMany({
      where: {
        teacherId,
        isActive: true
      },
      include: {
        class: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
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
    });

    // Group by class and aggregate subjects
    const classesMap = new Map();

    teacherAssignments.forEach(assignment => {
      const classId = assignment.class.id;
      
      if (!classesMap.has(classId)) {
        classesMap.set(classId, {
          id: assignment.class.id,
          name: assignment.class.name,
          gradeLevel: assignment.class.gradeLevel,
          studentCount: assignment.class._count.students,
          subjects: []
        });
      }

      classesMap.get(classId).subjects.push({
        id: assignment.subject.id,
        name: assignment.subject.name,
        code: assignment.subject.code
      });
    });

    const classes = Array.from(classesMap.values());

    res.json({
      message: 'Teacher classes retrieved successfully',
      data: classes,
      totalClasses: classes.length
    });

  } catch (error) {
    console.error('Error getting teacher classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/classes/:classId/subjects/:subjectId/students
// Get students enrolled in specific class-subject (with permission check)
export const getClassSubjectStudents = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;

    const students = await prisma.studentSubjectEnrollment.findMany({
      where: {
        classId,
        subjectId,
        isActive: true
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            nisn: true
          }
        }
      }
    });

    const studentList = students.map(enrollment => ({
      ...enrollment.student,
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.createdAt
    }));

    res.json({
      message: 'Students retrieved successfully',
      data: studentList,
      totalStudents: studentList.length
    });

  } catch (error) {
    console.error('Error getting class-subject students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================================================
// ADMIN-ONLY: FULL CLASS DATA
// =============================================================================

// GET /api/admin/classes/:classId/full
// Get complete class data with all subjects, teachers, and students (UPDATED for new schema)
export const getFullClassData = async (req, res) => {
  try {
    const { classId } = req.params;
    console.log('🔍 getFullClassData called with classId:', classId);
    console.log('🔍 User from token:', req.user);

    // Query using NEW multi-subject schema
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        // NEW: Get subjects via ClassSubject junction table
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
        // NEW: Get teacher assignments via ClassTeacherSubject
        classTeacherSubjects: {
          where: { isActive: true },
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true
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
        // Keep backward compatibility with old ClassTeacher
        classTeachers: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true
              }
            }
          }
        },
        // Keep backward compatibility with single subject
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        },
        students: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            profilePhoto: true,
            status: true
          }
        },
        _count: {
          select: {
            students: true,
            classSubjects: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    console.log('🔍 Found classData:', classData ? 'Yes' : 'No');

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // NEW: Build subjects array from new schema
    let subjects = [];

    if (classData.classSubjects && classData.classSubjects.length > 0) {
      // Use new multi-subject data
      subjects = classData.classSubjects.map(cs => {
        // Find teachers for this specific subject
        const subjectTeachers = classData.classTeacherSubjects
          .filter(cts => cts.subjectId === cs.subjectId)
          .map(cts => cts.teacher);

        return {
          id: cs.subjectId,
          name: cs.subject.name,
          code: cs.subject.code,
          description: cs.subject.description,
          teachers: subjectTeachers,
          isActive: cs.isActive,
          classSubjectId: cs.id
        };
      });
    } else if (classData.subject) {
      // Fallback: Use old single-subject data for backward compatibility
      const legacyTeachers = classData.classTeachers?.map(ct => ct.teacher) || [];
      subjects = [{
        id: classData.subject.id,
        name: classData.subject.name,
        code: classData.subject.code,
        description: classData.subject.description,
        teachers: legacyTeachers,
        isActive: true,
        isLegacy: true
      }];
    }

    console.log('🔍 Subjects found:', subjects.length);
    console.log('🔍 Multi-subject relationships:', classData.classSubjects?.length || 0);
    console.log('🔍 Teacher assignments:', classData.classTeacherSubjects?.length || 0);

    // Build enhanced response
    const response = {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.gradeLevel,
      academicYear: classData.academicYear,
      description: classData.description,
      isPhysicalClass: classData.isPhysicalClass,
      studentCount: classData._count.students,
      subjectCount: classData._count.classSubjects,
      students: classData.students,
      subjects: subjects,
      totalTeachers: classData.classTeacherSubjects?.length || classData.classTeachers?.length || 0,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
      // Migration status info
      hasMultiSubjectData: classData.classSubjects && classData.classSubjects.length > 0,
      hasLegacyData: !!classData.subject
    };

    res.json({
      message: 'Full class data retrieved successfully',
      data: response,
      meta: {
        totalSubjects: subjects.length,
        totalStudents: classData.students.length,
        totalTeachers: response.totalTeachers,
        schemaVersion: 'multi-subject-v2'
      }
    });

  } catch (error) {
    console.error('🚨 Error getting full class data:', error);
    console.error('🚨 Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// =============================================================================
// ROUTER SETUP
// =============================================================================

const router = express.Router();

// Admin-only routes (require authentication + admin role)
router.post('/:classId/subjects', authenticateToken, addSubjectToClass);
router.delete('/:classId/subjects/:subjectId', authenticateToken, removeSubjectFromClass);
router.post('/:classId/subjects/:subjectId/teachers', authenticateToken, assignTeacherToSubject);
router.get('/:classId/full', authenticateToken, getFullClassData);

// Teacher & Admin routes (require authentication + permission check)
router.get('/teachers/:teacherId/classes', authenticateToken, getTeacherClasses);
router.get('/:classId/subjects/:subjectId/students', authenticateToken, checkTeacherAccess, getClassSubjectStudents);

export default router;

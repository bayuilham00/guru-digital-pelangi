/**
 * Permission Management Service
 * Handles role-based access control for multi-subject class management
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @typedef {Object} UserPermissions
 * @property {boolean} canViewAllSubjects
 * @property {boolean} canCreateAssignments
 * @property {boolean} canGradeAssignments
 * @property {boolean} canManageAttendance
 * @property {boolean} canAssignSubjects
 * @property {boolean} canTransferStudents
 * @property {string[]} allowedSubjects - Empty array means all subjects
 * @property {string[]} allowedClasses - Empty array means all classes
 */

export class PermissionService {
  /**
   * Get user permissions based on role and assignments
   * @param {string} userId 
   * @param {'ADMIN' | 'GURU'} userRole 
   * @returns {Promise<UserPermissions>}
   */
  static async getUserPermissions(userId, userRole) {
    if (userRole === 'ADMIN') {
      return {
        canViewAllSubjects: true,
        canCreateAssignments: true,
        canGradeAssignments: true,
        canManageAttendance: true,
        canAssignSubjects: true,
        canTransferStudents: true,
        allowedSubjects: [], // Empty = all subjects
        allowedClasses: [] // Empty = all classes
      };
    }

    // For TEACHER role - get their specific assignments
    const teacherAssignments = await prisma.classTeacherSubject.findMany({
      where: {
        teacherId: userId,
        isActive: true
      },
      include: {
        subject: true,
        class: true
      }
    });

    const allowedSubjects = [...new Set(teacherAssignments.map(a => a.subjectId))];
    const allowedClasses = [...new Set(teacherAssignments.map(a => a.classId))];

    return {
      canViewAllSubjects: false,
      canCreateAssignments: true,
      canGradeAssignments: true,
      canManageAttendance: true,
      canAssignSubjects: false,
      canTransferStudents: false,
      allowedSubjects,
      allowedClasses
    };
  }

  /**
   * Check if user can access specific subject in specific class
   * @param {string} userId 
   * @param {'ADMIN' | 'GURU'} userRole 
   * @param {string} classId 
   * @param {string} subjectId 
   * @returns {Promise<boolean>}
   */
  static async canAccessSubject(userId, userRole, classId, subjectId) {
    if (userRole === 'ADMIN') {
      return true;
    }

    const assignment = await prisma.classTeacherSubject.findUnique({
      where: {
        classId_teacherId_subjectId: {
          classId,
          teacherId: userId,
          subjectId
        },
        isActive: true
      }
    });

    return !!assignment;
  }

  /**
   * Get classes and subjects accessible by user
   * @param {string} userId 
   * @param {'ADMIN' | 'GURU'} userRole 
   */
  static async getAccessibleContent(userId, userRole) {
    if (userRole === 'ADMIN') {
      // Admin can see everything
      const classes = await prisma.class.findMany({
        include: {
          classSubjects: {
            include: {
              subject: true
            },
            where: {
              isActive: true
            }
          },
          _count: {
            select: {
              students: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        where: {
          isPhysicalClass: true
        }
      });

      return {
        classes: classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          studentCount: cls._count.students,
          subjects: cls.classSubjects.map(cs => ({
            id: cs.subject.id,
            name: cs.subject.name,
            code: cs.subject.code,
            canAccess: true
          }))
        }))
      };
    }

    // Teacher - only their assigned subjects
    const teacherAssignments = await prisma.classTeacherSubject.findMany({
      where: {
        teacherId: userId,
        isActive: true
      },
      include: {
        class: {
          include: {
            classSubjects: {
              include: {
                subject: true
              },
              where: {
                isActive: true
              }
            },
            _count: {
              select: {
                students: {
                  where: {
                    isActive: true
                  }
                }
              }
            }
          }
        },
        subject: true
      }
    });

    // Group by class
    const classMap = new Map();
    
    for (const assignment of teacherAssignments) {
      const classId = assignment.classId;
      
      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: assignment.class.id,
          name: assignment.class.name,
          studentCount: assignment.class._count.students,
          subjects: []
        });
      }
      
      const classData = classMap.get(classId);
      classData.subjects.push({
        id: assignment.subject.id,
        name: assignment.subject.name,
        code: assignment.subject.code,
        canAccess: true
      });
    }

    return {
      classes: Array.from(classMap.values())
    };
  }

  /**
   * Filter query based on user permissions
   * @param {string} userId 
   * @param {'ADMIN' | 'GURU'} userRole 
   * @param {any} baseQuery 
   */
  static getFilteredQuery(userId, userRole, baseQuery = {}) {
    if (userRole === 'ADMIN') {
      return baseQuery;
    }

    // For teachers, add filter to only show their assigned subjects
    return {
      ...baseQuery,
      where: {
        ...baseQuery.where,
        classTeacherSubjects: {
          some: {
            teacherId: userId,
            isActive: true
          }
        }
      }
    };
  }
}

export default PermissionService;

/**
 * Grade Management System
 * Subject-specific grade management with permission controls
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// =============================================================================
// GRADE MANAGEMENT
// =============================================================================

/**
 * Get grades for specific class-subject
 */
export const getClassSubjectGrades = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    const { semester, gradeType } = req.query;

    // Check teacher permission (unless admin)
    if (req.user.role !== 'ADMIN') {
      const hasPermission = await prisma.classTeacherSubject.findUnique({
        where: {
          classId_teacherId_subjectId: {
            classId,
            teacherId: req.user.id,
            subjectId
          }
        }
      });

      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied to this class-subject' });
      }
    }

    // Build where clause
    const whereClause = {
      classId,
      subjectId
    };

    if (semester) whereClause.semester = semester;
    if (gradeType) whereClause.gradeType = gradeType;

    // Get grades with student info
    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true
          }
        },
        assignment: {
          select: {
            title: true,
            maxPoints: true
          }
        },
        gradedBy: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: [
        { student: { fullName: 'asc' } },
        { createdAt: 'desc' }
      ]
    });

    // Group grades by student
    const studentGrades = grades.reduce((acc, grade) => {
      const studentId = grade.studentId;
      
      if (!acc[studentId]) {
        acc[studentId] = {
          student: grade.student,
          grades: []
        };
      }
      
      acc[studentId].grades.push({
        id: grade.id,
        value: grade.value,
        gradeType: grade.gradeType,
        semester: grade.semester,
        notes: grade.notes,
        assignment: grade.assignment,
        gradedBy: grade.gradedBy,
        gradedAt: grade.createdAt
      });
      
      return acc;
    }, {});

    // Convert to array and calculate averages
    const studentsWithGrades = Object.values(studentGrades).map(studentData => {
      const gradesByType = studentData.grades.reduce((acc, grade) => {
        if (!acc[grade.gradeType]) acc[grade.gradeType] = [];
        acc[grade.gradeType].push(grade.value);
        return acc;
      }, {});

      const averages = {};
      Object.keys(gradesByType).forEach(type => {
        const grades = gradesByType[type];
        averages[type] = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      });

      // Calculate overall average (weighted)
      const weights = {
        QUIZ: 0.2,
        ASSIGNMENT: 0.3,
        EXAM: 0.4,
        PARTICIPATION: 0.1
      };

      let overallAverage = 0;
      let totalWeight = 0;

      Object.keys(averages).forEach(type => {
        const weight = weights[type] || 0.25;
        overallAverage += averages[type] * weight;
        totalWeight += weight;
      });

      if (totalWeight > 0) {
        overallAverage = overallAverage / totalWeight;
      }

      return {
        student: studentData.student,
        grades: studentData.grades,
        averages,
        overallAverage: Math.round(overallAverage * 100) / 100
      };
    });

    res.json({
      message: 'Class-subject grades retrieved successfully',
      data: studentsWithGrades,
      totalStudents: studentsWithGrades.length
    });

  } catch (error) {
    console.error('Error getting class-subject grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add/Update grade for student
 */
export const addOrUpdateGrade = async (req, res) => {
  try {
    const { classId, subjectId, studentId } = req.params;
    const {
      value,
      gradeType,
      semester,
      notes,
      assignmentId
    } = req.body;

    // Check teacher permission (unless admin)
    if (req.user.role !== 'ADMIN') {
      const hasPermission = await prisma.classTeacherSubject.findUnique({
        where: {
          classId_teacherId_subjectId: {
            classId,
            teacherId: req.user.id,
            subjectId
          }
        }
      });

      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied to this class-subject' });
      }
    }

    // Validate student enrollment
    const enrollment = await prisma.studentSubjectEnrollment.findUnique({
      where: {
        studentId_classId_subjectId: {
          studentId,
          classId,
          subjectId
        }
      }
    });

    if (!enrollment || !enrollment.isActive) {
      return res.status(404).json({ error: 'Student not enrolled in this class-subject' });
    }

    // Validate grade value (0-100)
    if (value < 0 || value > 100) {
      return res.status(400).json({ error: 'Grade value must be between 0 and 100' });
    }

    // Check if grade already exists for this assignment (if assignmentId provided)
    let existingGrade = null;
    if (assignmentId) {
      existingGrade = await prisma.grade.findFirst({
        where: {
          studentId,
          classId,
          subjectId,
          assignmentId
        }
      });
    }

    let grade;
    if (existingGrade) {
      // Update existing grade
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: {
          value,
          notes,
          gradedById: req.user.id,
          updatedAt: new Date()
        },
        include: {
          student: {
            select: {
              fullName: true,
              studentId: true
            }
          },
          assignment: {
            select: {
              title: true,
              maxPoints: true
            }
          }
        }
      });
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: {
          studentId,
          classId,
          subjectId,
          assignmentId,
          value,
          gradeType: gradeType || 'ASSIGNMENT',
          semester: semester || 'SEMESTER_1',
          notes,
          gradedById: req.user.id
        },
        include: {
          student: {
            select: {
              fullName: true,
              studentId: true
            }
          },
          assignment: {
            select: {
              title: true,
              maxPoints: true
            }
          }
        }
      });
    }

    res.status(existingGrade ? 200 : 201).json({
      message: `Grade ${existingGrade ? 'updated' : 'added'} successfully`,
      data: grade
    });

  } catch (error) {
    console.error('Error adding/updating grade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get student's grades across all subjects
 */
export const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    // Check permission (student can see own grades, teacher/admin can see all)
    if (req.user.role === 'STUDENT' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Students can only view their own grades' });
    }

    // Build where clause
    const whereClause = { studentId };
    if (semester) whereClause.semester = semester;

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        class: {
          select: {
            name: true
          }
        },
        subject: {
          select: {
            name: true,
            code: true
          }
        },
        assignment: {
          select: {
            title: true,
            maxPoints: true
          }
        },
        gradedBy: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { createdAt: 'desc' }
      ]
    });

    // Group by subject
    const gradesBySubject = grades.reduce((acc, grade) => {
      const subjectKey = `${grade.subjectId}-${grade.classId}`;
      
      if (!acc[subjectKey]) {
        acc[subjectKey] = {
          class: grade.class,
          subject: grade.subject,
          grades: []
        };
      }
      
      acc[subjectKey].grades.push({
        id: grade.id,
        value: grade.value,
        gradeType: grade.gradeType,
        semester: grade.semester,
        notes: grade.notes,
        assignment: grade.assignment,
        gradedBy: grade.gradedBy,
        gradedAt: grade.createdAt
      });
      
      return acc;
    }, {});

    // Calculate averages for each subject
    const subjectsWithAverages = Object.values(gradesBySubject).map(subjectData => {
      const gradesByType = subjectData.grades.reduce((acc, grade) => {
        if (!acc[grade.gradeType]) acc[grade.gradeType] = [];
        acc[grade.gradeType].push(grade.value);
        return acc;
      }, {});

      const averages = {};
      Object.keys(gradesByType).forEach(type => {
        const grades = gradesByType[type];
        averages[type] = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      });

      // Calculate subject overall average
      const weights = {
        QUIZ: 0.2,
        ASSIGNMENT: 0.3,
        EXAM: 0.4,
        PARTICIPATION: 0.1
      };

      let subjectAverage = 0;
      let totalWeight = 0;

      Object.keys(averages).forEach(type => {
        const weight = weights[type] || 0.25;
        subjectAverage += averages[type] * weight;
        totalWeight += weight;
      });

      if (totalWeight > 0) {
        subjectAverage = subjectAverage / totalWeight;
      }

      return {
        class: subjectData.class,
        subject: subjectData.subject,
        grades: subjectData.grades,
        averages,
        subjectAverage: Math.round(subjectAverage * 100) / 100
      };
    });

    // Calculate overall GPA
    const overallGPA = subjectsWithAverages.length > 0
      ? subjectsWithAverages.reduce((sum, subject) => sum + subject.subjectAverage, 0) / subjectsWithAverages.length
      : 0;

    res.json({
      message: 'Student grades retrieved successfully',
      data: {
        subjects: subjectsWithAverages,
        overallGPA: Math.round(overallGPA * 100) / 100,
        totalSubjects: subjectsWithAverages.length
      }
    });

  } catch (error) {
    console.error('Error getting student grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate grade report for class-subject
 */
export const generateGradeReport = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    const { semester = 'SEMESTER_1' } = req.query;

    // Check teacher permission (unless admin)
    if (req.user.role !== 'ADMIN') {
      const hasPermission = await prisma.classTeacherSubject.findUnique({
        where: {
          classId_teacherId_subjectId: {
            classId,
            teacherId: req.user.id,
            subjectId
          }
        }
      });

      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied to this class-subject' });
      }
    }

    // Get class and subject info
    const classSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId
        }
      },
      include: {
        class: true,
        subject: true
      }
    });

    if (!classSubject) {
      return res.status(404).json({ error: 'Class-subject not found' });
    }

    // Get all enrolled students
    const enrolledStudents = await prisma.studentSubjectEnrollment.findMany({
      where: {
        classId,
        subjectId,
        isActive: true
      },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true
          }
        }
      }
    });

    // Get grades for this semester
    const grades = await prisma.grade.findMany({
      where: {
        classId,
        subjectId,
        semester
      },
      include: {
        assignment: {
          select: {
            title: true,
            assignmentType: true
          }
        }
      }
    });

    // Process data for report
    const studentReports = enrolledStudents.map(enrollment => {
      const studentGrades = grades.filter(g => g.studentId === enrollment.studentId);
      
      const gradesByType = studentGrades.reduce((acc, grade) => {
        if (!acc[grade.gradeType]) acc[grade.gradeType] = [];
        acc[grade.gradeType].push(grade.value);
        return acc;
      }, {});

      const averages = {};
      Object.keys(gradesByType).forEach(type => {
        const gradeValues = gradesByType[type];
        averages[type] = gradeValues.reduce((sum, grade) => sum + grade, 0) / gradeValues.length;
      });

      // Calculate final grade
      const weights = { QUIZ: 0.2, ASSIGNMENT: 0.3, EXAM: 0.4, PARTICIPATION: 0.1 };
      let finalGrade = 0;
      let totalWeight = 0;

      Object.keys(averages).forEach(type => {
        const weight = weights[type] || 0.25;
        finalGrade += averages[type] * weight;
        totalWeight += weight;
      });

      if (totalWeight > 0) {
        finalGrade = finalGrade / totalWeight;
      }

      return {
        student: enrollment.student,
        grades: studentGrades.map(g => ({
          value: g.value,
          type: g.gradeType,
          assignment: g.assignment?.title || 'Manual Entry'
        })),
        averages,
        finalGrade: Math.round(finalGrade * 100) / 100,
        letterGrade: getLetterGrade(finalGrade)
      };
    });

    // Calculate class statistics
    const finalGrades = studentReports.map(s => s.finalGrade).filter(g => g > 0);
    const classStats = {
      average: finalGrades.length > 0 ? finalGrades.reduce((sum, grade) => sum + grade, 0) / finalGrades.length : 0,
      highest: finalGrades.length > 0 ? Math.max(...finalGrades) : 0,
      lowest: finalGrades.length > 0 ? Math.min(...finalGrades) : 0,
      passingCount: finalGrades.filter(g => g >= 70).length,
      totalStudents: enrolledStudents.length
    };

    res.json({
      message: 'Grade report generated successfully',
      data: {
        classInfo: {
          className: classSubject.class.name,
          subjectName: classSubject.subject.name,
          semester
        },
        students: studentReports,
        classStatistics: {
          ...classStats,
          average: Math.round(classStats.average * 100) / 100,
          passingRate: Math.round((classStats.passingCount / classStats.totalStudents) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Error generating grade report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to convert numeric grade to letter grade
function getLetterGrade(numericGrade) {
  if (numericGrade >= 90) return 'A';
  if (numericGrade >= 80) return 'B';
  if (numericGrade >= 70) return 'C';
  if (numericGrade >= 60) return 'D';
  return 'F';
}

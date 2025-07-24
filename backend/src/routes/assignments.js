// Assignment Routes - Guru Digital Pelangi
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/assignments - Get assignments for current teacher
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Getting assignments for user:', req.user.id);
    const { classId, status, type, search } = req.query;
    const teacherId = req.user.id;

    // Build where clause - only show assignments created by current teacher
    const where = {
      teacherId: teacherId, // ISOLATION: Only show teacher's own assignments
    };

    if (classId) where.classId = classId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    console.log('Assignment query where:', where);

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: {
          include: {
            subject: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            nip: true
          }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentId: true
              }
            }
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    console.log('Found assignments:', assignments.length);

    // Calculate statistics for each assignment
    const assignmentsWithStats = assignments.map(assignment => {
      const totalStudents = assignment.class?.studentCount || 0;
      const submittedCount = assignment.submissions.filter(s => s.status !== 'NOT_SUBMITTED').length;
      const gradedCount = assignment.submissions.filter(s => s.status === 'GRADED').length;
      const lateCount = assignment.submissions.filter(s => s.status === 'LATE_SUBMITTED').length;
      
      // Determine assignment status
      let assignmentStatus = assignment.status;
      if (assignment.status === 'PUBLISHED' && new Date() > new Date(assignment.deadline)) {
        assignmentStatus = 'overdue';
      } else if (assignment.status === 'PUBLISHED') {
        assignmentStatus = 'active';
      } else if (assignment.status === 'CLOSED') {
        assignmentStatus = 'completed';
      }

      return {
        ...assignment,
        submissionsCount: submittedCount,
        totalStudents,
        gradedCount,
        lateCount,
        status: assignmentStatus
      };
    });

    res.json({
      success: true,
      data: assignmentsWithStats
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data tugas'
    });
  }
});

// GET /api/assignments/stats - Get assignment statistics for current teacher
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const assignments = await prisma.assignment.findMany({
      where: {
        teacherId: teacherId // Only count teacher's own assignments
      },
      include: {
        submissions: true
      }
    });

    const stats = {
      total: assignments.length,
      active: assignments.filter(a => a.status === 'PUBLISHED' && new Date(a.deadline) > now).length,
      overdue: assignments.filter(a => a.status === 'PUBLISHED' && new Date(a.deadline) <= now).length,
      completed: assignments.filter(a => a.status === 'CLOSED').length,
      thisWeek: assignments.filter(a => {
        const deadline = new Date(a.deadline);
        return deadline >= now && deadline <= weekFromNow;
      }).length,
      averagePoints: assignments.length > 0 
        ? Math.round(assignments.reduce((sum, a) => sum + a.points, 0) / assignments.length)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil statistik tugas'
    });
  }
});

// GET /api/assignments/:id - Get single assignment details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    console.log('Getting assignment details for:', id, 'teacher:', teacherId);

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        teacherId: teacherId // Only allow access to own assignments
      },
      include: {
        class: {
          include: {
            subject: true,
            students: true // Include students for counting
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            nip: true
          }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentId: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Calculate submission statistics
    const totalStudents = assignment.class.students.length;
    const submittedCount = assignment.submissions.length;
    const gradedCount = assignment.submissions.filter(s => s.grade !== null).length;
    const lateCount = assignment.submissions.filter(s => new Date(s.submittedAt) > new Date(assignment.deadline)).length;

    const assignmentData = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      points: assignment.points,
      deadline: assignment.deadline,
      type: assignment.type,
      status: assignment.status,
      createdAt: assignment.createdAt,
      class: {
        id: assignment.class.id,
        name: assignment.class.name,
        subject: assignment.class.subject
      },
      submissionStats: {
        total: totalStudents,
        submitted: submittedCount,
        graded: gradedCount,
        missing: totalStudents - submittedCount,
        late: lateCount
      }
    };

    res.json({
      success: true,
      data: assignmentData
    });
  } catch (error) {
    console.error('Error getting assignment details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assignment details'
    });
  }
});

// GET /api/assignments/:id/submissions - Get assignment submissions with student data
router.get('/:id/submissions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    console.log('Getting submissions for assignment:', id, 'teacher:', teacherId);

    // First verify assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        teacherId: teacherId
      },
      include: {
        class: {
          include: {
            students: {
              select: {
                id: true,
                fullName: true,
                studentId: true,
                avatar: true
              }
            }
          }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentId: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Create student list with submission data
    const studentsWithSubmissions = assignment.class.students.map(student => {
      const submission = assignment.submissions.find(s => s.studentId === student.id);
      
      let submissionData = null;
      if (submission) {
        // Determine submission status
        let status = 'submitted';
        if (new Date(submission.submittedAt) > new Date(assignment.deadline)) {
          status = 'late';
        }

        submissionData = {
          id: submission.id,
          submittedAt: submission.submittedAt,
          status: status,
          content: submission.content,
          attachments: submission.attachments || [],
          grade: submission.grade,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
          gradedBy: submission.gradedBy
        };
      }

      return {
        id: student.id,
        fullName: student.fullName,
        studentId: student.studentId,
        avatar: student.avatar,
        submission: submissionData
      };
    });

    res.json({
      success: true,
      data: {
        students: studentsWithSubmissions
      }
    });
  } catch (error) {
    console.error('Error getting assignment submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assignment submissions'
    });
  }
});

// PUT /api/assignments/:id/submissions/:studentId/grade - Grade a student submission
router.put('/:id/submissions/:studentId/grade', authenticateToken, async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const { grade, feedback } = req.body;
    const teacherId = req.user.id;

    console.log('Grading submission:', { assignmentId: id, studentId, grade, feedback });

    // Verify assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        teacherId: teacherId
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Find or create submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: studentId
        }
      },
      update: {
        grade: grade,
        feedback: feedback,
        gradedAt: new Date(),
        gradedBy: teacherId
      },
      create: {
        assignmentId: id,
        studentId: studentId,
        submittedAt: new Date(), // Default if no submission exists
        content: 'Graded without submission',
        grade: grade,
        feedback: feedback,
        gradedAt: new Date(),
        gradedBy: teacherId
      }
    });

    res.json({
      success: true,
      data: submission,
      message: 'Grade saved successfully'
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save grade'
    });
  }
});

// PUT /api/assignments/:id/bulk-grade - Bulk grade submissions
router.put('/:id/bulk-grade', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds, grade, feedback } = req.body;
    const teacherId = req.user.id;

    console.log('Bulk grading:', { assignmentId: id, studentIds, grade, feedback });

    // Verify assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        teacherId: teacherId
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Bulk update submissions
    const results = await Promise.allSettled(
      studentIds.map(studentId =>
        prisma.assignmentSubmission.upsert({
          where: {
            assignmentId_studentId: {
              assignmentId: id,
              studentId: studentId
            }
          },
          update: {
            grade: grade,
            feedback: feedback,
            gradedAt: new Date(),
            gradedBy: teacherId
          },
          create: {
            assignmentId: id,
            studentId: studentId,
            submittedAt: new Date(),
            content: 'Graded without submission',
            grade: grade,
            feedback: feedback,
            gradedAt: new Date(),
            gradedBy: teacherId
          }
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      data: {
        successful,
        failed,
        total: studentIds.length
      },
      message: `Successfully graded ${successful} submissions`
    });
  } catch (error) {
    console.error('Error bulk grading:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk grade submissions'
    });
  }
});

// POST /api/assignments - Create new assignment
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Creating assignment for user:', req.user.id, 'role:', req.user.role);
    const {
      title,
      description,
      instructions,
      points = 100,
      deadline,
      type = 'TUGAS_HARIAN',
      classId
    } = req.body;

    console.log('Assignment data:', { title, classId, deadline, type });

    const teacherId = req.user.id;

    // Validate required fields
    if (!title || !deadline || !classId) {
      return res.status(400).json({
        success: false,
        error: 'Title, deadline, dan class ID wajib diisi'
      });
    }

    // Check if teacher has access to this class (skip for ADMIN only)
    console.log('User role:', req.user.role);
    if (req.user.role !== 'ADMIN') {
      console.log('Checking class teacher access for classId:', classId, 'teacherId:', teacherId);

      // First, let's see what class teachers exist
      const allClassTeachers = await prisma.classTeacher.findMany({
        where: { teacherId: teacherId },
        include: { class: true }
      });
      console.log('All class teachers for this user:', allClassTeachers);

      const classTeacher = await prisma.classTeacher.findFirst({
        where: {
          classId: classId,
          teacherId: teacherId
        }
      });

      console.log('Class teacher found:', classTeacher);
      if (!classTeacher) {
        console.log('Access denied: No class teacher relationship found');
        return res.status(403).json({
          success: false,
          error: 'Anda tidak memiliki akses ke kelas ini'
        });
      }
    } else {
      console.log('Admin user - can create assignment for any class');
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        instructions,
        points: parseInt(points),
        deadline: new Date(deadline),
        type,
        classId,
        teacherId,
        status: 'DRAFT'
      },
      include: {
        class: {
          include: {
            subject: true,
            students: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            nip: true
          }
        }
      }
    });

    // Create submission records for all students in the class
    const students = assignment.class.students;
    if (students.length > 0) {
      await prisma.assignmentSubmission.createMany({
        data: students.map(student => ({
          assignmentId: assignment.id,
          studentId: student.id,
          status: 'NOT_SUBMITTED'
        }))
      });
    }

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Tugas berhasil dibuat'
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat tugas'
    });
  }
});

// PUT /api/assignments/:id - Update assignment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const updateData = req.body;

    // Check if assignment exists and belongs to current teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        teacherId: teacherId // ISOLATION: Only allow updating own assignments
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        error: 'Tugas tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Update assignment
    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...updateData,
        deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
        points: updateData.points ? parseInt(updateData.points) : undefined
      },
      include: {
        class: {
          include: {
            subject: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            nip: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: assignment,
      message: 'Tugas berhasil diupdate'
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengupdate tugas'
    });
  }
});

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    // Check if assignment exists and belongs to current teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        teacherId: teacherId // ISOLATION: Only allow deleting own assignments
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        error: 'Tugas tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Delete assignment (submissions will be deleted automatically due to cascade)
    await prisma.assignment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Tugas berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus tugas'
    });
  }
});

// GET /api/assignments/debug - Debug endpoint to check class teachers
router.get('/debug', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, role: true, email: true }
    });

    // Get all class teachers for this user
    const classTeachers = await prisma.classTeacher.findMany({
      where: { teacherId: userId },
      include: {
        class: {
          include: {
            subject: true
          }
        }
      }
    });

    // Get all classes if admin
    const allClasses = req.user.role === 'ADMIN' ? await prisma.class.findMany({
      include: {
        subject: true
      }
    }) : [];

    res.json({
      success: true,
      data: {
        user,
        classTeachers,
        allClasses: req.user.role === 'ADMIN' ? allClasses : []
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Debug error'
    });
  }
});

export default router;

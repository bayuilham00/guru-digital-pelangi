// Assignment Submission Routes - Guru Digital Pelangi
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/submissions/assignment/:assignmentId - Get submissions for an assignment (Teacher view)
router.get('/assignment/:assignmentId', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    // Check if assignment belongs to current teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: teacherId
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Tugas tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId: assignmentId
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            class: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data submission'
    });
  }
});

// GET /api/submissions/student/:studentId - Get submissions for a student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        studentId: studentId
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
            points: true,
            type: true,
            class: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data submission siswa'
    });
  }
});

// POST /api/submissions - Submit assignment (Student)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { assignmentId, content, attachments } = req.body;
    const studentId = req.user.id; // Assuming student is logged in

    // Check if assignment exists and is published
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        status: 'PUBLISHED'
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Tugas tidak ditemukan atau belum dipublikasi'
      });
    }

    // Check if submission already exists
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignmentId,
          studentId: studentId
        }
      }
    });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        error: 'Record submission tidak ditemukan'
      });
    }

    // Check if already submitted
    if (existingSubmission.status !== 'NOT_SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: 'Tugas sudah pernah dikumpulkan'
      });
    }

    // Determine if submission is late
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isLate = now > deadline;

    // Update submission
    const submission = await prisma.assignmentSubmission.update({
      where: {
        id: existingSubmission.id
      },
      data: {
        content: content || '',
        attachments: attachments ? JSON.stringify(attachments) : null,
        status: isLate ? 'LATE_SUBMITTED' : 'SUBMITTED',
        submittedAt: now
      },
      include: {
        assignment: {
          select: {
            title: true,
            points: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: isLate ? 'Tugas berhasil dikumpulkan (terlambat)' : 'Tugas berhasil dikumpulkan'
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengumpulkan tugas'
    });
  }
});

// PUT /api/submissions/:id/grade - Grade submission (Teacher)
router.put('/:id/grade', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    const teacherId = req.user.id;

    // Check if submission exists and belongs to teacher's assignment
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        id: id,
        assignment: {
          teacherId: teacherId
        }
      },
      include: {
        assignment: true,
        student: true
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Validate score
    if (score < 0 || score > submission.assignment.points) {
      return res.status(400).json({
        success: false,
        error: `Nilai harus antara 0 dan ${submission.assignment.points}`
      });
    }

    // Update submission with grade
    const gradedSubmission = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        score: parseFloat(score),
        feedback: feedback || null,
        status: 'GRADED',
        gradedAt: new Date()
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
        assignment: {
          select: {
            title: true,
            points: true
          }
        }
      }
    });

    // TODO: Add XP to student based on score
    // Calculate XP based on score percentage
    const scorePercentage = (score / submission.assignment.points) * 100;
    let xpGained = 0;
    
    if (scorePercentage >= 90) xpGained = 50;
    else if (scorePercentage >= 80) xpGained = 40;
    else if (scorePercentage >= 70) xpGained = 30;
    else if (scorePercentage >= 60) xpGained = 20;
    else if (scorePercentage >= 50) xpGained = 10;

    if (xpGained > 0) {
      // Update student XP
      await prisma.studentXp.upsert({
        where: { studentId: submission.student.id },
        update: {
          totalXp: { increment: xpGained }
        },
        create: {
          studentId: submission.student.id,
          totalXp: xpGained,
          level: 1,
          levelName: 'Pemula'
        }
      });
    }

    res.json({
      success: true,
      data: gradedSubmission,
      xpGained,
      message: 'Nilai berhasil diberikan'
    });

  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memberikan nilai'
    });
  }
});

export default router;

/**
 * Student Enrollment Approval System
 * Handles approval workflow for student enrollment and transfer between classes
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Approval status enum
const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

// =============================================================================
// ENROLLMENT APPROVAL FUNCTIONS
// =============================================================================

/**
 * Request student enrollment to a specific class-subject
 */
export const requestStudentEnrollment = async (req, res) => {
  try {
    const { studentId, classId, subjectId, reason } = req.body;

    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Validate class-subject exists
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
      return res.status(404).json({ error: 'Class-subject relationship not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.studentSubjectEnrollment.findUnique({
      where: {
        studentId_classId_subjectId: {
          studentId,
          classId,
          subjectId
        }
      }
    });

    if (existingEnrollment && existingEnrollment.isActive) {
      return res.status(409).json({ error: 'Student already enrolled in this class-subject' });
    }

    // Check for pending approval
    const pendingApproval = await prisma.enrollmentApproval.findFirst({
      where: {
        studentId,
        classId,
        subjectId,
        status: ApprovalStatus.PENDING
      }
    });

    if (pendingApproval) {
      return res.status(409).json({ error: 'Enrollment request already pending approval' });
    }

    // Create enrollment approval request
    const approvalRequest = await prisma.enrollmentApproval.create({
      data: {
        studentId,
        classId,
        subjectId,
        requestedById: req.user.id,
        reason: reason || 'Student enrollment request',
        status: ApprovalStatus.PENDING,
        requestType: 'ENROLLMENT'
      },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true
          }
        },
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
        requestedBy: {
          select: {
            fullName: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Enrollment request submitted successfully',
      data: approvalRequest
    });

  } catch (error) {
    console.error('Error requesting student enrollment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Approve or reject enrollment request
 */
export const processEnrollmentApproval = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    // Get approval request
    const approval = await prisma.enrollmentApproval.findUnique({
      where: { id: approvalId },
      include: {
        student: true,
        class: true,
        subject: true
      }
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      return res.status(400).json({ error: 'Approval request already processed' });
    }

    // Update approval status
    const updatedApproval = await prisma.enrollmentApproval.update({
      where: { id: approvalId },
      data: {
        status,
        adminNotes,
        approvedById: req.user.id,
        approvedAt: new Date()
      }
    });

    // If approved, create the actual enrollment
    if (status === ApprovalStatus.APPROVED) {
      // Check if enrollment already exists (in case of race condition)
      const existingEnrollment = await prisma.studentSubjectEnrollment.findUnique({
        where: {
          studentId_classId_subjectId: {
            studentId: approval.studentId,
            classId: approval.classId,
            subjectId: approval.subjectId
          }
        }
      });

      if (!existingEnrollment) {
        await prisma.studentSubjectEnrollment.create({
          data: {
            studentId: approval.studentId,
            classId: approval.classId,
            subjectId: approval.subjectId,
            isActive: true
          }
        });

        // Also update student's main class if this is a class transfer
        if (approval.requestType === 'TRANSFER') {
          await prisma.student.update({
            where: { id: approval.studentId },
            data: { classId: approval.classId }
          });

          // Create transfer history record
          await prisma.studentTransferHistory.create({
            data: {
              studentId: approval.studentId,
              fromClassId: approval.student.classId,
              toClassId: approval.classId,
              transferredById: req.user.id,
              reason: approval.reason,
              approvalId: approval.id
            }
          });
        }
      }
    }

    res.json({
      message: `Enrollment request ${status.toLowerCase()} successfully`,
      data: updatedApproval
    });

  } catch (error) {
    console.error('Error processing enrollment approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get pending approval requests (Admin only)
 */
export const getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [approvals, total] = await Promise.all([
      prisma.enrollmentApproval.findMany({
        where: {
          status: ApprovalStatus.PENDING
        },
        include: {
          student: {
            select: {
              fullName: true,
              studentId: true,
              class: {
                select: {
                  name: true
                }
              }
            }
          },
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
          requestedBy: {
            select: {
              fullName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.enrollmentApproval.count({
        where: {
          status: ApprovalStatus.PENDING
        }
      })
    ]);

    res.json({
      message: 'Pending approvals retrieved successfully',
      data: approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get approval history for a student
 */
export const getStudentApprovalHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const approvals = await prisma.enrollmentApproval.findMany({
      where: { studentId },
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
        requestedBy: {
          select: {
            fullName: true,
            role: true
          }
        },
        approvedBy: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Student approval history retrieved successfully',
      data: approvals
    });

  } catch (error) {
    console.error('Error getting student approval history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * Bulk approve multiple enrollment requests
 */
export const bulkApproveEnrollments = async (req, res) => {
  try {
    const { approvalIds, adminNotes } = req.body;

    if (!Array.isArray(approvalIds) || approvalIds.length === 0) {
      return res.status(400).json({ error: 'Approval IDs array is required' });
    }

    // Get all pending approvals
    const approvals = await prisma.enrollmentApproval.findMany({
      where: {
        id: { in: approvalIds },
        status: ApprovalStatus.PENDING
      }
    });

    if (approvals.length === 0) {
      return res.status(404).json({ error: 'No pending approvals found' });
    }

    // Update all approvals to approved
    await prisma.enrollmentApproval.updateMany({
      where: {
        id: { in: approvals.map(a => a.id) }
      },
      data: {
        status: ApprovalStatus.APPROVED,
        adminNotes,
        approvedById: req.user.id,
        approvedAt: new Date()
      }
    });

    // Create enrollments for all approved requests
    const enrollmentData = approvals.map(approval => ({
      studentId: approval.studentId,
      classId: approval.classId,
      subjectId: approval.subjectId,
      isActive: true
    }));

    await prisma.studentSubjectEnrollment.createMany({
      data: enrollmentData,
      skipDuplicates: true
    });

    res.json({
      message: `Successfully approved ${approvals.length} enrollment requests`,
      approvedCount: approvals.length
    });

  } catch (error) {
    console.error('Error bulk approving enrollments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

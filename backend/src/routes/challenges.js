// Challenge Management Routes - Guru Digital Pelangi
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all challenges
router.get('/', authenticateToken, async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: challenges,
      message: 'Challenges retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new challenge
router.post('/', authenticateToken, requireRole(['ADMIN', 'GURU']), async (req, res) => {
  try {
    const { title, description, duration, targetType, xpReward } = req.body;

    // Validation
    if (!title || !description || !duration || !targetType || !xpReward) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, duration, targetType, and xpReward are required'
      });
    }

    if (duration < 1 || duration > 365) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 1 and 365 days'
      });
    }

    if (xpReward < 1 || xpReward > 1000) {
      return res.status(400).json({
        success: false,
        error: 'XP reward must be between 1 and 1000'
      });
    }

    const validTargetTypes = ['ALL_STUDENTS', 'GRADE_7', 'GRADE_8', 'GRADE_9'];
    if (!validTargetTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target type'
      });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(duration));

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        targetType,
        xpReward: parseInt(xpReward),
        isActive: true,
        startDate,
        endDate,
        createdBy: req.user.id
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: challenge,
      message: 'Challenge created successfully'
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update challenge
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'GURU']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, targetType, xpReward, isActive } = req.body;

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!existingChallenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Check if user has permission to update this challenge
    if (req.user.role !== 'ADMIN' && existingChallenge.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update challenges you created'
      });
    }

    // Validation
    if (duration && (duration < 1 || duration > 365)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 1 and 365 days'
      });
    }

    if (xpReward && (xpReward < 1 || xpReward > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'XP reward must be between 1 and 1000'
      });
    }

    if (targetType) {
      const validTargetTypes = ['ALL_STUDENTS', 'GRADE_7', 'GRADE_8', 'GRADE_9'];
      if (!validTargetTypes.includes(targetType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid target type'
        });
      }
    }

    // Update end date if duration is changed
    let updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(targetType && { targetType }),
      ...(xpReward && { xpReward: parseInt(xpReward) }),
      ...(isActive !== undefined && { isActive })
    };

    if (duration) {
      updateData.duration = parseInt(duration);
      const newEndDate = new Date(existingChallenge.startDate);
      newEndDate.setDate(newEndDate.getDate() + parseInt(duration));
      updateData.endDate = newEndDate;
    }

    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedChallenge,
      message: 'Challenge updated successfully'
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete challenge
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'GURU']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participations: true
          }
        }
      }
    });

    if (!existingChallenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Check if user has permission to delete this challenge
    if (req.user.role !== 'ADMIN' && existingChallenge.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete challenges you created'
      });
    }

    // Check if challenge has active participants
    if (existingChallenge._count.participations > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete challenge that has active participants'
      });
    }

    await prisma.challenge.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;

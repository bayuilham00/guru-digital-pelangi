// Badge Management Routes - Guru Digital Pelangi
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all badges
router.get('/', authenticateToken, async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            studentBadges: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: badges,
      message: 'Badges retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new badge
router.post('/', authenticateToken, requireRole(['ADMIN', 'GURU']), async (req, res) => {
  try {
    const { name, description, icon, xpReward } = req.body;

    // Validation
    if (!name || !description || !icon || !xpReward) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, icon, and xpReward are required'
      });
    }

    if (xpReward < 1 || xpReward > 1000) {
      return res.status(400).json({
        success: false,
        error: 'XP reward must be between 1 and 1000'
      });
    }

    // Check if badge name already exists
    const existingBadge = await prisma.badge.findFirst({
      where: { name }
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        error: 'Badge with this name already exists'
      });
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        icon,
        xpReward: parseInt(xpReward)
      }
    });

    res.status(201).json({
      success: true,
      data: badge,
      message: 'Badge created successfully'
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update badge
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'GURU']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, xpReward } = req.body;

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id }
    });

    if (!existingBadge) {
      return res.status(404).json({
        success: false,
        error: 'Badge not found'
      });
    }

    // Validation
    if (xpReward && (xpReward < 1 || xpReward > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'XP reward must be between 1 and 1000'
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== existingBadge.name) {
      const nameExists = await prisma.badge.findFirst({
        where: { name, id: { not: id } }
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          error: 'Badge with this name already exists'
        });
      }
    }

    const updatedBadge = await prisma.badge.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(xpReward && { xpReward: parseInt(xpReward) })
      }
    });

    res.json({
      success: true,
      data: updatedBadge,
      message: 'Badge updated successfully'
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete badge
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'GURU']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            studentBadges: true
          }
        }
      }
    });

    if (!existingBadge) {
      return res.status(404).json({
        success: false,
        error: 'Badge not found'
      });
    }

    // Check if badge is being used by students
    if (existingBadge._count.studentBadges > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete badge that has been awarded to students'
      });
    }

    await prisma.badge.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Badge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting badge:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;

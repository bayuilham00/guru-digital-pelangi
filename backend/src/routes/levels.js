// Level Management Routes - Guru Digital Pelangi
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all levels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    });
    res.json({ success: true, data: levels });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ success: false, error: 'Gagal mengambil data level' });
  }
});

// Update level (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, xpRequired, benefits } = req.body;

    // Validation
    if (!name || xpRequired === undefined || !benefits) {
      return res.status(400).json({
        success: false,
        error: 'Name, xpRequired, and benefits are required'
      });
    }

    if (xpRequired < 0) {
      return res.status(400).json({ success: false, error: 'XP tidak boleh negatif' });
    }

    const updated = await prisma.level.update({
      where: { id },
      data: {
        name,
        xpRequired: parseInt(xpRequired),
        benefits
      }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({ success: false, error: 'Gagal memperbarui level' });
  }
});

// Delete level (Admin only) - Not allowed for system levels
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // System levels cannot be deleted
    const levelNum = await prisma.level.findUnique({where:{id}, select:{level:true}});
    if (levelNum && levelNum.level <= 10) {
      return res.status(400).json({
        success: false,
        error: 'System levels cannot be deleted'
      });
    }

    await prisma.level.delete({ where: { id } });
    res.json({ success: true, message: 'Level berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting level:', error);
    res.status(500).json({ success: false, error: 'Gagal menghapus level' });
  }
});

// Create new level (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { level, name, xpRequired, benefits } = req.body;
    if (!level || !name || xpRequired === undefined || !benefits) {
      return res.status(400).json({ success: false, error: 'Semua field level harus diisi' });
    }
    const newLevel = await prisma.level.create({
      data: { level: parseInt(level), name, xpRequired: parseInt(xpRequired), benefits }
    });
    res.json({ success: true, data: newLevel });
  } catch (error) {
    console.error('Error creating level:', error);
    res.status(500).json({ success: false, error: 'Gagal membuat level' });
  }
});

export default router;

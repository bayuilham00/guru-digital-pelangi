// Routes untuk manajemen mata pelajaran (Admin only)
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: admin dan guru bisa akses untuk read operations
router.use(authenticateToken);

// GET /api/subjects - Get all subjects (accessible by ADMIN and GURU)
router.get('/', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            classes: true,
            grades: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data mata pelajaran'
    });
  }
});

// GET /api/subjects/:id - Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            classTeachers: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            classes: true,
            grades: true
          }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data mata pelajaran'
    });
  }
});

// POST /api/subjects - Create new subject (Admin only)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan kode mata pelajaran wajib diisi'
      });
    }

    // Check if code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code }
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Kode mata pelajaran sudah digunakan'
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code: code.toUpperCase(),
        description
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mata pelajaran berhasil dibuat',
      data: subject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat mata pelajaran'
    });
  }
});

// PUT /api/subjects/:id - Update subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    // Check if code is being changed and already exists
    if (code && code !== existingSubject.code) {
      const codeExists = await prisma.subject.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Kode mata pelajaran sudah digunakan'
        });
      }
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Mata pelajaran berhasil diperbarui',
      data: subject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui mata pelajaran'
    });
  }
});

// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            classes: true,
            grades: true
          }
        }
      }
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan'
      });
    }

    // Check if subject is being used
    if (existingSubject._count.classes > 0 || existingSubject._count.grades > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mata pelajaran tidak dapat dihapus karena masih digunakan di kelas atau nilai'
      });
    }

    await prisma.subject.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Mata pelajaran berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus mata pelajaran'
    });
  }
});

export default router;

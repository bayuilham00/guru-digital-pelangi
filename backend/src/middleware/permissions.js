/**
 * Permission Middleware - Role-based access control
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware untuk mengecek apakah user adalah admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.'
    });
  }
  next();
};

/**
 * Middleware untuk mengecek apakah user adalah admin atau teacher
 */
export const requireAdminOrTeacher = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'GURU')) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin atau guru yang diizinkan.'
    });
  }
  next();
};

/**
 * Middleware untuk mengecek apakah guru memiliki akses ke kelas tertentu
 */
export const checkTeacherAccess = async (req, res, next) => {
  try {
    // Jika user adalah admin, berikan akses penuh
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }

    // Jika user bukan guru, tolak akses
    if (!req.user || req.user.role !== 'GURU') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya guru yang diizinkan.'
      });
    }

    // Ambil classId dari parameter URL
    const classId = req.params.classId;
    
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID diperlukan'
      });
    }

    // Cek apakah guru memiliki akses ke kelas ini
    const teacherAccess = await prisma.classTeacherSubject.findFirst({
      where: {
        teacherId: req.user.id,
        classId: parseInt(classId),
        isActive: true
      }
    });

    if (!teacherAccess) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki akses ke kelas ini.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in checkTeacherAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek akses'
    });
  }
};

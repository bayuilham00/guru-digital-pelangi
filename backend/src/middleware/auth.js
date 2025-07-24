// Authentication Middleware - JWT Token Verification
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware untuk verifikasi JWT token
 * Mengecek apakah user sudah login dan token valid
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token akses diperlukan'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cari user di database - bisa di tabel users (guru/admin) atau students (siswa)
    let user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true
      }
    });

    // Jika tidak ditemukan di users, coba cari di students
    if (!user) {
      const student = await prisma.student.findUnique({
        where: { id: decoded.userId },
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
      });

      if (student) {
        // Transform student data to match user format
        user = {
          id: student.id,
          email: null,
          fullName: student.fullName,
          nip: student.studentId,
          role: 'SISWA',
          status: 'ACTIVE' // Students are assumed active if they exist
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak aktif'
      });
    }

    // Attach user info ke request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error dalam verifikasi token'
    });
  }
};

/**
 * Middleware untuk authorization berdasarkan role
 * @param {Array} allowedRoles - Array of allowed roles ['ADMIN', 'GURU']
 */
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses untuk resource ini'
      });
    }

    next();
  };
};

/**
 * Middleware khusus untuk admin only
 */
export const adminOnly = authorizeRoles(['ADMIN']);

/**
 * Middleware untuk admin dan guru
 */
export const adminAndGuru = authorizeRoles(['ADMIN', 'GURU']);

/**
 * Helper function untuk require specific roles
 * @param {Array} roles - Array of required roles
 */
export const requireRole = (roles) => {
  return authorizeRoles(roles);
};

/**
 * Optional auth - tidak wajib login tapi kalau ada token akan di-verify
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cari user di tabel users atau students
    let user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true
      }
    });

    // Jika tidak ditemukan di users, coba cari di students
    if (!user) {
      const student = await prisma.student.findUnique({
        where: { id: decoded.userId },
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
      });

      if (student) {
        user = {
          id: student.id,
          email: null,
          fullName: student.fullName,
          nip: student.studentId,
          role: 'SISWA',
          status: 'ACTIVE'
        };
      }
    }

    req.user = user && user.status === 'ACTIVE' ? user : null;
    next();

  } catch (error) {
    // Jika error, set user null dan lanjut
    req.user = null;
    next();
  }
};

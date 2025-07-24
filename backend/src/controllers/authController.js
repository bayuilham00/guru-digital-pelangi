// Authentication Controller
// Handles login, register, profile management
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Login dengan NIP (Guru/Admin) atau NISN (Siswa)
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Cek apakah identifier adalah NIP (untuk guru/admin) atau NISN (untuk siswa)
    let user = null;
    let userType = null;

    // Coba cari di tabel users (guru/admin) berdasarkan NIP atau email
    if (identifier.length >= 15) { // NIP biasanya 18 digit
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { nip: identifier },
            { email: identifier }
          ]
        }
      });
      userType = 'user';
    } else {
      // Coba cari di tabel students berdasarkan NISN
      const student = await prisma.student.findUnique({
        where: { studentId: identifier },
        include: { class: true }
      });
      
      if (student) {
        // Untuk siswa, password default adalah NISN mereka
        if (password === student.studentId) {
          return res.json({
            success: true,
            message: 'Login berhasil',
            data: {
              user: {
                id: student.id,
                name: student.fullName,
                identifier: student.studentId,
                role: 'SISWA',
                class: student.class?.name || null
              },
              token: generateToken(student.id)
            }
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'Password salah'
          });
        }
      }
      
      // Jika tidak ditemukan di students, coba di users dengan email
      user = await prisma.user.findUnique({
        where: { email: identifier }
      });
      userType = 'user';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'NIP/NISN/Email tidak ditemukan'
      });
    }

    // Verify password untuk user (guru/admin)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password salah'
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak aktif'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          nip: user.nip,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat login'
    });
  }
};

/**
 * Register user baru (admin/guru)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, fullName, nip, password, role = 'GURU' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { nip: nip || undefined }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email atau NIP sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        nip,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        nip: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat registrasi'
    });
  }
};

/**
 * Get user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    let user = null;
    
    // Cek apakah user adalah siswa atau guru/admin
    if (req.user.role === 'SISWA') {
      // Untuk siswa, ambil data dari tabel students
      const student = await prisma.student.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          class: {
            select: {
              name: true,
              gradeLevel: true
            }
          },
          createdAt: true,
          updatedAt: true
        }
      });

      if (student) {
        user = {
          id: student.id,
          email: student.email,
          fullName: student.fullName,
          nip: student.studentId,
          role: 'SISWA',
          status: 'ACTIVE',
          class: student.class,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt
        };
      }
    } else {
      // Untuk guru/admin, ambil data dari tabel users
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          nip: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil profile'
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    let updatedUser = null;

    if (req.user.role === 'SISWA') {
      // Untuk siswa, update di tabel students
      const student = await prisma.student.update({
        where: { id: req.user.id },
        data: {
          fullName,
          email
        },
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          class: {
            select: {
              name: true,
              gradeLevel: true
            }
          },
          updatedAt: true
        }
      });

      updatedUser = {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        nip: student.studentId,
        role: 'SISWA',
        status: 'ACTIVE',
        class: student.class,
        updatedAt: student.updatedAt
      };
    } else {
      // Untuk guru/admin, update di tabel users
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          fullName,
          email
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          nip: true,
          role: true,
          status: true,
          updatedAt: true
        }
      });
    }

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat update profile'
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengubah password'
    });
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token diperlukan'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate new token
    const newToken = generateToken(decoded.userId);

    res.json({
      success: true,
      data: { token: newToken }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    console.log('🔐 Logout request received');
    
    // Since we're using stateless JWT tokens, logout is mainly client-side
    // We just return success response
    // In a more advanced implementation, we could:
    // 1. Add token to blacklist
    // 2. Log the logout activity
    // 3. Clear any server-side sessions
    
    res.json({
      success: true,
      message: 'Logout berhasil'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

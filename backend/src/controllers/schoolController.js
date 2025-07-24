// School Controller
// Handles CRUD operations for schools
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all schools
 * GET /api/schools
 */
export const getSchools = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    // Get schools with pagination
    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              gradeLevel: true,
              studentCount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.school.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        schools,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data sekolah'
    });
  }
};

/**
 * Get school by ID
 * GET /api/schools/:id
 */
export const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: { students: true }
            }
          }
        }
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Sekolah tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: { school }
    });

  } catch (error) {
    console.error('Get school by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat mengambil data sekolah'
    });
  }
};

/**
 * Create new school
 * POST /api/schools
 */
export const createSchool = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;

    const school = await prisma.school.create({
      data: {
        name,
        address,
        phone,
        email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sekolah berhasil dibuat',
      data: { school }
    });

  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat membuat sekolah'
    });
  }
};

/**
 * Update school
 * PUT /api/schools/:id
 */
export const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id }
    });

    if (!existingSchool) {
      return res.status(404).json({
        success: false,
        message: 'Sekolah tidak ditemukan'
      });
    }

    const school = await prisma.school.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email
      }
    });

    res.json({
      success: true,
      message: 'Sekolah berhasil diupdate',
      data: { school }
    });

  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat update sekolah'
    });
  }
};

/**
 * Delete school
 * DELETE /api/schools/:id
 */
export const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id },
      include: {
        classes: true
      }
    });

    if (!existingSchool) {
      return res.status(404).json({
        success: false,
        message: 'Sekolah tidak ditemukan'
      });
    }

    // Check if school has classes
    if (existingSchool.classes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus sekolah yang masih memiliki kelas'
      });
    }

    await prisma.school.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Sekolah berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saat menghapus sekolah'
    });
  }
};

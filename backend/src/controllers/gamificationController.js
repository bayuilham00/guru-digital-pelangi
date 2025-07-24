// Gamification Controller for Guru Digital Pelangi
// Handles XP, badges, challenges, and student achievements

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get gamification dashboard data
export const getDashboard = async (req, res) => {
  try {
    // Get total students with XP data
    const totalStudents = await prisma.student.count({
      where: { status: 'ACTIVE' }
    });

    // Get total badges
    const totalBadges = await prisma.badge.count({
      where: { isActive: true }
    });

    // Get active challenges
    const activeChallenges = await prisma.challenge.count({
      where: { 
        isActive: true,
        endDate: { gte: new Date() }
      }
    });

    // Get top students by XP
    const topStudents = await prisma.student.findMany({
      take: 10,
      include: {
        studentXp: true,
        class: true
      },
      orderBy: {
        studentXp: {
          totalXp: 'desc'
        }
      }
    });

    // Get recent achievements
    const recentAchievements = await prisma.studentAchievement.findMany({
      take: 10,
      include: {
        student: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalBadges,
          activeChallenges
        },
        topStudents,
        recentAchievements
      }
    });
  } catch (error) {
    console.error('Error getting gamification dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data dashboard gamifikasi'
    });
  }
};

// Get all students with XP data
export const getStudentsWithXP = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      include: {
        studentXp: true,
        class: true,
        studentBadges: {
          include: {
            badge: true
          }
        }
      },
      orderBy: {
        studentXp: {
          totalXp: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error getting students with XP:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data siswa'
    });
  }
};

// Get all badges
export const getBadges = async (req, res) => {
  try {
    console.log('Getting badges from database...');
    
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      include: {
        studentBadges: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${badges.length} badges for API response`);

    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data badge'
    });
  }
};

// Create new badge
export const createBadge = async (req, res) => {
  try {
    const { name, description, icon, xpReward, criteria } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Nama dan deskripsi badge harus diisi'
      });
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        icon: icon || '🏆',
        xpReward: parseInt(xpReward) || 0,
        criteria,
        isActive: true
      }
    });

    res.json({
      success: true,
      data: badge,
      message: 'Badge berhasil dibuat'
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat badge'
    });
  }
};

// Update badge
export const updateBadge = async (req, res) => {
  try {
    console.log('=== updateBadge called ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    const { id } = req.params;
    const { name, description, icon, xpReward } = req.body;

    console.log('Extracted data:', { id, name, description, icon, xpReward });

    if (!name || !description) {
      console.log('Validation failed: missing name or description');
      return res.status(400).json({
        success: false,
        error: 'Nama dan deskripsi badge harus diisi'
      });
    }

    console.log('About to update badge in database...');
    const updatedBadge = await prisma.badge.update({
      where: { id },
      data: {
        name,
        description,
        icon: icon || '🏆',
        xpReward: parseInt(xpReward) || 0
      }
    });

    console.log('Badge updated successfully:', updatedBadge.id);
    res.json({
      success: true,
      data: updatedBadge,
      message: 'Badge berhasil diperbarui'
    });
  } catch (error) {
    console.error('=== Error in updateBadge ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Gagal memperbarui badge'
    });
  }
};

// Delete badge
export const deleteBadge = async (req, res) => {
  try {
    console.log('=== deleteBadge called ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    
    const { id } = req.params;
    console.log('Badge ID to delete:', id);

    // Check if badge is being used by students
    console.log('Checking badge usage...');
    const badgeUsage = await prisma.studentBadge.count({
      where: { badgeId: id }
    });

    console.log('Badge usage count:', badgeUsage);

    if (badgeUsage > 0) {
      console.log('Badge has usage, cannot delete');
      return res.status(400).json({
        success: false,
        error: 'Badge tidak dapat dihapus karena sedang digunakan oleh siswa'
      });
    }

    console.log('About to delete badge from database...');
    await prisma.badge.delete({
      where: { id }
    });

    console.log('Badge deleted successfully');
    res.json({
      success: true,
      message: 'Badge berhasil dihapus'
    });
  } catch (error) {
    console.error('=== Error in deleteBadge ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      // Record not found
      return res.status(404).json({
        success: false,
        error: 'Badge tidak ditemukan'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus badge'
    });
  }
};

// Get all challenges
export const getChallenges = async (req, res) => {
  try {
    console.log('🔍 Fetching challenges with participant counts...');
    
    const challenges = await prisma.challenge.findMany({
      include: {
        participations: {
          include: {
            student: {
              include: {
                class: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            fullName: true
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add participant count to each challenge
    const challengesWithCount = challenges.map(challenge => ({
      ...challenge,
      participantCount: challenge._count.participations,
      // Parse targetData for better display
      targetData: challenge.targetData ? 
        (typeof challenge.targetData === 'string' ? 
          JSON.parse(challenge.targetData) : challenge.targetData) 
        : null
    }));

    console.log(`✅ Found ${challenges.length} challenges`);

    res.json({
      success: true,
      data: challengesWithCount
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data challenge'
    });
  }
};

// Create new challenge
export const createChallenge = async (req, res) => {
  try {
    const { title, description, duration, targetType, specificClass, xpReward } = req.body;
    const userId = req.user?.id; // From auth middleware

    console.log('🎯 Creating challenge with data:', {
      title, description, duration, targetType, specificClass, xpReward
    });

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Judul dan deskripsi challenge harus diisi'
      });
    }

    // Convert duration to number, allow empty/null duration
    let challengeDuration = null;
    let endDate = null;
    
    if (duration && duration !== '') {
      challengeDuration = parseInt(duration);
      if (challengeDuration > 0) {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + challengeDuration);
      }
    }

    // Prepare targetData based on targetType and specificClass
    let targetData = null;
    if ((targetType === 'SPECIFIC_CLASSES' || targetType === 'SPECIFIC_CLASS') && specificClass) {
      targetData = JSON.stringify({ class: specificClass });
    }

    console.log('📝 Challenge data to create:', {
      targetType,
      targetData,
      challengeDuration,
      endDate
    });

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        duration: challengeDuration,
        targetType: targetType || 'ALL_STUDENTS',
        targetData: targetData,
        xpReward: parseInt(xpReward) || 0,
        endDate,
        createdBy: userId || 'system',
        isActive: true
      }
    });

    console.log('✅ Challenge created:', challenge.id);

    // 🎯 AUTO-ENROLL STUDENTS BASED ON TARGET
    let enrolledStudents = [];
    
    if (targetType === 'SPECIFIC_CLASSES' || targetType === 'SPECIFIC_CLASS') {
      // Get students from specific class
      console.log(`🔍 Finding students in class: ${specificClass}`);
      
      const studentsInClass = await prisma.student.findMany({
        where: {
          class: {
            name: specificClass // Query by class name, not kelas field
          },
          status: 'ACTIVE'
        },
        include: {
          class: true
        }
      });

      console.log(`👥 Found ${studentsInClass.length} students in class ${specificClass}`);

      // Create participation records for all students in the class
      if (studentsInClass.length > 0) {
        const participationData = studentsInClass.map(student => ({
          challengeId: challenge.id,
          studentId: student.id,
          status: 'ACTIVE',
          progress: 0
        }));

        await prisma.challengeParticipation.createMany({
          data: participationData
        });

        enrolledStudents = studentsInClass;
        console.log(`✅ Auto-enrolled ${studentsInClass.length} students to challenge`);
      }
    } else if (targetType === 'ALL_STUDENTS') {
      // Get all active students
      console.log('🔍 Finding all active students');
      
      const allStudents = await prisma.student.findMany({
        where: {
          status: 'ACTIVE'
        }
      });

      console.log(`👥 Found ${allStudents.length} active students`);

      // Create participation records for all students
      if (allStudents.length > 0) {
        const participationData = allStudents.map(student => ({
          challengeId: challenge.id,
          studentId: student.id,
          status: 'ACTIVE',
          progress: 0
        }));

        await prisma.challengeParticipation.createMany({
          data: participationData
        });

        enrolledStudents = allStudents;
        console.log(`✅ Auto-enrolled ${allStudents.length} students to challenge`);
      }
    }

    // Get updated challenge with participant count
    const challengeWithCount = await prisma.challenge.findUnique({
      where: { id: challenge.id },
      include: {
        _count: {
          select: {
            participations: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        ...challengeWithCount,
        participantCount: challengeWithCount._count.participations,
        enrolledStudents: enrolledStudents.length
      },
      message: `Challenge berhasil dibuat dan ${enrolledStudents.length} siswa telah didaftarkan`
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat challenge'
    });
  }
};

// Give reward to student (XP or Badge)
export const giveRewardToStudent = async (req, res) => {
  try {
    console.log('Give reward request body:', req.body);
    const { studentId, type, xpAmount, badgeId, description } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!studentId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Student ID dan tipe reward harus diisi'
      });
    }

    console.log(`Processing ${type} reward for student ${studentId}`);

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { studentXp: true }
    });

    if (!student) {
      console.log(`Student ${studentId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Siswa tidak ditemukan'
      });
    }

    console.log('Student found:', student.fullName);

    if (type === 'xp') {
      // Give XP reward
      const xpToAdd = parseInt(xpAmount) || 0;
      console.log(`Adding ${xpToAdd} XP to student`);
      
      if (student.studentXp) {
        // Update existing XP record
        const newTotalXp = student.studentXp.totalXp + xpToAdd;
        console.log(`Updating XP from ${student.studentXp.totalXp} to ${newTotalXp}`);
        
        await prisma.studentXp.update({
          where: { studentId },
          data: {
            totalXp: newTotalXp
          }
        });

        // Calculate and update student level
        await calculateStudentLevel(studentId, newTotalXp);
      } else {
        // Create new XP record
        console.log('Creating new XP record');
        await prisma.studentXp.create({
          data: {
            studentId,
            totalXp: xpToAdd,
            level: 1,
            levelName: 'Pemula'
          }
        });

        // Calculate and update student level
        await calculateStudentLevel(studentId, xpToAdd);
      }

      // Create achievement record
      await prisma.studentAchievement.create({
        data: {
          studentId,
          type: 'XP_REWARD',
          title: 'Bonus XP',
          description: description || `Mendapat ${xpToAdd} XP`,
          xpReward: xpToAdd
        }
      });

      console.log('XP reward processed successfully');

    } else if (type === 'badge') {
      // Give badge reward
      if (!badgeId) {
        return res.status(400).json({
          success: false,
          error: 'Badge ID harus diisi'
        });
      }

      console.log(`Processing badge reward: ${badgeId}`);

      // Check if badge exists
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        console.log(`Badge ${badgeId} not found`);
        return res.status(404).json({
          success: false,
          error: 'Badge tidak ditemukan'
        });
      }

      // Award badge
      await prisma.studentBadge.create({
        data: {
          studentId,
          badgeId,
          awardedBy: userId,
          reason: description || 'Diberikan oleh guru'
        }
      });

      console.log('Badge reward processed successfully');
    }

    res.json({
      success: true,
      message: 'Reward berhasil diberikan'
    });
  } catch (error) {
    console.error('Error giving reward:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Gagal memberikan reward: ' + error.message
    });
  }
};

// Get gamification settings
export const getGamificationSettings = async (req, res) => {
  try {
    const settings = await prisma.gamificationSettings.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting gamification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil pengaturan gamifikasi'
    });
  }
};

// Create gamification settings
export const createGamificationSettings = async (req, res) => {
  try {
    const {
      name,
      description,
      xpPerGrade,
      xpAttendanceBonus,
      xpAbsentPenalty,
      levelThresholds
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nama pengaturan harus diisi'
      });
    }

    const settings = await prisma.gamificationSettings.create({
      data: {
        name,
        description,
        xpPerGrade: parseInt(xpPerGrade) || 1,
        xpAttendanceBonus: parseInt(xpAttendanceBonus) || 10,
        xpAbsentPenalty: parseInt(xpAbsentPenalty) || 5,
        levelThresholds: levelThresholds || {
          levels: [
            { level: 1, name: 'Pemula', xp: 0 },
            { level: 2, name: 'Berkembang', xp: 100 },
            { level: 3, name: 'Mahir', xp: 300 },
            { level: 4, name: 'Ahli', xp: 600 },
            { level: 5, name: 'Master', xp: 1000 }
          ]
        },
        isActive: true
      }
    });

    res.json({
      success: true,
      data: settings,
      message: 'Pengaturan gamifikasi berhasil dibuat'
    });
  } catch (error) {
    console.error('Error creating gamification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat pengaturan gamifikasi'
    });
  }
};

// Update gamification settings
export const updateGamificationSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      xpPerGrade,
      xpAttendanceBonus,
      xpAbsentPenalty,
      levelThresholds,
      isActive
    } = req.body;

    const settings = await prisma.gamificationSettings.update({
      where: { id },
      data: {
        name,
        description,
        xpPerGrade: parseInt(xpPerGrade),
        xpAttendanceBonus: parseInt(xpAttendanceBonus),
        xpAbsentPenalty: parseInt(xpAbsentPenalty),
        levelThresholds,
        isActive
      }
    });

    res.json({
      success: true,
      data: settings,
      message: 'Pengaturan gamifikasi berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating gamification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memperbarui pengaturan gamifikasi'
    });
  }
};

// Get student achievements
export const getStudentAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;

    const achievements = await prisma.studentAchievement.findMany({
      where: studentId ? { studentId } : {},
      include: {
        student: {
          include: {
            class: true
          }
        }
      },
      orderBy: { earnedAt: 'desc' }
    });

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error getting student achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil pencapaian siswa'
    });
  }
};

// Update student level based on XP
export const updateStudentLevel = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student XP
    const studentXp = await prisma.studentXp.findUnique({
      where: { studentId }
    });

    if (!studentXp) {
      return res.status(404).json({
        success: false,
        error: 'Data XP siswa tidak ditemukan'
      });
    }

    // Get gamification settings
    const settings = await prisma.gamificationSettings.findFirst({
      where: { isActive: true }
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Pengaturan gamifikasi tidak ditemukan'
      });
    }

    // Calculate new level based on XP
    const levels = settings.levelThresholds.levels;
    let newLevel = 1;
    let newLevelName = 'Pemula';

    for (let i = levels.length - 1; i >= 0; i--) {
      if (studentXp.totalXp >= levels[i].xp) {
        newLevel = levels[i].level;
        newLevelName = levels[i].name;
        break;
      }
    }

    // Update student level
    const updatedXp = await prisma.studentXp.update({
      where: { studentId },
      data: {
        level: newLevel,
        levelName: newLevelName
      }
    });

    res.json({
      success: true,
      data: updatedXp,
      message: 'Level siswa berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating student level:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memperbarui level siswa'
    });
  }
};

// Get student XP
export const getStudentXp = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentXp = await prisma.studentXp.findUnique({
      where: { studentId },
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    });

    if (!studentXp) {
      return res.status(404).json({
        success: false,
        error: 'Data XP siswa tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: studentXp
    });
  } catch (error) {
    console.error('Error getting student XP:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data XP siswa'
    });
  }
};

// Get class leaderboard
export const getClassLeaderboard = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit = 20 } = req.query;

    const students = await prisma.student.findMany({
      where: {
        classId,
        status: 'ACTIVE'
      },
      include: {
        studentXp: true,
        class: true
      },
      orderBy: {
        studentXp: {
          totalXp: 'desc'
        }
      },
      take: parseInt(limit)
    });

    // Add rank to each student
    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      student: {
        id: student.id,
        fullName: student.fullName,
        studentId: student.studentId
      },
      totalXp: student.studentXp?.totalXp || 0,
      level: student.studentXp?.level || 1,
      levelName: student.studentXp?.levelName || 'Pemula',
      attendanceStreak: student.studentXp?.attendanceStreak || 0,
      assignmentStreak: student.studentXp?.assignmentStreak || 0
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting class leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil leaderboard kelas'
    });
  }
};

// Award achievement to student
export const awardAchievement = async (req, res) => {
  try {
    const { studentId, type, title, description, xpReward } = req.body;

    if (!studentId || !type || !title) {
      return res.status(400).json({
        success: false,
        error: 'Student ID, tipe, dan judul achievement harus diisi'
      });
    }

    // Create achievement
    const achievement = await prisma.studentAchievement.create({
      data: {
        studentId,
        type,
        title,
        description,
        xpReward: parseInt(xpReward) || 0
      }
    });

    // Add XP if specified
    if (xpReward && xpReward > 0) {
      const studentXp = await prisma.studentXp.findUnique({
        where: { studentId }
      });

      if (studentXp) {
        await prisma.studentXp.update({
          where: { studentId },
          data: {
            totalXp: {
              increment: parseInt(xpReward)
            }
          }
        });
      } else {
        await prisma.studentXp.create({
          data: {
            studentId,
            totalXp: parseInt(xpReward),
            level: 1,
            levelName: 'Pemula'
          }
        });
      }
    }

    res.json({
      success: true,
      data: achievement,
      message: 'Achievement berhasil diberikan'
    });
  } catch (error) {
    console.error('Error awarding achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memberikan achievement'
    });
  }
};

// Get all students leaderboard across the system
export const getAllStudentsLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    console.log('🔍 Fetching all students for leaderboard...');

    const students = await prisma.student.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        studentXp: true,
        class: {
          include: {
            subject: true
          }
        },
        _count: {
          select: {
            achievements: true
          }
        }
      }
    });

    console.log(`📊 Found ${students.length} active students`);

    // Sort students by XP in descending order (highest XP first)
    const sortedStudents = students.sort((a, b) => {
      const xpA = a.studentXp?.totalXp || 0;
      const xpB = b.studentXp?.totalXp || 0;
      return xpB - xpA; // Descending order
    });

    // Apply limit after sorting
    const limitedStudents = sortedStudents.slice(0, parseInt(limit));

    // Add rank to each student and format data
    const leaderboard = limitedStudents.map((student, index) => ({
      id: student.id,
      studentId: student.studentId,
      fullName: student.fullName,
      className: `${student.class?.name || 'No Class'}${student.class?.subject?.name ? ` - ${student.class.subject.name}` : ''}`,
      totalXp: student.studentXp?.totalXp || 0,
      level: student.studentXp?.level || 1,
      levelName: student.studentXp?.levelName || 'Pemula',
      badgeCount: student._count.achievements || 0,
      rank: index + 1
    }));

    console.log(`✅ Returning ${leaderboard.length} students in leaderboard`);
    console.log('Top 3 students:', leaderboard.slice(0, 3).map(s => `${s.fullName}: ${s.totalXp} XP`));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting all students leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil leaderboard seluruh siswa'
    });
  }
};

// Get all levels
export const getLevels = async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    });

    res.json({
      success: true,
      data: levels
    });
  } catch (error) {
    console.error('Error getting levels:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data level'
    });
  }
};

// Create new level
export const createLevel = async (req, res) => {
  try {
    const { level, name, xpRequired, benefits } = req.body;

    if (!level || !name || xpRequired === undefined || !benefits) {
      return res.status(400).json({
        success: false,
        error: 'Semua field level harus diisi'
      });
    }

    const newLevel = await prisma.level.create({
      data: {
        level: parseInt(level),
        name,
        xpRequired: parseInt(xpRequired),
        benefits
      }
    });

    res.json({
      success: true,
      data: newLevel,
      message: 'Level berhasil dibuat'
    });
  } catch (error) {
    console.error('Error creating level:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat level'
    });
  }
};

// Update level
export const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, xpRequired, benefits } = req.body;

    if (!name || xpRequired === undefined || !benefits) {
      return res.status(400).json({
        success: false,
        error: 'Nama, XP required, dan benefits harus diisi'
      });
    }

    if (xpRequired < 0) {
      return res.status(400).json({
        success: false,
        error: 'XP tidak boleh negatif'
      });
    }

    const updatedLevel = await prisma.level.update({
      where: { id },
      data: {
        name,
        xpRequired: parseInt(xpRequired),
        benefits
      }
    });

    res.json({
      success: true,
      data: updatedLevel,
      message: 'Level berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memperbarui level'
    });
  }
};

// Delete level
export const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's a system level (level 1-10)
    const levelData = await prisma.level.findUnique({
      where: { id },
      select: { level: true }
    });

    if (levelData && levelData.level <= 10) {
      return res.status(400).json({
        success: false,
        error: 'Level sistem tidak dapat dihapus'
      });
    }

    await prisma.level.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Level berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting level:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus level'
    });
  }
};

// Function to calculate and update student level based on XP
export const calculateStudentLevel = async (studentId, totalXp) => {
  try {
    console.log(`Calculating level for student ${studentId} with ${totalXp} XP`);
    
    // Get all levels ordered by XP requirement
    const levels = await prisma.level.findMany({
      where: { isActive: true },
      orderBy: { xpRequired: 'desc' }
    });

    console.log(`Found ${levels.length} levels in database`);

    // If no levels exist, create default ones first
    if (levels.length === 0) {
      console.log('No levels found, creating default levels');
      await createDefaultLevels();
      
      // Refetch levels after creating defaults
      const newLevels = await prisma.level.findMany({
        where: { isActive: true },
        orderBy: { xpRequired: 'desc' }
      });
      
      console.log(`Created ${newLevels.length} default levels`);
      
      // Find appropriate level from new levels
      let currentLevel = newLevels.find(level => totalXp >= level.xpRequired);
      
      if (!currentLevel) {
        currentLevel = newLevels.find(level => level.level === 1);
      }
      
      if (currentLevel) {
        console.log(`Selected level: ${currentLevel.level} - ${currentLevel.name}`);
        
        // Update student's level
        await prisma.studentXp.update({
          where: { studentId },
          data: {
            level: currentLevel.level,
            levelName: currentLevel.name
          }
        });
        
        return currentLevel;
      }
    }

    // Find the appropriate level for the student's XP
    let currentLevel = levels.find(level => totalXp >= level.xpRequired);
    
    // If no level found, default to level 1
    if (!currentLevel) {
      console.log('No appropriate level found, defaulting to level 1');
      currentLevel = levels.find(level => level.level === 1);
    }

    // Final safety check
    if (!currentLevel) {
      console.error('No level found even after creating defaults - this should not happen');
      throw new Error('Unable to determine student level');
    }

    console.log(`Selected level: ${currentLevel.level} - ${currentLevel.name}`);

    // Update student's level
    if (currentLevel) {
      await prisma.studentXp.update({
        where: { studentId },
        data: {
          level: currentLevel.level,
          levelName: currentLevel.name
        }
      });
    } else {
      console.error('No current level found even after creating defaults');
      throw new Error('Failed to determine student level');
    }

    return currentLevel;
  } catch (error) {
    console.error('Error calculating student level:', error);
    throw error;
  }
};

// Function to create default levels if none exist
const createDefaultLevels = async () => {
  const defaultLevels = [
    { level: 1, name: 'Pemula', xpRequired: 0, benefits: 'Akses dasar ke semua fitur' },
    { level: 2, name: 'Berkembang', xpRequired: 100, benefits: 'Akses ke quiz tambahan' },
    { level: 3, name: 'Mahir', xpRequired: 300, benefits: 'Akses ke materi advanced' },
    { level: 4, name: 'Ahli', xpRequired: 600, benefits: 'Akses ke proyek khusus' },
    { level: 5, name: 'Master', xpRequired: 1000, benefits: 'Akses ke semua fitur premium' },
    { level: 6, name: 'Grandmaster', xpRequired: 1500, benefits: 'Akses mentor untuk siswa lain' },
    { level: 7, name: 'Legend', xpRequired: 2200, benefits: 'Akses ke kompetisi eksklusif' },
    { level: 8, name: 'Mythic', xpRequired: 3000, benefits: 'Akses ke program beasiswa' },
    { level: 9, name: 'Divine', xpRequired: 4000, benefits: 'Akses ke universitas partner' },
    { level: 10, name: 'Immortal', xpRequired: 5500, benefits: 'Status legend sekolah' }
  ];

  for (const levelData of defaultLevels) {
    await prisma.level.create({ data: levelData });
  }
  
  console.log('Default levels created successfully');
};

// Get challenge participants
export const getChallengeParticipants = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const participants = await prisma.challengeParticipation.findMany({
      where: { challengeId },
      include: {
        student: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        participants
      }
    });
  } catch (error) {
    console.error('Error getting challenge participants:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data peserta challenge'
    });
  }
};

// Mark challenge participant as completed (Teacher-managed workflow)
export const markChallengeCompleted = async (req, res) => {
  try {
    const { participantId } = req.params;

    // Get the participation record
    const participation = await prisma.challengeParticipation.findUnique({
      where: { id: participantId },
      include: {
        challenge: true,
        student: {
          include: {
            studentXp: true
          }
        }
      }
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        error: 'Data partisipasi tidak ditemukan'
      });
    }

    // Check if already completed
    if (participation.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Challenge sudah ditandai sebagai selesai'
      });
    }

    // Update participation status to completed
    const updatedParticipation = await prisma.challengeParticipation.update({
      where: { id: participantId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        progress: 100
      }
    });

    // Award XP to student
    if (participation.challenge.xpReward > 0) {
      await prisma.studentXp.upsert({
        where: { studentId: participation.studentId },
        create: {
          studentId: participation.studentId,
          totalXp: participation.challenge.xpReward,
          level: 1,
          levelName: 'Pemula'
        },
        update: {
          totalXp: {
            increment: participation.challenge.xpReward
          }
        }
      });

      // Update level if necessary (simple level calculation)
      const updatedXp = await prisma.studentXp.findUnique({
        where: { studentId: participation.studentId }
      });

      if (updatedXp) {
        const newLevel = Math.floor(updatedXp.totalXp / 100) + 1;
        const levelNames = ['Pemula', 'Berkembang', 'Mahir', 'Ahli', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'Immortal', 'Divine'];
        const levelName = levelNames[Math.min(newLevel - 1, levelNames.length - 1)];

        if (newLevel > updatedXp.level) {
          await prisma.studentXp.update({
            where: { studentId: participation.studentId },
            data: {
              level: newLevel,
              levelName
            }
          });
        }
      }
    }

    // 🔥 AUTO-DETECTION: Check if all participants have completed the challenge
    const allParticipants = await prisma.challengeParticipation.findMany({
      where: { challengeId: participation.challengeId }
    });

    const completedParticipants = allParticipants.filter(p => p.status === 'COMPLETED');
    const allCompleted = completedParticipants.length === allParticipants.length;

    console.log(`🎯 Auto-detection: ${completedParticipants.length}/${allParticipants.length} participants completed`);

    let autoCompletionTriggered = false;
    if (allCompleted && allParticipants.length > 0) {
      console.log('🎉 All participants completed! Triggering automatic challenge finalization...');
      
      // Check if challenge is still ACTIVE (not already finalized)
      const currentChallenge = await prisma.challenge.findUnique({
        where: { id: participation.challengeId }
      });

      if (currentChallenge && currentChallenge.status === 'ACTIVE') {
        // Trigger automatic completion (NO additional XP - already distributed individually)
        try {
          await prisma.challenge.update({
            where: { id: participation.challengeId },
            data: {
              status: 'COMPLETED',
              endedAt: new Date()
            }
          });
          
          autoCompletionTriggered = true;
          console.log('✅ Challenge automatically completed and finalized! (XP already distributed to completed participants)');
        } catch (autoCompletionError) {
          console.error('Error in auto-completion:', autoCompletionError);
        }
      }
    }

    res.json({
      success: true,
      data: {
        participation: updatedParticipation,
        message: 'Challenge berhasil ditandai sebagai selesai',
        autoCompleted: autoCompletionTriggered,
        allParticipantsCompleted: allCompleted,
        completionStats: {
          completed: completedParticipants.length,
          total: allParticipants.length
        }
      }
    });
  } catch (error) {
    console.error('Error marking challenge as completed:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menandai challenge sebagai selesai'
    });
  }
};

// Complete entire challenge (when all participants are done)
export const completeChallengeFinalization = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { confirmed } = req.body;

    console.log('🎯 Finalizing challenge completion:', challengeId);

    // Get challenge with participants
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participations: {
          include: {
            student: {
              include: {
                studentXp: true
              }
            }
          }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge tidak ditemukan'
      });
    }

    // Check if all participants are completed
    const totalParticipants = challenge.participations.length;
    const completedParticipants = challenge.participations.filter(p => p.status === 'COMPLETED').length;

    if (completedParticipants !== totalParticipants) {
      return res.status(400).json({
        success: false,
        error: `Belum semua siswa menyelesaikan challenge. ${completedParticipants}/${totalParticipants} selesai.`
      });
    }

    if (!confirmed) {
      // Return data for confirmation dialog
      return res.json({
        success: true,
        requiresConfirmation: true,
        data: {
          challenge: {
            id: challenge.id,
            title: challenge.title,
            xpReward: challenge.xpReward
          },
          participants: challenge.participations.map(p => ({
            id: p.student.id,
            name: p.student.fullName,
            currentXp: p.student.studentXp?.totalXp || 0
          })),
          totalParticipants,
          totalXpToDistribute: challenge.xpReward * totalParticipants
        },
        message: 'Semua siswa telah menyelesaikan challenge. Konfirmasi untuk membagikan XP?'
      });
    }

    // Confirmed - proceed with challenge finalization (NO additional XP)
    console.log('✅ Finalizing challenge completion (XP already distributed individually)...');

    const participationSummary = [];
    for (const participation of challenge.participations) {
      participationSummary.push({
        studentId: participation.studentId,
        studentName: participation.student.fullName,
        status: participation.status,
        xpEarned: participation.status === 'COMPLETED' ? challenge.xpReward : 0,
        currentTotalXp: participation.student.studentXp?.totalXp || 0
      });
    }

    // Mark challenge as completed (update status and endedAt)
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date()
      }
    });

    const completedCount = challenge.participations.filter(p => p.status === 'COMPLETED').length;

    console.log(`🎉 Challenge finalized! ${completedCount}/${totalParticipants} students completed (XP already distributed)`);

    res.json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          title: challenge.title,
          status: 'COMPLETED',
          endedAt: new Date()
        },
        participationSummary,
        completedCount,
        totalParticipants
      },
      message: `Challenge berhasil diselesaikan! ${completedCount} dari ${totalParticipants} siswa menyelesaikan challenge.`
    });
  } catch (error) {
    console.error('Error completing challenge finalization:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menyelesaikan challenge'
    });
  }
};

// Complete challenge by deadline (students who haven't completed get no XP)
export const completeChallengeBulk = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { reason = 'DEADLINE' } = req.body; // DEADLINE, MANUAL, etc.

    console.log('🕰️ Completing challenge by deadline:', challengeId);

    // Get challenge with participants
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participations: {
          include: {
            student: {
              include: {
                studentXp: true
              }
            }
          }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge tidak ditemukan'
      });
    }

    if (challenge.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Challenge sudah selesai'
      });
    }

    // Separate completed and incomplete participants
    const completedParticipants = challenge.participations.filter(p => p.status === 'COMPLETED');
    const incompleteParticipants = challenge.participations.filter(p => p.status !== 'COMPLETED');

    // Mark incomplete participants as FAILED (they get no XP)
    for (const participation of incompleteParticipants) {
      await prisma.challengeParticipation.update({
        where: { id: participation.id },
        data: {
          status: 'FAILED',
          completedAt: new Date() // Mark when they were marked as failed
        }
      });
    }

    // Mark challenge as completed
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date()
      }
    });

    const summary = {
      totalParticipants: challenge.participations.length,
      completedCount: completedParticipants.length,
      failedCount: incompleteParticipants.length,
      totalXpDistributed: completedParticipants.length * challenge.xpReward,
      completedStudents: completedParticipants.map(p => ({
        name: p.student.fullName,
        xpEarned: challenge.xpReward,
        totalXp: p.student.studentXp?.totalXp || 0
      })),
      failedStudents: incompleteParticipants.map(p => ({
        name: p.student.fullName,
        xpEarned: 0,
        reason: 'Tidak menyelesaikan sebelum deadline'
      }))
    };

    console.log(`📊 Challenge completed by ${reason}: ${summary.completedCount}/${summary.totalParticipants} students succeeded`);

    res.json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          title: challenge.title,
          status: 'COMPLETED',
          endedAt: new Date(),
          reason
        },
        summary
      },
      message: `Challenge diselesaikan! ${summary.completedCount} siswa berhasil, ${summary.failedCount} siswa tidak mendapat XP.`
    });
  } catch (error) {
    console.error('Error completing challenge by deadline:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menyelesaikan challenge'
    });
  }
};

// Update challenge
export const updateChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { title, description, duration, targetType, specificClass, xpReward } = req.body;

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
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
        error: 'Challenge tidak ditemukan'
      });
    }

    // Check if challenge has participants (restriction for MVP)
    if (existingChallenge._count.participations > 0) {
      return res.status(400).json({
        success: false,
        error: 'Challenge tidak dapat diedit karena sudah ada peserta yang bergabung'
      });
    }

    // Prepare update data
    const updateData = {
      title,
      description,
      xpReward: parseInt(xpReward) || 0,
      targetType: targetType || 'ALL_STUDENTS'
    };

    // Handle duration
    if (duration && duration !== '') {
      const durationNum = parseInt(duration);
      if (!isNaN(durationNum) && durationNum > 0) {
        updateData.duration = durationNum;
        // Recalculate end date
        updateData.endDate = new Date(Date.now() + (durationNum * 24 * 60 * 60 * 1000));
      }
    } else {
      updateData.duration = null;
      updateData.endDate = null;
    }

    // Handle target data
    if (targetType === 'SPECIFIC_CLASS' && specificClass) {
      updateData.targetData = JSON.stringify({ class: specificClass });
    } else {
      updateData.targetData = null;
    }

    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData
    });

    res.json({
      success: true,
      data: {
        challenge: updatedChallenge,
        message: 'Challenge berhasil diupdate'
      }
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengupdate challenge'
    });
  }
};

// Delete a challenge (Admin/Guru only)
export const deleteChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    console.log('🗑️ Deleting challenge:', challengeId);

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participations: true,
        _count: {
          select: { participations: true }
        }
      }
    });

    if (!existingChallenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge tidak ditemukan'
      });
    }

    // Check if challenge has participants (optional restriction)
    if (existingChallenge._count.participations > 0) {
      // For production, you might want to prevent deletion of challenges with participants
      console.log(`⚠️ Deleting challenge with ${existingChallenge._count.participations} participants`);
    }

    // Delete all participations first (cascade delete)
    if (existingChallenge.participations.length > 0) {
      await prisma.challengeParticipation.deleteMany({
        where: { challengeId }
      });
    }

    // Delete the challenge
    await prisma.challenge.delete({
      where: { id: challengeId }
    });

    console.log('✅ Challenge deleted successfully');

    res.json({
      success: true,
      data: {
        message: 'Challenge berhasil dihapus',
        deletedId: challengeId
      }
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus challenge'
    });
  }
};

// Get challenges for student dashboard (with participation data)
export const getStudentChallenges = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log('🔍 Fetching challenges for student:', studentId);

    // Get all active challenges with student participation data
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true
      },
      include: {
        participations: {
          where: {
            studentId: studentId
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response with participation data
    const challengesWithParticipation = challenges.map(challenge => {
      const myParticipation = challenge.participations.length > 0 ? challenge.participations[0] : null;
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        xpReward: challenge.xpReward,
        endDate: challenge.endDate,
        status: challenge.status,
        targetType: challenge.targetType,
        participantCount: challenge._count.participations,
        myParticipation: myParticipation ? {
          id: myParticipation.id,
          status: myParticipation.status,
          progress: myParticipation.progress || 0,
          completedAt: myParticipation.completedAt
        } : null,
        // Parse targetData for better display
        targetData: challenge.targetData ? 
          (typeof challenge.targetData === 'string' ? 
            JSON.parse(challenge.targetData) : challenge.targetData) 
          : null
      };
    });

    console.log(`✅ Found ${challenges.length} challenges for student ${studentId}`);

    res.json({
      success: true,
      data: challengesWithParticipation
    });
  } catch (error) {
    console.error('Error getting student challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data challenge siswa'
    });
  }
};

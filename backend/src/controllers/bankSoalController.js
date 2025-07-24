// Bank Soal Controller
// Handles CRUD operations for Bank Soal module
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================================================
// QUESTIONS OPERATIONS
// ================================================

/**
 * Get all questions with filtering and pagination
 * GET /api/bank-soal/questions
 */
export const getQuestions = async (req, res) => {
  try {
    console.log('📋 Get questions request:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      search, 
      subjectId, 
      topicId,
      categoryId,
      difficulty, 
      gradeLevel, 
      questionType,
      isPublic,
      createdBy 
    } = req.query;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { questionText: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    if (topicId) {
      where.topicId = topicId;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }
    
    if (questionType) {
      where.questionType = questionType;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }
    
    if (createdBy) {
      where.createdBy = createdBy;
    }

    console.log('📋 Where clause:', where);

    // Get questions with pagination
    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        },
        options: true,
        _count: {
          select: {
            questionBanks: true,
            assignmentQuestions: true,
            studentAnswers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Get total count for pagination
    const total = await prisma.question.count({ where });

    console.log(`📋 Found ${questions.length} questions out of ${total} total`);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error getting questions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data soal',
      error: error.message 
    });
  }
};

/**
 * Get single question by ID
 * GET /api/bank-soal/questions/:id
 */
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Get question by ID:', id);

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        },
        options: true,
        _count: {
          select: {
            questionBanks: true,
            assignmentQuestions: true,
            studentAnswers: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Soal tidak ditemukan' 
      });
    }

    console.log('✅ Question found:', question.questionText.substring(0, 50) + '...');

    res.json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error('❌ Error getting question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data soal',
      error: error.message 
    });
  }
};

/**
 * Create new question
 * POST /api/bank-soal/questions
 */
export const createQuestion = async (req, res) => {
  try {
    const { 
      questionText,
      questionType,
      difficulty,
      subjectId,
      topicId,
      categoryId,
      gradeLevel,
      correctAnswer,
      explanation,
      points,
      timeLimit,
      tags,
      isPublic,
      options 
    } = req.body;

    console.log('📝 Create question request:', req.body);

    // Validate required fields
    if (!questionText || !questionType || !subjectId || !gradeLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question text, type, subject, and grade level are required' 
      });
    }

    // For multiple choice questions, validate options
    if ((questionType === 'MULTIPLE_CHOICE' || questionType === 'MULTIPLE_CHOICE_COMPLEX') && (!options || options.length < 2)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Multiple choice questions require at least 2 options' 
      });
    }

    const question = await prisma.question.create({
      data: {
        questionText,
        questionType,
        difficulty: difficulty || 'MEDIUM',
        subjectId,
        topicId,
        categoryId,
        gradeLevel,
        correctAnswer,
        explanation,
        points: points || 1,
        timeLimit,
        tags,
        isPublic: isPublic || false,
        createdBy: req.user.id
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    // If options provided, create them
    if (options && options.length > 0) {
      await prisma.questionOption.createMany({
        data: options.map((option, index) => ({
          questionId: question.id,
          optionText: option.text,
          isCorrect: option.isCorrect || false,
          orderIndex: index
        }))
      });
    }

    console.log('✅ Question created successfully:', question.id);

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal membuat soal',
      error: error.message 
    });
  }
};

/**
 * Update question
 * PUT /api/bank-soal/questions/:id
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      questionText,
      questionType,
      difficulty,
      subjectId,
      topicId,
      categoryId,
      gradeLevel,
      correctAnswer,
      explanation,
      points,
      timeLimit,
      tags,
      isPublic,
      options 
    } = req.body;

    console.log('📝 Update question request:', id, req.body);

    // Check if question exists and user has permission
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: { createdByUser: true }
    });

    if (!existingQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Soal tidak ditemukan' 
      });
    }

    // Only creator or admin can update
    if (existingQuestion.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Anda tidak memiliki akses untuk mengupdate soal ini' 
      });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        questionType,
        difficulty,
        subjectId,
        topicId,
        categoryId,
        gradeLevel,
        correctAnswer,
        explanation,
        points,
        timeLimit,
        tags,
        isPublic
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        },
        options: true
      }
    });

    // Update options if provided
    if (options && options.length > 0) {
      // Delete existing options
      await prisma.questionOption.deleteMany({
        where: { questionId: id }
      });

      // Create new options
      await prisma.questionOption.createMany({
        data: options.map((option, index) => ({
          questionId: id,
          optionText: option.text,
          isCorrect: option.isCorrect || false,
          orderIndex: index
        }))
      });
    }

    console.log('✅ Question updated successfully:', question.id);

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengupdate soal',
      error: error.message 
    });
  }
};

/**
 * Delete question
 * DELETE /api/bank-soal/questions/:id
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete question request:', id);

    // Check if question exists and user has permission
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: { 
        createdByUser: true,
        _count: {
          select: {
            questionBanks: true,
            assignmentQuestions: true,
            studentAnswers: true
          }
        }
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Soal tidak ditemukan' 
      });
    }

    // Only creator or admin can delete
    if (existingQuestion.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Anda tidak memiliki akses untuk menghapus soal ini' 
      });
    }

    // Check if question is used in assignments or answered by students
    if (existingQuestion._count.assignmentQuestions > 0 || existingQuestion._count.studentAnswers > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Soal tidak dapat dihapus karena sedang digunakan dalam tugas atau sudah dijawab siswa' 
      });
    }

    await prisma.question.delete({
      where: { id }
    });

    console.log('✅ Question deleted successfully:', id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus soal',
      error: error.message 
    });
  }
};

// ================================================
// QUESTION BANKS OPERATIONS
// ================================================

/**
 * Get all question banks
 * GET /api/bank-soal/banks
 */
export const getQuestionBanks = async (req, res) => {
  try {
    console.log('📋 Get question banks request:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      search, 
      subjectId, 
      gradeLevel, 
      isPublic,
      createdBy 
    } = req.query;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }
    
    if (createdBy) {
      where.createdBy = createdBy;
    }

    const questionBanks = await prisma.questionBank.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        creator: {
          select: {
            id: true,
            fullName: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Get total count for pagination
    const total = await prisma.questionBank.count({ where });

    console.log(`📋 Found ${questionBanks.length} question banks out of ${total} total`);

    res.json({
      success: true,
      data: questionBanks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error getting question banks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data bank soal',
      error: error.message 
    });
  }
};

/**
 * Get single question bank by ID with questions
 * GET /api/bank-soal/banks/:id
 */
export const getQuestionBankById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Get question bank by ID:', id);

    const questionBank = await prisma.questionBank.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        creator: {
          select: {
            id: true,
            fullName: true
          }
        },
        questions: {
          include: {
            question: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                },
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                topic: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                options: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!questionBank) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bank soal tidak ditemukan' 
      });
    }

    console.log('✅ Question bank found:', questionBank.name);

    res.json({
      success: true,
      data: questionBank
    });

  } catch (error) {
    console.error('❌ Error getting question bank:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data bank soal',
      error: error.message 
    });
  }
};

/**
 * Create new question bank
 * POST /api/bank-soal/banks
 */
export const createQuestionBank = async (req, res) => {
  try {
    const { 
      name,
      description,
      subjectId,
      gradeLevel,
      isPublic
    } = req.body;

    console.log('📝 Create question bank request:', req.body);

    // Validate required fields
    if (!name || !subjectId || !gradeLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, subject, and grade level are required' 
      });
    }

    const questionBank = await prisma.questionBank.create({
      data: {
        name,
        description,
        subjectId,
        gradeLevel,
        isPublic: isPublic || false,
        createdBy: req.user.id
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        creator: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    console.log('✅ Question bank created successfully:', questionBank.id);

    res.status(201).json({
      success: true,
      data: questionBank,
      message: 'Question bank created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating question bank:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal membuat bank soal',
      error: error.message 
    });
  }
};

// ================================================
// TOPICS OPERATIONS
// ================================================

/**
 * Get all topics
 * GET /api/bank-soal/topics
 */
export const getTopics = async (req, res) => {
  try {
    console.log('📋 Get topics request:', req.query);
    
    const { subjectId, gradeLevel } = req.query;
    
    // Build where clause
    const where = {};
    
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    const topics = await prisma.topic.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📋 Found ${topics.length} topics`);

    res.json({
      success: true,
      data: topics
    });

  } catch (error) {
    console.error('❌ Error getting topics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data topik',
      error: error.message 
    });
  }
};

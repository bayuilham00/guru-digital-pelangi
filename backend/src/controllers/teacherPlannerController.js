// Teacher Planner Controller
// Handles CRUD operations for Teacher Planner module
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================================================
// LESSON TEMPLATES OPERATIONS
// ================================================

/**
 * Get all lesson templates
 * GET /api/teacher-planner/templates
 */
export const getTemplates = async (req, res) => {
  try {
    console.log('📋 Get lesson templates request:', req.query);
    
    const { page = 1, limit = 20, search, subjectId, difficultyLevel, gradeLevel, isPublic } = req.query;
    
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
    
    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }
    
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    console.log('📋 Where clause:', where);

    // Get templates with pagination
    const templates = await prisma.lessonTemplate.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    // Get total count
    const totalCount = await prisma.lessonTemplate.count({ where });

    console.log('📋 Found templates:', templates.length);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error getting templates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Get lesson template by ID
 * GET /api/teacher-planner/templates/:id
 */
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Get template by ID:', id);

    const template = await prisma.lessonTemplate.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
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

    if (!template) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    console.log('📋 Template found:', template.name);

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('❌ Error getting template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Create new lesson template
 * POST /api/teacher-planner/templates
 */
export const createTemplate = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      subjectId, 
      templateStructure, 
      learningObjectives, 
      estimatedDuration, 
      difficultyLevel, 
      gradeLevel, 
      isPublic 
    } = req.body;

    console.log('📝 Create template request:', req.body);

    // Validate required fields
    if (!name || !templateStructure || !learningObjectives) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, template structure, and learning objectives are required' 
      });
    }

    const template = await prisma.lessonTemplate.create({
      data: {
        name,
        description,
        subjectId,
        templateStructure,
        learningObjectives,
        estimatedDuration,
        difficultyLevel,
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
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    console.log('✅ Template created:', template.id);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Update lesson template
 * PUT /api/teacher-planner/templates/:id
 */
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      subjectId, 
      templateStructure, 
      learningObjectives, 
      estimatedDuration, 
      difficultyLevel, 
      gradeLevel, 
      isPublic 
    } = req.body;

    console.log('📝 Update template request:', id);

    // Check if template exists and user owns it
    const existingTemplate = await prisma.lessonTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    // Check ownership (only owner can update)
    if (existingTemplate.createdBy !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this template' 
      });
    }

    const template = await prisma.lessonTemplate.update({
      where: { id },
      data: {
        name,
        description,
        subjectId,
        templateStructure,
        learningObjectives,
        estimatedDuration,
        difficultyLevel,
        gradeLevel,
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
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    console.log('✅ Template updated:', template.id);

    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Delete lesson template
 * DELETE /api/teacher-planner/templates/:id
 */
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete template request:', id);

    // Check if template exists and user owns it
    const existingTemplate = await prisma.lessonTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    // Check ownership (only owner can delete)
    if (existingTemplate.createdBy !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this template' 
      });
    }

    await prisma.lessonTemplate.delete({
      where: { id }
    });

    console.log('✅ Template deleted:', id);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// ================================================
// TEACHER PLANS OPERATIONS
// ================================================

/**
 * Get all teacher plans
 * GET /api/teacher-planner/plans
 */
export const getPlans = async (req, res) => {
  try {
    console.log('📋 Get teacher plans request:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      search, 
      classId, 
      subjectId,
      status, 
      startDate, 
      endDate, 
      teacherId,
      sortBy = 'scheduledDate',
      sortOrder = 'desc'
    } = req.query;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (classId) {
      where.classId = classId;
    }
    
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (teacherId) {
      where.teacherId = teacherId;
    } else {
      // If no teacherId specified:
      // - Admin can see all plans
      // - Teacher can only see their own plans
      if (req.user.role !== 'ADMIN') {
        where.teacherId = req.user.id;
      }
      // Admin sees all plans (no teacherId filter)
    }
    
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate);
      }
    }

    console.log('📋 Where clause:', where);

    // Get plans with pagination
    const plans = await prisma.teacherPlan.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    // Get total count
    const totalCount = await prisma.teacherPlan.count({ where });

    console.log('📋 Found plans:', plans.length);

    res.json({
      success: true,
      data: plans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error getting plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Get teacher plan by ID
 * GET /api/teacher-planner/plans/:id
 */
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Get plan by ID:', id);

    const plan = await prisma.teacherPlan.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            templateStructure: true,
            learningObjectives: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    console.log('📋 Plan found:', plan.title);

    res.json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('❌ Error getting plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Create new teacher plan
 * POST /api/teacher-planner/plans
 */
export const createPlan = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      classId, 
      subjectId, 
      templateId, 
      scheduledDate, 
      duration, 
      learningObjectives, 
      lessonContent, 
      assessment, 
      resources, 
      notes, 
      status 
    } = req.body;

    console.log('📝 Create plan request:', req.body);

    // Validate required fields
    if (!title || !classId || !subjectId || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, class, subject, and scheduled date are required' 
      });
    }

    const plan = await prisma.teacherPlan.create({
      data: {
        title,
        description,
        classId,
        subjectId,
        templateId,
        scheduledDate: new Date(scheduledDate),
        duration,
        learningObjectives,
        lessonContent,
        assessment,
        resources,
        notes,
        status: status || 'DRAFT',
        teacherId: req.user.id
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Plan created:', plan.id);

    res.status(201).json({
      success: true,
      data: plan,
      message: 'Plan created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Update teacher plan
 * PUT /api/teacher-planner/plans/:id
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      classId, 
      subjectId, 
      templateId, 
      scheduledDate, 
      duration, 
      learningObjectives, 
      lessonContent, 
      assessment, 
      resources, 
      notes, 
      status 
    } = req.body;

    console.log('📝 Update plan request:', id);

    // Check if plan exists and user owns it
    const existingPlan = await prisma.teacherPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    // Check ownership (only owner can update)
    if (existingPlan.teacherId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this plan' 
      });
    }

    const plan = await prisma.teacherPlan.update({
      where: { id },
      data: {
        title,
        description,
        classId,
        subjectId,
        templateId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        duration,
        learningObjectives,
        lessonContent,
        assessment,
        resources,
        notes,
        status
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Plan updated:', plan.id);

    res.json({
      success: true,
      data: plan,
      message: 'Plan updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Delete teacher plan
 * DELETE /api/teacher-planner/plans/:id
 */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete plan request:', id);

    // Check if plan exists and user owns it
    const existingPlan = await prisma.teacherPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    // Check ownership (only owner can delete)
    if (existingPlan.teacherId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this plan' 
      });
    }

    await prisma.teacherPlan.delete({
      where: { id }
    });

    console.log('✅ Plan deleted:', id);

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Get calendar view data
 * GET /api/teacher-planner/calendar
 */
export const getCalendarData = async (req, res) => {
  try {
    const { startDate, endDate, teacherId } = req.query;
    
    console.log('📅 Get calendar data request:', req.query);

    // Build where clause
    const where = {
      teacherId: teacherId || req.user.id
    };
    
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate);
      }
    }

    const plans = await prisma.teacherPlan.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    // Group plans by date for calendar view
    const calendarData = {};
    plans.forEach(plan => {
      const dateKey = plan.scheduledDate.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(plan);
    });

    console.log('📅 Calendar data prepared for', Object.keys(calendarData).length, 'dates');

    res.json({
      success: true,
      data: calendarData,
      summary: {
        totalPlans: plans.length,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting calendar data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// ================================================
// BULK OPERATIONS
// ================================================

/**
 * Bulk delete teacher plans
 * POST /api/teacher-planner/plans/bulk-delete
 */
export const bulkDeletePlans = async (req, res) => {
  try {
    const { planIds } = req.body;
    console.log('🗑️ Bulk delete plans:', planIds);

    if (!planIds || !Array.isArray(planIds) || planIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan IDs are required' 
      });
    }

    // Check ownership for non-admin users
    if (req.user.role !== 'ADMIN') {
      const ownedPlans = await prisma.teacherPlan.findMany({
        where: {
          id: { in: planIds },
          teacherId: req.user.id
        },
        select: { id: true }
      });

      if (ownedPlans.length !== planIds.length) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to delete some plans' 
        });
      }
    }

    const result = await prisma.teacherPlan.deleteMany({
      where: {
        id: { in: planIds }
      }
    });

    console.log('✅ Bulk deleted plans:', result.count);

    res.json({
      success: true,
      data: { deletedCount: result.count },
      message: `${result.count} plans deleted successfully`
    });

  } catch (error) {
    console.error('❌ Error bulk deleting plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Bulk update status
 * POST /api/teacher-planner/plans/bulk-status
 */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { planIds, status } = req.body;
    console.log('📝 Bulk update status:', { planIds, status });

    if (!planIds || !Array.isArray(planIds) || planIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan IDs are required' 
      });
    }

    if (!status || !['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required' 
      });
    }

    // Check ownership for non-admin users
    if (req.user.role !== 'ADMIN') {
      const ownedPlans = await prisma.teacherPlan.findMany({
        where: {
          id: { in: planIds },
          teacherId: req.user.id
        },
        select: { id: true }
      });

      if (ownedPlans.length !== planIds.length) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update some plans' 
        });
      }
    }

    const result = await prisma.teacherPlan.updateMany({
      where: {
        id: { in: planIds }
      },
      data: {
        status: status
      }
    });

    console.log('✅ Bulk updated status:', result.count);

    res.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} plans updated to ${status}`
    });

  } catch (error) {
    console.error('❌ Error bulk updating status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Bulk duplicate plans
 * POST /api/teacher-planner/plans/bulk-duplicate
 */
export const bulkDuplicatePlans = async (req, res) => {
  try {
    const { planIds } = req.body;
    console.log('📋 Bulk duplicate plans:', planIds);

    if (!planIds || !Array.isArray(planIds) || planIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan IDs are required' 
      });
    }

    // Get original plans
    const originalPlans = await prisma.teacherPlan.findMany({
      where: {
        id: { in: planIds }
      }
    });

    if (originalPlans.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No plans found' 
      });
    }

    // Create duplicates
    const duplicatedPlans = [];
    for (const plan of originalPlans) {
      const duplicated = await prisma.teacherPlan.create({
        data: {
          title: `${plan.title} (Copy)`,
          description: plan.description,
          classId: plan.classId,
          subjectId: plan.subjectId,
          templateId: plan.templateId,
          teacherId: req.user.id, // Assign to current user
          scheduledDate: new Date(), // Set to today
          duration: plan.duration,
          learningObjectives: plan.learningObjectives,
          lessonContent: plan.lessonContent,
          assessment: plan.assessment,
          resources: plan.resources,
          notes: plan.notes,
          status: 'DRAFT' // Always start as draft
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              gradeLevel: true
            }
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          teacher: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });
      duplicatedPlans.push(duplicated);
    }

    console.log('✅ Bulk duplicated plans:', duplicatedPlans.length);

    res.json({
      success: true,
      data: duplicatedPlans,
      message: `${duplicatedPlans.length} plans duplicated successfully`
    });

  } catch (error) {
    console.error('❌ Error bulk duplicating plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Bulk export teacher plans
 * GET /api/teacher-planner/plans/bulk/export
 */
export const bulkExportPlans = async (req, res) => {
  try {
    const { planIds, format = 'json' } = req.query;
    
    console.log('📤 Bulk export plans request:', { planIds, format });

    if (!planIds) {
      return res.status(400).json({
        success: false,
        message: 'planIds parameter is required'
      });
    }

    const planIdsArray = Array.isArray(planIds) ? planIds : planIds.split(',');
    
    if (planIdsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one plan ID is required'
      });
    }

    // Get plans with full details
    const plans = await prisma.teacherPlan.findMany({
      where: {
        id: {
          in: planIdsArray
        }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No plans found with the provided IDs'
      });
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Title',
        'Description',
        'Subject',
        'Class',
        'Teacher',
        'Scheduled Date',
        'Duration',
        'Status',
        'Created At'
      ];

      const csvRows = plans.map(plan => [
        plan.id,
        plan.title,
        plan.description || '',
        plan.subject?.name || '',
        plan.class?.name || '',
        plan.teacher?.fullName || '',
        plan.scheduledDate?.toISOString() || '',
        plan.duration || '',
        plan.status,
        plan.createdAt.toISOString()
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="teacher-plans-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: {
          plans: plans,
          exportedAt: new Date().toISOString(),
          totalPlans: plans.length
        },
        message: `Successfully exported ${plans.length} teacher plans`
      });
    }

    console.log(`✅ Successfully exported ${plans.length} plans in ${format} format`);

  } catch (error) {
    console.error('❌ Error exporting plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

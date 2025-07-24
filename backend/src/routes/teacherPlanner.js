// Teacher Planner Routes
import express from 'express';
import {
  // Template operations
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  // Plan operations
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getCalendarData,
  // Bulk operations
  bulkDeletePlans,
  bulkUpdateStatus,
  bulkDuplicatePlans,
  bulkExportPlans
} from '../controllers/teacherPlannerController.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ================================================
// LESSON TEMPLATES ROUTES
// ================================================

// GET /api/teacher-planner/templates - Get all lesson templates
router.get('/templates', getTemplates);

// GET /api/teacher-planner/templates/:id - Get template by ID
router.get('/templates/:id', getTemplateById);

// POST /api/teacher-planner/templates - Create new template
router.post('/templates', adminAndGuru, createTemplate);

// PUT /api/teacher-planner/templates/:id - Update template
router.put('/templates/:id', adminAndGuru, updateTemplate);

// DELETE /api/teacher-planner/templates/:id - Delete template
router.delete('/templates/:id', adminAndGuru, deleteTemplate);

// ================================================
// TEACHER PLANS ROUTES
// ================================================

// GET /api/teacher-planner/plans - Get all teacher plans
router.get('/plans', getPlans);

// GET /api/teacher-planner/plans/:id - Get plan by ID
router.get('/plans/:id', getPlanById);

// POST /api/teacher-planner/plans - Create new plan
router.post('/plans', adminAndGuru, createPlan);

// PUT /api/teacher-planner/plans/:id - Update plan
router.put('/plans/:id', adminAndGuru, updatePlan);

// DELETE /api/teacher-planner/plans/:id - Delete plan
router.delete('/plans/:id', adminAndGuru, deletePlan);

// ================================================
// BULK OPERATIONS ROUTES
// ================================================

// DELETE /api/teacher-planner/plans/bulk - Bulk delete plans
router.delete('/plans/bulk', adminAndGuru, bulkDeletePlans);

// PUT /api/teacher-planner/plans/bulk/status - Bulk update status
router.put('/plans/bulk/status', adminAndGuru, bulkUpdateStatus);

// POST /api/teacher-planner/plans/bulk/duplicate - Bulk duplicate plans
router.post('/plans/bulk/duplicate', adminAndGuru, bulkDuplicatePlans);

// GET /api/teacher-planner/plans/bulk/export - Bulk export plans
router.get('/plans/bulk/export', bulkExportPlans);

// ================================================
// CALENDAR ROUTES
// ================================================

// GET /api/teacher-planner/calendar - Get calendar view data
router.get('/calendar', getCalendarData);

export default router;

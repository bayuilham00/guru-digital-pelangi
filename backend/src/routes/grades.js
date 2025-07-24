// Grades Routes
import express from 'express';
import {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradesByClass,
  getGradesByStudent,
  bulkCreateGrades,
  getClassGradeStats
} from '../controllers/gradeController.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';
import { validateGrade, validateBulkGrade } from '../middleware/validation.js';

const router = express.Router();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/grades - Get all grades
router.get('/', getGrades);

// GET /api/grades/:id - Get grade by ID
router.get('/:id', getGradeById);

// GET /api/grades/class/:classId - Get grades by class
router.get('/class/:classId', getGradesByClass);

// GET /api/grades/student/:studentId - Get grades by student
router.get('/student/:studentId', getGradesByStudent);

// GET /api/grades/stats/class/:classId - Get class grade statistics
router.get('/stats/class/:classId', getClassGradeStats);

// POST /api/grades - Create new grade
router.post('/', adminAndGuru, validateGrade, createGrade);

// POST /api/grades/bulk - Bulk create grades
router.post('/bulk', adminAndGuru, validateBulkGrade, bulkCreateGrades);

// PUT /api/grades/:id - Update grade
router.put('/:id', adminAndGuru, validateGrade, updateGrade);

// DELETE /api/grades/:id - Delete grade
router.delete('/:id', adminAndGuru, deleteGrade);

export default router;

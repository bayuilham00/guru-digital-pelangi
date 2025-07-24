// Classes Routes
import express from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  addStudentToClass,
  removeStudentFromClass
} from '../controllers/classController.js';
import { getTeacherClasses } from '../controllers/teacherAttendanceController.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';
import { validateClass } from '../middleware/validation.js';

const router = express.Router();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/classes - Get all classes
router.get('/', getClasses);

// GET /api/classes/teacher-attendance - Get classes for teacher attendance (must be before /:id)
router.get('/teacher-attendance', getTeacherClasses);

// GET /api/classes/:id - Get class by ID
router.get('/:id', getClassById);

// GET /api/classes/:id/students - Get students in class
router.get('/:id/students', getClassStudents);

// POST /api/classes - Create new class
router.post('/', adminAndGuru, validateClass, createClass);

// PUT /api/classes/:id - Update class
router.put('/:id', adminAndGuru, validateClass, updateClass);

// DELETE /api/classes/:id - Delete class
router.delete('/:id', adminAndGuru, deleteClass);

// POST /api/classes/:id/students - Add student to class
router.post('/:id/students', adminAndGuru, addStudentToClass);

// DELETE /api/classes/:id/students/:studentId - Remove student from class
router.delete('/:id/students/:studentId', adminAndGuru, removeStudentFromClass);

export default router;

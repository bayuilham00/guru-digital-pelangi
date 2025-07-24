// Schools Routes
import express from 'express';
import {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool
} from '../controllers/schoolController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';
import { validateSchool } from '../middleware/validation.js';

const router = express.Router();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/schools - Get all schools
router.get('/', getSchools);

// GET /api/schools/:id - Get school by ID
router.get('/:id', getSchoolById);

// POST /api/schools - Create new school (admin only)
router.post('/', adminOnly, validateSchool, createSchool);

// PUT /api/schools/:id - Update school (admin only)
router.put('/:id', adminOnly, validateSchool, updateSchool);

// DELETE /api/schools/:id - Delete school (admin only)
router.delete('/:id', adminOnly, deleteSchool);

export default router;

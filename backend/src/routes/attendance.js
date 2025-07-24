// Attendance Routes
import express from 'express';
import {
  getAttendance,
  getAttendanceByDate,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';
import { validateAttendance } from '../middleware/validation.js';

const router = express.Router();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/attendance - Get attendance records
router.get('/', getAttendance);

// GET /api/attendance/date/:date - Get attendance by specific date
router.get('/date/:date', getAttendanceByDate);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', getAttendanceStats);

// POST /api/attendance - Create single attendance record
router.post('/', adminAndGuru, validateAttendance, createAttendance);

// POST /api/attendance/bulk - Create multiple attendance records
router.post('/bulk', adminAndGuru, bulkCreateAttendance);

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', adminAndGuru, validateAttendance, updateAttendance);

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', adminAndGuru, deleteAttendance);

export default router;

// Activities Routes
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/activities - Get all activities
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: { activities: [] },
    message: 'Activities feature coming soon'
  });
});

export default router;

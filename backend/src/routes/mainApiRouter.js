/**
 * Main API Router - Multi-Subject System
 * Combines all multi-subject management routes
 */

import express from 'express';
import multiSubjectRoutes from './multiSubjectRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Multi-Subject Class Management API'
  });
});

// Multi-subject management routes
router.use('/multi-subject', multiSubjectRoutes);

// Legacy compatibility routes - map to new multi-subject routes
// Note: /classes/:classId/full moved to main classRoutes to avoid duplication
router.use('/admin', multiSubjectRoutes); // Admin-specific multi-subject routes

export default router;

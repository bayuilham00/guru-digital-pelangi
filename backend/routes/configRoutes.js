import express from 'express';
import { authenticateToken, requireRole } from '../src/middleware/auth.js';
import {
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  updateMultipleConfigs,
  initializeSystem,
  checkSystemStatus,
  resetSystemConfig
} from '../controllers/configController.js';

const router = express.Router();

// Public routes (for system initialization)
router.get('/status', checkSystemStatus);
router.post('/initialize', initializeSystem);
router.post('/reset', resetSystemConfig); // Public reset for demo/testing purposes

// Protected routes (require authentication)
router.get('/', authenticateToken, requireRole(['ADMIN']), getAllConfigs);
router.get('/:key', authenticateToken, requireRole(['ADMIN']), getConfigByKey);
router.put('/:key', authenticateToken, requireRole(['ADMIN']), updateConfig);
router.put('/', authenticateToken, requireRole(['ADMIN']), updateMultipleConfigs);

export default router;

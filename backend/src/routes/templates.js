import express from 'express';
import lessonTemplateController from '../controllers/lessonTemplateController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Template routes
router.get('/', lessonTemplateController.getTemplates);
router.get('/:id', lessonTemplateController.getTemplate);
router.post('/', lessonTemplateController.createTemplate);
router.put('/:id', lessonTemplateController.updateTemplate);
router.delete('/:id', lessonTemplateController.deleteTemplate);
router.post('/:id/duplicate', lessonTemplateController.duplicateTemplate);
router.post('/bulk-delete', lessonTemplateController.bulkDeleteTemplates);

export default router;

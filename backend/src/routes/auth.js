// Authentication Routes
import express from 'express';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile,
  changePassword,
  refreshToken,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/refresh-token', refreshToken);

// Protected routes (perlu login)
router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getProfile); // Alias for profile
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;

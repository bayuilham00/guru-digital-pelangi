// Bank Soal Routes
import express from 'express';
import {
  // Question operations
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  // Question bank operations
  getQuestionBanks,
  getQuestionBankById,
  createQuestionBank,
  // Topic operations
  getTopics
} from '../controllers/bankSoalController.js';
import { authenticateToken, adminAndGuru } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ================================================
// QUESTIONS ROUTES
// ================================================

// GET /api/bank-soal/questions - Get all questions
router.get('/questions', getQuestions);

// GET /api/bank-soal/questions/:id - Get question by ID
router.get('/questions/:id', getQuestionById);

// POST /api/bank-soal/questions - Create new question
router.post('/questions', adminAndGuru, createQuestion);

// PUT /api/bank-soal/questions/:id - Update question
router.put('/questions/:id', adminAndGuru, updateQuestion);

// DELETE /api/bank-soal/questions/:id - Delete question
router.delete('/questions/:id', adminAndGuru, deleteQuestion);

// ================================================
// QUESTION BANKS ROUTES
// ================================================

// GET /api/bank-soal/banks - Get all question banks
router.get('/banks', getQuestionBanks);

// GET /api/bank-soal/banks/:id - Get question bank by ID
router.get('/banks/:id', getQuestionBankById);

// POST /api/bank-soal/banks - Create new question bank
router.post('/banks', adminAndGuru, createQuestionBank);

// PUT /api/bank-soal/banks/:id - Update question bank
// router.put('/banks/:id', adminAndGuru, updateQuestionBank);

// DELETE /api/bank-soal/banks/:id - Delete question bank
// router.delete('/banks/:id', adminAndGuru, deleteQuestionBank);

// POST /api/bank-soal/banks/:id/questions - Add question to bank
// router.post('/banks/:id/questions', adminAndGuru, addQuestionToBank);

// DELETE /api/bank-soal/banks/:bankId/questions/:questionId - Remove question from bank
// router.delete('/banks/:bankId/questions/:questionId', adminAndGuru, removeQuestionFromBank);

// ================================================
// TOPICS ROUTES
// ================================================

// GET /api/bank-soal/topics - Get all topics
router.get('/topics', getTopics);

// POST /api/bank-soal/topics - Create new topic
// router.post('/topics', adminAndGuru, createTopic);

// PUT /api/bank-soal/topics/:id - Update topic
// router.put('/topics/:id', adminAndGuru, updateTopic);

// DELETE /api/bank-soal/topics/:id - Delete topic
// router.delete('/topics/:id', adminAndGuru, deleteTopic);

export default router;

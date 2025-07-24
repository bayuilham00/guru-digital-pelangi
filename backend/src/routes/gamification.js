// Gamification Routes
import express from 'express';
import {
  getGamificationSettings,
  createGamificationSettings,
  updateGamificationSettings,
  getStudentXp,
  getStudentsWithXP,
  getClassLeaderboard,
  getAllStudentsLeaderboard,
  getStudentAchievements,
  awardAchievement,
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getChallenges,
  createChallenge,
  giveRewardToStudent,
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  getChallengeParticipants,
  markChallengeCompleted,
  completeChallengeFinalization,
  completeChallengeBulk,
  deleteChallenge,
  updateChallenge,
  getStudentChallenges
} from '../controllers/gamificationController.js';
import { authenticateToken, adminOnly, adminAndGuru } from '../middleware/auth.js';

const router = express.Router();

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/gamification/settings - Get gamification settings (Admin only)
router.get('/settings', adminOnly, getGamificationSettings);

// POST /api/gamification/settings - Create gamification settings (Admin only)
router.post('/settings', adminOnly, createGamificationSettings);

// PUT /api/gamification/settings/:id - Update gamification settings (Admin only)
router.put('/settings/:id', adminOnly, updateGamificationSettings);

// GET /api/gamification/students - Get all students with XP data
router.get('/students', getStudentsWithXP);

// GET /api/gamification/student/:studentId - Get student XP and level
router.get('/student/:studentId', getStudentXp);

// GET /api/gamification/leaderboard/all - Get all students leaderboard
router.get('/leaderboard/all', getAllStudentsLeaderboard);

// GET /api/gamification/leaderboard/:classId - Get class leaderboard
router.get('/leaderboard/:classId', getClassLeaderboard);

// GET /api/gamification/achievements/:studentId - Get student achievements
router.get('/achievements/:studentId', getStudentAchievements);

// POST /api/gamification/achievements - Award achievement to student
router.post('/achievements', adminAndGuru, awardAchievement);

// GET /api/gamification/badges - Get all badges
router.get('/badges', getBadges);

// POST /api/gamification/badges - Create new badge (Admin/Guru)
router.post('/badges', adminAndGuru, createBadge);

// PUT /api/gamification/badges/:id - Update badge (Admin/Guru)
router.put('/badges/:id', adminAndGuru, updateBadge);

// DELETE /api/gamification/badges/:id - Delete badge (Admin/Guru)
router.delete('/badges/:id', adminAndGuru, deleteBadge);

// GET /api/gamification/challenges - Get all challenges
router.get('/challenges', getChallenges);

// GET /api/gamification/challenges/student/:studentId - Get challenges for student dashboard
router.get('/challenges/student/:studentId', getStudentChallenges);

// POST /api/gamification/challenges - Create new challenge (Admin/Guru)
router.post('/challenges', adminAndGuru, createChallenge);

// GET /api/gamification/challenges/:challengeId/participants - Get challenge participants (Admin/Guru)
router.get('/challenges/:challengeId/participants', adminAndGuru, getChallengeParticipants);

// PATCH /api/gamification/challenges/participants/:participantId/complete - Mark participant as completed (Admin/Guru)
router.patch('/challenges/participants/:participantId/complete', adminAndGuru, markChallengeCompleted);

// POST /api/gamification/challenges/:challengeId/finalize - Finalize challenge completion (Admin/Guru)
router.post('/challenges/:challengeId/finalize', adminAndGuru, completeChallengeFinalization);

// POST /api/gamification/challenges/:challengeId/complete-bulk - Complete challenge by deadline (Admin/Guru)
router.post('/challenges/:challengeId/complete-bulk', adminAndGuru, completeChallengeBulk);

// PATCH /api/gamification/challenges/:challengeId - Update challenge (Admin/Guru)
router.patch('/challenges/:challengeId', adminAndGuru, updateChallenge);

// DELETE /api/gamification/challenges/:challengeId - Delete challenge (Admin/Guru)
router.delete('/challenges/:challengeId', adminAndGuru, deleteChallenge);

// POST /api/gamification/rewards - Give reward to student (Admin/Guru)
router.post('/rewards', adminAndGuru, giveRewardToStudent);

// GET /api/gamification/levels - Get all levels
router.get('/levels', getLevels);

// POST /api/gamification/levels - Create new level (Admin only)
router.post('/levels', adminOnly, createLevel);

// PUT /api/gamification/levels/:id - Update level (Admin only)
router.put('/levels/:id', adminOnly, updateLevel);

// DELETE /api/gamification/levels/:id - Delete level (Admin only)
router.delete('/levels/:id', adminOnly, deleteLevel);

export default router;

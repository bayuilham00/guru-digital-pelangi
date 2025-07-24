// Main Server File - Guru Digital Pelangi Backend
// Express + Prisma + MySQL dengan Bun
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import schoolRoutes from './routes/schools.js';
import subjectRoutes from './routes/subjects.js';
import teacherRoutes from './routes/teachers.js';
import classRoutes from './routes/classes.js';
import studentRoutes from './routes/students.js';
import gradeRoutes from './routes/grades.js';
import attendanceRoutes from './routes/attendance.js';
import assignmentRoutes from './routes/assignments.js';
import dashboardRoutes from './routes/dashboard.js';
import submissionRoutes from './routes/submissions.js';
import badgeRoutes from './routes/badges.js';
import levelRoutes from './routes/levels.js';
import challengeRoutes from './routes/challenges.js';
import activityRoutes from './routes/activities.js';
import gamificationRoutes from './routes/gamification.js';
import teacherPlannerRoutes from './routes/teacherPlanner.js';
import bankSoalRoutes from './routes/bankSoal.js';
import templateRoutes from './routes/templates.js';
import geminiRoutes from './routes/gemini.js';
import multiSubjectRoutes from './routes/multiSubjectRoutes.js';
import configRoutes from '../routes/configRoutes.js';
import mainApiRouter from '../routes/mainApiRouter.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Terlalu banyak request dari IP ini, coba lagi nanti.'
  }
});

app.use('/api/', limiter);

// CORS configuration - Allow all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Guru Digital Pelangi API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api', mainApiRouter);
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
// Assignments handled by main API router
// app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/teacher-planner', teacherPlannerRoutes);
app.use('/api/bank-soal', bankSoalRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', geminiRoutes);
app.use('/api/admin/classes', multiSubjectRoutes);
app.use('/api/config', configRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to Guru Digital Pelangi API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Error handling middleware (harus di akhir)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Guru Digital Pelangi Backend Server Started!
📍 Environment: ${process.env.NODE_ENV}
🌐 Server running on: http://localhost:${PORT}
💾 Database: MySQL
🔧 ORM: Prisma
⚡ Runtime: Bun
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

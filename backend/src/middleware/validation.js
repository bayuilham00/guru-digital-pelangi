// Validation Middleware using Zod
import { z } from 'zod';

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      console.log('🔍 Validation input:', JSON.stringify(req.body, null, 2));
      schema.parse(req.body);
      console.log('✅ Validation passed');
      next();
    } catch (error) {
      console.log('❌ Validation failed:', error.errors);
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
  };
};

// Auth validation schemas
const loginSchema = z.object({
  identifier: z.string().min(1, 'NIP/NISN/Email harus diisi'),
  password: z.string().min(1, 'Password harus diisi')
});

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  firstName: z.string().min(1, 'Nama depan harus diisi'),
  lastName: z.string().min(1, 'Nama belakang harus diisi'),
  nip: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['ADMIN', 'GURU']).optional()
});

// Student validation schemas
const studentSchema = z.object({
  studentId: z.string().min(10, 'NISN harus 10 digit').max(10, 'NISN harus 10 digit'),
  fullName: z.string().min(1, 'Nama lengkap harus diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  classId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['L', 'P']).optional(),
  address: z.string().optional(),
  asalSekolah: z.string().optional(),
  kecamatan: z.string().optional(),
  desaKelurahan: z.string().optional(),
  phone: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']).optional()
});

// Class validation schemas
const classSchema = z.object({
  name: z.string().min(1, 'Nama kelas harus diisi'),
  subjectId: z.string().min(1, 'Mata pelajaran harus diisi').optional(),
  teacherIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  gradeLevel: z.string().min(1, 'Tingkat kelas harus diisi')
});

// Grade validation schemas
const gradeSchema = z.object({
  studentId: z.string().min(1, 'Student ID harus diisi'),
  subjectId: z.string().min(1, 'Subject ID harus diisi'),
  classId: z.string().min(1, 'Class ID harus diisi'),
  gradeType: z.enum(['TUGAS_HARIAN', 'QUIZ', 'ULANGAN_HARIAN', 'PTS', 'PAS', 'PRAKTIK', 'SIKAP', 'KETERAMPILAN']),
  score: z.number().min(0, 'Nilai tidak boleh negatif').max(100, 'Nilai maksimal 100'),
  maxScore: z.number().min(1, 'Nilai maksimal minimal 1').max(100, 'Nilai maksimal 100'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal harus diisi')
});

const bulkGradeSchema = z.object({
  grades: z.array(gradeSchema).min(1, 'Minimal harus ada 1 nilai')
});

// Attendance validation schemas
const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID harus diisi'),
  classId: z.string().min(1, 'Class ID harus diisi'),
  date: z.string().min(1, 'Tanggal harus diisi'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  reason: z.enum(['ALPA', 'IZIN', 'SAKIT']).optional(),
  timeIn: z.string().optional(),
  notes: z.string().optional()
}).refine((data) => {
  // Jika status ABSENT, reason harus diisi
  if (data.status === 'ABSENT' && !data.reason) {
    return false;
  }
  // Jika status bukan ABSENT, reason tidak boleh diisi
  if (data.status !== 'ABSENT' && data.reason) {
    return false;
  }
  return true;
}, {
  message: 'Reason hanya boleh diisi untuk status ABSENT',
  path: ['reason']
});

// School validation schemas
const schoolSchema = z.object({
  name: z.string().min(1, 'Nama sekolah harus diisi'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal(''))
});

// Export validation middleware
export const validateLogin = validate(loginSchema);
export const validateRegister = validate(registerSchema);
export const validateStudent = validate(studentSchema);
export const validateClass = validate(classSchema);
export const validateGrade = validate(gradeSchema);
export const validateBulkGrade = validate(bulkGradeSchema);
export const validateAttendance = validate(attendanceSchema);
export const validateSchool = validate(schoolSchema);

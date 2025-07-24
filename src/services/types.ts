// Types for Guru Digital Pelangi API Services
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  nip?: string;
  studentId?: string; // NISN for students
  role: 'ADMIN' | 'GURU' | 'SISWA';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Class {
  id: string;
  name: string;
  subjectId?: string;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  description?: string;
  studentCount?: number;
  gradeLevel?: string;
  academicYear?: string;
  schoolId?: string;
  classTeachers?: Array<{
    id: string;
    teacherId: string;
    teacher: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
  teachers?: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  school?: {
    name: string;
  };
}

export interface Student {
  id: string;
  studentId: string; // NISN
  fullName: string;
  email?: string;
  classId?: string;
  dateOfBirth?: string;
  gender?: 'L' | 'P';
  address?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  asalSekolah?: string;
  kecamatan?: string;
  desaKelurahan?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  class?: {
    name: string;
    gradeLevel: string;
  };
  studentXp?: {
    totalXp: number;
    level: number;
    levelName: string;
  };
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  reason?: 'ALPA' | 'IZIN' | 'SAKIT';
  timeIn?: string;
  notes?: string;
  student?: {
    firstName: string;
    lastName: string;
    studentId: string;
  };
  class?: {
    name: string;
  };
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  gradeType: 'TUGAS_HARIAN' | 'QUIZ' | 'ULANGAN_HARIAN' | 'PTS' | 'PAS' | 'PRAKTIK' | 'SIKAP' | 'KETERAMPILAN';
  score: number;
  maxScore: number;
  description?: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface StudentXp {
  id: string;
  studentId: string;
  totalXp: number;
  level: number;
  levelName: string;
  attendanceStreak: number;
  assignmentStreak: number;
  lastAttendance?: string;
  lastAssignment?: string;
  updatedAt: string;
  student?: {
    id: string;
    fullName: string;
    studentId: string;
  };
}

export interface Achievement {
  id: string;
  studentId: string;
  type: string;
  title: string;
  description?: string;
  xpReward: number;
  earnedAt: string;
  metadata?: any;
}

export interface GamificationSettings {
  id: string;
  name: string;
  description?: string;
  xpPerGrade: number;
  xpAttendanceBonus: number;
  xpAbsentPenalty: number;
  levelThresholds: Array<{
    level: number;
    name: string;
    xp: number;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Classmate extends Student {
  rank: number;
  totalXp: number;
  level: number;
  profilePhoto?: string;
  averageGrade: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  nip?: string;
  phone?: string;
}

// ClassDetail interface for detailed class information
export interface ClassDetail {
  id: string;
  name: string;
  gradeLevel: string;
  description?: string;
  studentCount: number;
  subjects: {
    id: string;
    name: string;
    code: string;
    teachers: {
      id: string;
      fullName: string;
    }[];
  }[];
  students: {
    id: string;
    fullName: string;
    email: string;
    assignments: {
      completed: number;
      total: number;
      averageScore: number;
    };
    attendance: {
      present: number;
      absent: number;
      sick: number;
      permission: number;
      total: number;
    };
    grades: {
      subject: string;
      score: number;
      type: string; // 'assignment' | 'quiz' | 'exam'
    }[];
    averageGrade: number;
  }[];
  assignments: {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    submissions: number;
    totalStudents: number;
    status: 'active' | 'completed' | 'overdue';
  }[];
  statistics: {
    totalStudents: number;
    averageGrade: number;
    attendanceRate: number;
    assignmentCompletionRate: number;
    activeAssignments: number;
  };
}

// API data structure interfaces for multi-subject data
export interface SubjectWithTeachers {
  id: string;
  name: string;
  code: string;
  description?: string;
  teachers?: Teacher[];
  isActive?: boolean;
  classSubjectId?: string;
}

export interface StudentWithDetails {
  id: string;
  fullName: string;
  email: string;
  studentId?: string;
  // Additional student details can be added here
}

// Assignment-related interfaces
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  points: number;
  deadline: string;
  type: string;
  status: 'active' | 'overdue' | 'completed';
  createdAt: string;
  updatedAt?: string;
  classId: string;
  teacherId: string;
  class?: {
    id: string;
    name: string;
    subject?: {
      id: string;
      name: string;
    };
  };
  submissionStats?: {
    total: number;
    submitted: number;
    graded: number;
    missing: number;
    late: number;
  };
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  status: 'submitted' | 'late' | 'missing';
  content?: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  student?: {
    id: string;
    fullName: string;
    studentId: string;
    avatar?: string;
  };
}

export interface StudentWithSubmission {
  id: string;
  fullName: string;
  studentId: string;
  avatar?: string;
  submission?: AssignmentSubmission;
}

export interface AssignmentStats {
  total: number;
  active: number;
  overdue: number;
  completed: number;
  thisWeek: number;
  averagePoints: number;
}

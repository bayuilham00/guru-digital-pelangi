// API Response Types for Guru Digital Pelangi
// Consistent API response structure across all endpoints

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: string;
  statusCode?: number;
}

// Specific API Response Types
export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      role: 'ADMIN' | 'GURU' | 'SISWA';
      nip?: string;
      studentId?: string;
    };
    token: string;
    expiresIn: string;
  };
  message: string;
}

export interface ClassDetailResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description?: string;
    gradeLevel: string;
    academicYear: string;
    subjects: Array<{
      id: string;
      name: string;
      code: string;
      teachers: Array<{
        id: string;
        fullName: string;
        email: string;
      }>;
    }>;
    students: Array<{
      id: string;
      fullName: string;
      studentId: string;
      profilePhoto?: string;
    }>;
    studentCount: number;
  };
  message?: string;
}

export interface ClassListResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description?: string;
    gradeLevel: string;
    studentCount: number;
    subjectCount: number;
    teacherCount: number;
  }>;
  pagination?: PaginationMeta;
  message?: string;
}

export interface StudentListResponse {
  success: boolean;
  data: Array<{
    id: string;
    studentId: string;
    fullName: string;
    email?: string;
    className?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
    profilePhoto?: string;
    totalXp?: number;
    level?: number;
  }>;
  pagination?: PaginationMeta;
  message?: string;
}

export interface AttendanceListResponse {
  success: boolean;
  data: Array<{
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    reason?: 'ALPA' | 'IZIN' | 'SAKIT';
    timeIn?: string;
    notes?: string;
  }>;
  pagination?: PaginationMeta;
  message?: string;
}

export interface GradeListResponse {
  success: boolean;
  data: Array<{
    id: string;
    studentId: string;
    studentName: string;
    subjectId: string;
    subjectName: string;
    gradeType: 'TUGAS_HARIAN' | 'QUIZ' | 'ULANGAN_HARIAN' | 'PTS' | 'PAS' | 'PRAKTIK' | 'SIKAP' | 'KETERAMPILAN';
    score: number;
    maxScore: number;
    description?: string;
    date: string;
  }>;
  pagination?: PaginationMeta;
  message?: string;
}

// Error types for better error handling
export type ApiErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR' 
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

export interface DetailedApiError {
  success: false;
  error: string;
  message?: string;
  type: ApiErrorType;
  details?: Record<string, string[]>; // For validation errors
  statusCode: number;
}

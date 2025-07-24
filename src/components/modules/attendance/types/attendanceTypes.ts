// Types and interfaces specific to attendance management
import { Attendance, Student } from '../../../../services/types';

// Extended class interface to handle API variations
export interface Class {
  id: string;
  name: string;
  subject?: string | {
    id: string;
    name: string;
    code: string;
  };
  start_time?: string;
  end_time?: string;
  description?: string;
  studentCount?: number;
  gradeLevel?: string;
  academicYear?: string;
  teacherId?: string;
  schoolId?: string;
}

// Attendance statistics type
export interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  notMarkedCount: number;
  presentPercentage: number;
}

// Attendance status types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AbsentReason = 'ALPA' | 'IZIN' | 'SAKIT';

// Form state interfaces
export interface EditAttendanceForm {
  status: string;
  reason: string;
  notes: string;
}

export interface AbsentForm {
  reason: AbsentReason;
  notes: string;
}

// Attendance record for creation
export interface AttendanceRecord {
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  timeIn: string;
  notes: string;
  reason?: AbsentReason;
}

// Component props interfaces
export interface AttendanceFiltersProps {
  classes: Class[];
  selectedClass: string;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  onClassChange: (classId: string) => void;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  onBulkMarkPresent: () => void;
}

export interface AttendanceStatsProps {
  stats: AttendanceStats;
  isVisible: boolean;
}

export interface AttendanceTableProps {
  students: Student[];
  attendanceData: Attendance[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  isLoading: boolean;
  isSaving: boolean;
  onPageChange: (page: number) => void;
  onQuickMark: (studentId: string, status: AttendanceStatus) => void;
  onEditClick: (student: Student, attendance: Attendance) => void;
  onAbsentClick: (student: Student) => void;
}

export interface AttendanceModalsProps {
  // Edit modal props
  isEditOpen: boolean;
  onEditClose: () => void;
  selectedStudent: Student | null;
  editForm: EditAttendanceForm;
  onEditFormChange: (field: keyof EditAttendanceForm, value: string) => void;
  onEditSubmit: () => void;
  
  // Absent modal props
  isAbsentOpen: boolean;
  onAbsentClose: () => void;
  selectedStudentForAbsent: Student | null;
  absentForm: AbsentForm;
  onAbsentFormChange: (field: keyof AbsentForm, value: string) => void;
  onAbsentSubmit: () => void;
  
  // Common props
  selectedDate: string;
  isSaving: boolean;
}

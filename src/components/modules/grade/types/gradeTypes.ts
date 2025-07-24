// Types and interfaces for grade management
import { Class as ApiClass } from '../../../../services/expressApi';

export interface GradeRecord {
  id?: string;
  studentId: string;
  subjectId: string;
  classId: string;
  gradeType: 'TUGAS_HARIAN' | 'QUIZ' | 'ULANGAN_HARIAN' | 'PTS' | 'PAS' | 'PRAKTIK' | 'SIKAP' | 'KETERAMPILAN';
  score: number;
  maxScore: number;
  description?: string;
  date: string;
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
}

export interface GradeStudent {
  id: string;
  studentId: string;
  fullName: string;
  classId?: string;
}

// Use the API Class type directly
export type Class = ApiClass;

export type GradeType = 'TUGAS_HARIAN' | 'QUIZ' | 'ULANGAN_HARIAN' | 'PTS' | 'PAS' | 'PRAKTIK' | 'SIKAP' | 'KETERAMPILAN';

// Grade statistics interface
export interface GradeStats {
  totalStudents: number;
  totalGrades: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
}

// Form interfaces
export interface GradeEditForm {
  score: string;
  maxScore: string;
  description: string;
}

export interface BulkGradeForm {
  gradeType: GradeType;
  maxScore: string;
  description: string;
  date: string;
}

// Component props interfaces
export interface GradeFiltersProps {
  classes: Class[];
  selectedClass: string;
  selectedGradeType: string;
  selectedDate: string;
  isLoading: boolean;
  onClassChange: (classId: string) => void;
  onGradeTypeChange: (gradeType: string) => void;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
}

export interface GradeStatsProps {
  stats: GradeStats;
  isVisible: boolean;
}

export interface GradeTableProps {
  students: GradeStudent[];
  grades: GradeRecord[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  isLoading: boolean;
  isSaving: boolean;
  onPageChange: (page: number) => void;
  onEditClick: (student: GradeStudent, grade?: GradeRecord) => void;
  onDeleteGrade: (gradeId: string) => void;
}

export interface GradeModalsProps {
  // Edit modal props
  isEditOpen: boolean;
  onEditClose: () => void;
  selectedStudent: GradeStudent | null;
  selectedGrade: GradeRecord | null;
  editForm: GradeEditForm;
  onEditFormChange: (field: keyof GradeEditForm, value: string) => void;
  onEditSubmit: () => void;
  
  // Bulk modal props  
  isBulkOpen: boolean;
  onBulkClose: () => void;
  bulkForm: BulkGradeForm;
  onBulkFormChange: (field: keyof BulkGradeForm, value: string) => void;
  onBulkSubmit: () => void;
  
  // Common props
  isSaving: boolean;
}

export interface GradeRecapProps {
  classes: Class[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
}

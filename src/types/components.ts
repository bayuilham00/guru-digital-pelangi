// Component Prop Interfaces - Standardized prop types for components
// Used for consistent typing across all components

import { ReactNode } from 'react';
import { User, Class, Student, Attendance, Grade } from '../services/types';
import { LoadingState, Notification } from './common';

// ================================================
// TABLE AND DATA COMPONENTS
// ================================================

export interface StudentTableProps {
  students: Student[];
  selectedKeys: Set<string>;
  visibleColumns: Set<string>;
  sortDescriptor: {
    column: string;
    direction: 'ascending' | 'descending';
  };
  isLoading: boolean;
  topContent: ReactNode;
  bottomContent: ReactNode;
  onSelectionChange: (keys: "all" | Set<React.Key>) => void;
  onSortChange: (descriptor: { column: React.Key; direction: "ascending" | "descending" }) => void;
  onRowAction: (key: React.Key) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => Promise<void>;
  initialData?: Partial<Student>;
  mode: 'create' | 'edit';
  loading?: boolean;
  classes: Class[];
}

export interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Partial<Student>[]) => Promise<void>;
  loading?: boolean;
}

export interface BulkAssignClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (classId: string, studentIds: string[]) => Promise<void>;
  selectedStudents: Student[];
  classes: Class[];
  loading?: boolean;
}

// ================================================
// LAYOUT COMPONENT PROPS
// ================================================

export interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  user?: User;
}

export interface DashboardProps {
  user: User;
  children?: ReactNode;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

// ================================================
// DATA DISPLAY COMPONENT PROPS
// ================================================

export interface DataTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    render?: (value: any, record: T) => ReactNode;
    sortable?: boolean;
    width?: string | number;
  }>;
  loading?: boolean;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  searchable?: boolean;
  onSearch?: (searchTerm: string) => void;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

export interface ChartProps {
  data: Array<{ [key: string]: any }>;
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
}

// ================================================
// FORM COMPONENT PROPS
// ================================================

export interface FormModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  initialData?: Partial<T>;
  title: string;
  mode: 'create' | 'edit';
  loading?: boolean;
}

export interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
  debounceMs?: number;
}

export interface FilterSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiple?: boolean;
  clearable?: boolean;
}

// ================================================
// SPECIFIC MODULE COMPONENT PROPS
// ================================================

export interface ClassCardProps {
  class: Class;
  onEdit?: (classData: Class) => void;
  onDelete?: (classData: Class) => void;
  onView?: (classData: Class) => void;
  showActions?: boolean;
}

export interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onView?: (student: Student) => void;
  showGrade?: boolean;
  showStatus?: boolean;
}

export interface AttendanceFormProps {
  classId: string;
  date: string;
  students: Student[];
  existingAttendance?: Attendance[];
  onSubmit: (attendanceData: Omit<Attendance, 'id'>[]) => Promise<void>;
  loading?: boolean;
}

export interface GradeInputProps {
  student: Student;
  subject: string;
  currentGrade?: Grade;
  onSubmit: (grade: Omit<Grade, 'id'>) => Promise<void>;
  maxScore?: number;
  gradeTypes: Array<{ value: string; label: string }>;
}

export interface StudentProgressProps {
  student: Student;
  grades: Grade[];
  attendance: Attendance[];
  period?: {
    start: string;
    end: string;
  };
}

// ================================================
// NAVIGATION COMPONENT PROPS
// ================================================

export interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  badge?: {
    count: number;
    color?: 'red' | 'blue' | 'green';
  };
  children?: MenuItemProps[];
}

export interface BreadcrumbProps {
  items: Array<{
    title: string;
    href?: string;
  }>;
  separator?: ReactNode;
}

// ================================================
// UTILITY COMPONENT PROPS
// ================================================

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface NotificationProps extends Notification {
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// ================================================
// MODAL COMPONENT PROPS
// ================================================

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export interface DetailModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  data: T;
  title: string;
  actions?: ReactNode;
}

// ================================================
// DASHBOARD COMPONENT PROPS
// ================================================

export interface DashboardStatsProps {
  stats: {
    totalClasses: number;
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    averageGrade: number;
  };
  loading?: boolean;
}

export interface RecentActivitiesProps {
  activities: Array<{
    id: string;
    type: 'attendance' | 'grade' | 'assignment' | 'announcement';
    title: string;
    description: string;
    timestamp: string;
    user?: {
      name: string;
      avatar?: string;
    };
  }>;
  loading?: boolean;
  limit?: number;
}

export interface ClassOverviewProps {
  classes: Class[];
  onClassSelect: (classData: Class) => void;
  selectedClassId?: string;
  loading?: boolean;
}

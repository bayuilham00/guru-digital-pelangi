// Common Base Types for Guru Digital Pelangi
// Shared types used across the application

// ================================================
// UTILITY TYPES
// ================================================

export type ID = string;
export type DateTime = string; // ISO string
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// ================================================
// COMMON ENUMS
// ================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  GURU = 'GURU',
  SISWA = 'SISWA'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED'
}

export enum Gender {
  L = 'L', // Laki-laki
  P = 'P'  // Perempuan
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export enum AttendanceReason {
  ALPA = 'ALPA',
  IZIN = 'IZIN',
  SAKIT = 'SAKIT'
}

export enum GradeType {
  TUGAS_HARIAN = 'TUGAS_HARIAN',
  QUIZ = 'QUIZ',
  ULANGAN_HARIAN = 'ULANGAN_HARIAN',
  PTS = 'PTS',
  PAS = 'PAS',
  PRAKTIK = 'PRAKTIK',
  SIKAP = 'SIKAP',
  KETERAMPILAN = 'KETERAMPILAN'
}

// ================================================
// PAGINATION & API RESPONSE
// ================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BaseApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiResponse<T = any> extends BaseApiResponse {
  data?: T;
  pagination?: Pagination;
}

export interface ListResponse<T> extends BaseApiResponse {
  data: T[];
  pagination?: Pagination;
}

export interface DetailResponse<T> extends BaseApiResponse {
  data: T;
}

// ================================================
// FORM & VALIDATION TYPES
// ================================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// ================================================
// UI COMPONENT TYPES
// ================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

// ================================================
// NAVIGATION & MENU TYPES
// ================================================

export interface MenuItemBase {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface MenuItem extends MenuItemBase {
  children?: MenuItemBase[];
  roles?: UserRole[];
  badge?: {
    count: number;
    color?: 'red' | 'blue' | 'green' | 'yellow';
  };
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

// ================================================
// LOADING & ERROR STATES
// ================================================

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: DateTime;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface ListState<T> extends LoadingState {
  data: T[];
  pagination?: Pagination;
}

// ================================================
// FILTER & SEARCH TYPES
// ================================================

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: FilterOption[];
  sort?: SortOption[];
  page?: number;
  limit?: number;
}

// ================================================
// FILE & UPLOAD TYPES
// ================================================

export interface FileUpload {
  file: File;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  error?: string;
}

// ================================================
// NOTIFICATION TYPES
// ================================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  createdAt: DateTime;
}

// ================================================
// THEME & UI PREFERENCES
// ================================================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface UserPreferences {
  theme: ThemeConfig;
  language: 'id' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
}

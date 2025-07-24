// Export all attendance module components, hooks, and utilities
export { default as AttendanceManager } from './AttendanceManager';

// Components
export { default as AttendanceFilters } from './components/AttendanceFilters';
export { default as AttendanceStats } from './components/AttendanceStats';
export { default as AttendanceTable } from './components/AttendanceTable';
export { default as AttendanceModals } from './components/AttendanceModals';
export { default as AttendanceRecap } from './components/AttendanceRecap';
export { default as StatusIcon, getStatusIcon } from './components/StatusIcon';

// Hooks
export { useAttendanceData } from './hooks/useAttendanceData';
export { useAttendanceOperations } from './hooks/useAttendanceOperations';

// Utilities
export * from './utils/attendanceUtils';

// Types
export * from './types/attendanceTypes';

// Main Export File for All Services - Guru Digital Pelangi
// This file exports all services for easy importing

// Export types
export * from './types';

// Export API client configuration
export { apiClient, API_BASE_URL, getAuthHeaders } from './apiClient';

// Export all services
export { authService } from './authService';
export { classService } from './classService';
export { studentService } from './studentService';
export { attendanceService } from './attendanceService';
export { gradeService } from './gradeService';
export { gamificationService } from './gamificationService';
export { assignmentService } from './assignmentService';
export { schoolService } from './schoolService';
export { dashboardService } from './dashboardService';

// Import services for default export
import { authService } from './authService';
import { classService } from './classService';
import { studentService } from './studentService';
import { attendanceService } from './attendanceService';
import { gradeService } from './gradeService';
import { gamificationService } from './gamificationService';
import { assignmentService } from './assignmentService';
import { schoolService } from './schoolService';
import { dashboardService } from './dashboardService';

// For backward compatibility, also export as default object
const expressApi = {
  authService,
  classService,
  studentService,
  attendanceService,
  gradeService,
  gamificationService,
  assignmentService,
  schoolService,
  dashboardService
};

export default expressApi;

// Teacher Planner Module Exports
export { TeacherPlannerDashboard } from './TeacherPlannerDashboard';
export { CalendarView } from './calendar/CalendarView';
export { LessonPlanForm } from './planning/LessonPlanForm';
export { PlanCard } from './common/PlanCard';

// Re-export types from service
export type {
  TeacherPlan,
  LessonTemplate,
  CalendarData,
  CreatePlanRequest,
  CreateTemplateRequest,
  LearningObjective,
  Resource,
  TemplateStructure,
  LessonContent,
  Assessment
} from '@/services/teacherPlannerService';

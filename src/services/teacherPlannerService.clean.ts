// Teacher Planner Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse } from './types';

// Types for Teacher Planner
export interface TemplateStructure {
  opening?: string;
  mainActivity?: string;
  closing?: string;
  duration?: number;
  materials?: string[];
}

export interface LearningObjective {
  id: string;
  objective: string;
  indicator?: string;
  competency?: string;
}

export interface LessonContent {
  introduction?: string;
  mainContent?: string;
  conclusion?: string;
  activities?: string[];
}

export interface Assessment {
  type: 'formative' | 'summative' | 'diagnostic';
  method: string;
  criteria?: string;
  rubric?: string;
}

export interface Resource {
  type: 'document' | 'video' | 'audio' | 'image' | 'link';
  title: string;
  url?: string;
  description?: string;
}

export interface LessonTemplate {
  id: string;
  name: string;
  description?: string;
  subjectId?: string;
  templateStructure: TemplateStructure;
  learningObjectives: LearningObjective[];
  estimatedDuration?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  gradeLevel?: string;
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  createdByUser?: {
    id: string;
    fullName: string;
  };
}

export interface TeacherPlan {
  id: string;
  title: string;
  description?: string;
  classId: string;
  subjectId: string;
  templateId?: string;
  teacherId: string;
  scheduledDate: string;
  duration?: number;
  learningObjectives?: LearningObjective[];
  lessonContent?: LessonContent;
  assessment?: Assessment;
  resources?: Resource[];
  notes?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  class?: {
    id: string;
    name: string;
    gradeLevel: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    fullName: string;
  };
  template?: {
    id: string;
    name: string;
    templateStructure?: TemplateStructure;
    learningObjectives?: LearningObjective[];
  };
}

export interface CalendarData {
  [dateKey: string]: TeacherPlan[];
}

export interface CreatePlanRequest {
  title: string;
  description?: string;
  classId: string;
  subjectId: string;
  templateId?: string;
  scheduledDate: string;
  duration?: number;
  learningObjectives?: LearningObjective[];
  lessonContent?: LessonContent;
  assessment?: Assessment;
  resources?: Resource[];
  notes?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  subjectId?: string;
  templateStructure: TemplateStructure;
  learningObjectives: LearningObjective[];
  estimatedDuration?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  gradeLevel?: string;
  isPublic?: boolean;
}

// Error handling helper
const handleError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

export const teacherPlannerService = {
  // ================================================
  // LESSON TEMPLATES
  // ================================================
  
  // Get lesson templates
  async getTemplates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    difficultyLevel?: string;
    gradeLevel?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<LessonTemplate[]>> {
    try {
      const response = await apiClient.get('/teacher-planner/templates', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengambil template pembelajaran')
      };
    }
  },

  // Get template by ID
  async getTemplateById(templateId: string): Promise<ApiResponse<LessonTemplate>> {
    try {
      const response = await apiClient.get(`/teacher-planner/templates/${templateId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengambil template')
      };
    }
  },

  // Create lesson template
  async createTemplate(data: CreateTemplateRequest): Promise<ApiResponse<LessonTemplate>> {
    try {
      const response = await apiClient.post('/teacher-planner/templates', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Template berhasil dibuat'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal membuat template')
      };
    }
  },

  // Update lesson template
  async updateTemplate(templateId: string, data: Partial<CreateTemplateRequest>): Promise<ApiResponse<LessonTemplate>> {
    try {
      const response = await apiClient.put(`/teacher-planner/templates/${templateId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Template berhasil diupdate'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengupdate template')
      };
    }
  },

  // Delete lesson template
  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/teacher-planner/templates/${templateId}`);
      return {
        success: true,
        message: response.data.message || 'Template berhasil dihapus'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal menghapus template')
      };
    }
  },

  // ================================================
  // TEACHER PLANS
  // ================================================

  // Get teacher plans
  async getPlans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    teacherId?: string;
  }): Promise<ApiResponse<TeacherPlan[]>> {
    try {
      const response = await apiClient.get('/teacher-planner/plans', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengambil rencana pembelajaran')
      };
    }
  },

  // Get plan by ID
  async getPlanById(planId: string): Promise<ApiResponse<TeacherPlan>> {
    try {
      const response = await apiClient.get(`/teacher-planner/plans/${planId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengambil rencana pembelajaran')
      };
    }
  },

  // Create teacher plan
  async createPlan(data: CreatePlanRequest): Promise<ApiResponse<TeacherPlan>> {
    try {
      const response = await apiClient.post('/teacher-planner/plans', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Rencana pembelajaran berhasil dibuat'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal membuat rencana pembelajaran')
      };
    }
  },

  // Update teacher plan
  async updatePlan(planId: string, data: Partial<CreatePlanRequest>): Promise<ApiResponse<TeacherPlan>> {
    try {
      const response = await apiClient.put(`/teacher-planner/plans/${planId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Rencana pembelajaran berhasil diupdate'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengupdate rencana pembelajaran')
      };
    }
  },

  // Delete teacher plan
  async deletePlan(planId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/teacher-planner/plans/${planId}`);
      return {
        success: true,
        message: response.data.message || 'Rencana pembelajaran berhasil dihapus'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal menghapus rencana pembelajaran')
      };
    }
  },

  // ================================================
  // CALENDAR DATA
  // ================================================

  // Get calendar data
  async getCalendarData(params?: {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
  }): Promise<ApiResponse<CalendarData>> {
    try {
      const response = await apiClient.get('/teacher-planner/calendar', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: handleError(error, 'Gagal mengambil data kalender')
      };
    }
  },

  // Helper function to get plans for a specific month
  async getPlansForMonth(year: number, month: number): Promise<ApiResponse<CalendarData>> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return this.getCalendarData({ startDate, endDate });
  },

  // Helper function to get plans for a specific week
  async getPlansForWeek(startDate: string, endDate: string): Promise<ApiResponse<CalendarData>> {
    return this.getCalendarData({ startDate, endDate });
  }
};

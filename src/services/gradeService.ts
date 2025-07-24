// Grade Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, Grade } from './types';

// Helper function for consistent error handling
const getErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: { message?: string, error?: string } } };
  return apiError.response?.data?.message || apiError.response?.data?.error || 'Terjadi kesalahan';
};

export const gradeService = {
  async getGrades(params?: {
    page?: number;
    limit?: number;
    classId?: string;
    subjectId?: string;
    studentId?: string;
    gradeType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Grade[]>> {
    try {
      const response = await apiClient.get('/grades', { params });
      return {
        success: true,
        data: response.data.data.grades,
        pagination: response.data.data.pagination
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data nilai'
      };
    }
  },

  async createGrade(data: Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'student' | 'subject' | 'class'>): Promise<ApiResponse<Grade>> {
    try {
      const response = await apiClient.post('/grades', data);
      return {
        success: true,
        data: response.data.data.grade,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal membuat nilai'
      };
    }
  },

  async updateGrade(id: string, data: Partial<Grade>): Promise<ApiResponse<Grade>> {
    try {
      const response = await apiClient.put(`/grades/${id}`, data);
      return {
        success: true,
        data: response.data.data.grade,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal update nilai'
      };
    }
  },

  async deleteGrade(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/grades/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal menghapus nilai'
      };
    }
  }
};

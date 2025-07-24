// Teacher Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, User } from './types';

// Helper function for error handling
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || fallback;
  }
  return fallback;
};

export const teacherService = {
  async getTeachers(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<User[]>> {
    try {
      const response = await apiClient.get('/teachers', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal mengambil data guru')
      };
    }
  },

  async deleteTeacher(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/teachers/${id}`);
      return {
        success: true,
        message: response.data.message
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal menghapus guru')
      };
    }
  }
};
// School Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, School } from './types';

// Helper function for consistent error handling
const getErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: { message?: string, error?: string } } };
  return apiError.response?.data?.message || apiError.response?.data?.error || 'Terjadi kesalahan';
};

export const schoolService = {
  async getSchools(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<School[]>> {
    try {
      const response = await apiClient.get('/schools', { params });
      return {
        success: true,
        data: response.data.data.schools,
        pagination: response.data.data.pagination
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data sekolah'
      };
    }
  },

  async createSchool(data: Omit<School, 'id'>): Promise<ApiResponse<School>> {
    try {
      const response = await apiClient.post('/schools', data);
      return {
        success: true,
        data: response.data.data.school,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal membuat sekolah'
      };
    }
  },

  async updateSchool(id: string, data: Partial<School>): Promise<ApiResponse<School>> {
    try {
      const response = await apiClient.put(`/schools/${id}`, data);
      return {
        success: true,
        data: response.data.data.school,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal update sekolah'
      };
    }
  },

  async deleteSchool(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/schools/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal menghapus sekolah'
      };
    }
  }
};

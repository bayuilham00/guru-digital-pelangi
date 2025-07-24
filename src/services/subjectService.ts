// Subject Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, Subject } from './types';

// Helper function for error handling
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || fallback;
  }
  return fallback;
};

export const subjectService = {
  async getSubjects(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Subject[]>> {
    try {
      const response = await apiClient.get('/subjects', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal mengambil data mata pelajaran')
      };
    }
  }
};
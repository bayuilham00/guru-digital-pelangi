// Attendance Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, Attendance } from './types';

// Helper function for consistent error handling
const getErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: { message?: string, error?: string } } };
  return apiError.response?.data?.message || apiError.response?.data?.error || 'Terjadi kesalahan';
};

export const attendanceService = {
  async getAttendance(params?: {
    page?: number;
    limit?: number;
    classId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Attendance[]>> {
    try {
      const response = await apiClient.get('/attendance', { params });
      return {
        success: true,
        data: response.data.data.attendance,
        pagination: response.data.data.pagination
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data kehadiran'
      };
    }
  },

  async markAttendance(data: {
    studentId: string;
    classId: string;
    date: string;
    status: string;
    timeIn?: string;
    timeOut?: string;
    notes?: string;
  }): Promise<ApiResponse<Attendance>> {
    try {
      const response = await apiClient.post('/attendance', data);
      return {
        success: true,
        data: response.data.data.attendance,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mencatat kehadiran'
      };
    }
  },

  async updateAttendance(id: string, data: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    try {
      const response = await apiClient.put(`/attendance/${id}`, data);
      return {
        success: true,
        data: response.data.data.attendance,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal update kehadiran'
      };
    }
  },

  async deleteAttendance(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/attendance/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal menghapus kehadiran'
      };
    }
  },

  async bulkMarkAttendance(data: {
    attendanceRecords: Array<{
      studentId: string;
      classId: string;
      date: string;
      status: string;
      timeIn?: string;
      notes?: string;
    }>;
  }): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> {
    try {
      const response = await apiClient.post('/attendance/bulk', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal bulk update kehadiran'
      };
    }
  }
};

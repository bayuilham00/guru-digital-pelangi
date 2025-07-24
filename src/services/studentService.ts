// Student Service for Guru Digital Pelangi
import { apiClient, API_BASE_URL, getAuthHeaders } from './apiClient';
import { ApiResponse, Student, Class } from './types';

// Helper function for consistent error handling
const getErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: { message?: string, error?: string } } };
  return apiError.response?.data?.message || apiError.response?.data?.error || 'Terjadi kesalahan';
};

export const studentService = {
  async getStudents(params?: { page?: number; limit?: number; search?: string; classId?: string }): Promise<ApiResponse<Student[]>> {
    try {
      const response = await apiClient.get('/students', { params });
      return {
        success: true,
        data: response.data.data.students,
        pagination: response.data.data.pagination
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data siswa'
      };
    }
  },

  async createStudent(data: Omit<Student, 'id' | 'studentXp' | 'class'>): Promise<ApiResponse<Student>> {
    try {
      const response = await apiClient.post('/students', data);
      return {
        success: true,
        data: response.data.data.student,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal membuat siswa'
      };
    }
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
    try {
      console.log('📤 Updating student:', id, 'with data:', data);
      const response = await apiClient.put(`/students/${id}`, data);
      console.log('📥 Update response:', response.data);
      return {
        success: response.data.success,
        data: response.data.data?.student || response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string, error?: string }, status?: number, statusText?: string } };
      console.error('❌ Update student error:', {
        id,
        data,
        error: apiError.response?.data,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText
      });
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal update siswa'
      };
    }
  },

  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal menghapus siswa'
      };
    }
  },
  
  async bulkAssignClass(studentIds: string[], classId: string): Promise<ApiResponse<{ updated: number; students: Student[]; targetClass: Partial<Class> }>> {
    try {
      console.log('📤 Bulk assigning class:', { studentIds, classId });
      const response = await apiClient.put('/students/bulk-assign-class', { studentIds, classId });
      console.log('📥 Bulk assign response:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string, error?: string }, status?: number, statusText?: string } };
      console.error('❌ Bulk assign class error:', {
        studentIds,
        classId,
        error: apiError.response?.data,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText
      });
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal bulk assign class'
      };
    }
  },

  async bulkImportStudents(students: Partial<Student>[]): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/students/bulk`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ students }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      return { 
        success: false, 
        error: getErrorMessage(error) || 'Gagal melakukan bulk import siswa' 
      };
    }
  },

  async getClassmates(studentId: string): Promise<ApiResponse<Student[]>> {
    try {
      console.log('🔍 Fetching classmates for student:', studentId);
      const response = await apiClient.get(`/students/${studentId}/classmates`);
      return {
        success: true,
        data: response.data.data.classmates || [],
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('❌ Error fetching classmates:', error);
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data teman sekelas'
      };
    }
  },

  async getStudentAttendance(studentId: string, params?: { month?: number; year?: number; subjectId?: string }): Promise<ApiResponse<{
    attendanceData: Array<{
      date: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'SICK' | 'PERMISSION';
      notes?: string;
      subject?: {
        id: string;
        name: string;
        code: string;
      };
    }>;
    summary: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      sickDays: number;
      permissionDays: number;
      attendancePercentage: number;
    };
  }>> {
    try {
      console.log('🔍 Fetching attendance for student:', studentId, 'params:', params);
      const response = await apiClient.get(`/students/${studentId}/attendance`, { params });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('❌ Error fetching attendance:', error);
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data absensi'
      };
    }
  },

  async getStudentSubjects(studentId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    code: string;
    description?: string;
  }>>> {
    try {
      console.log('🔍 Fetching subjects for student:', studentId);
      const response = await apiClient.get(`/students/${studentId}/attendance/subjects`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('❌ Error fetching subjects:', error);
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data mata pelajaran'
      };
    }
  }
};

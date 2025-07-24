// Class Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, Class, ClassDetail, SubjectWithTeachers, StudentWithDetails } from './types';

// Helper function for error handling
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || fallback;
  }
  return fallback;
};

export const classService = {
  async getClasses(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Class[]>> {
    try {
      const response = await apiClient.get('/classes', { params });
      return {
        success: true,
        data: response.data.data.classes,
        pagination: response.data.data.pagination
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal mengambil data kelas')
      };
    }
  },

  async getClassById(id: string): Promise<ApiResponse<Class>> {
    try {
      const response = await apiClient.get(`/classes/${id}`);
      return {
        success: true,
        data: response.data.data.class
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal mengambil detail kelas')
      };
    }
  },

  async createClass(data: Omit<Class, 'id' | 'studentCount'>): Promise<ApiResponse<Class>> {
    try {
      const response = await apiClient.post('/classes', data);
      return {
        success: true,
        data: response.data.data.class,
        message: response.data.message
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal membuat kelas')
      };
    }
  },

  async updateClass(id: string, data: Partial<Class>): Promise<ApiResponse<Class>> {
    try {
      const response = await apiClient.put(`/classes/${id}`, data);
      return {
        success: true,
        data: response.data.data.class,
        message: response.data.message
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal update kelas')
      };
    }
  },

  async deleteClass(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/classes/${id}`);
      return {
        success: true,
        message: response.data.message
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal menghapus kelas')
      };
    }
  },

  async getClassDetail(id: string): Promise<ApiResponse<ClassDetail>> {
    try {
      // Use the standard classes endpoint that works for both admin and teachers
      const response = await apiClient.get(`/classes/${id}`);
      
      if (response.data.message === 'Class data retrieved successfully' && response.data.data) {
        const classData = response.data.data;
        
        // Transform the API response to match the expected ClassDetail interface
        const transformedData: ClassDetail = {
          id: classData.id,
          name: classData.name,
          gradeLevel: classData.gradeLevel,
          description: classData.description,
          studentCount: classData.studentCount || 0,
          subjects: classData.subjects?.map((subject: SubjectWithTeachers) => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            teachers: subject.teachers || []
          })) || [],
          students: classData.students?.map((student: StudentWithDetails) => ({
            id: student.id,
            fullName: student.fullName,
            email: student.email,
            assignments: {
              completed: 0, // These would come from assignments API
              total: 0,
              averageScore: 0
            },
            attendance: {
              present: 0, // These would come from attendance API
              absent: 0,
              sick: 0,
              permission: 0,
              total: 0
            },
            grades: [], // These would come from grades API
            averageGrade: 0
          })) || [],
          assignments: [], // This would come from assignments API
          statistics: {
            totalStudents: classData.studentCount || 0,
            averageGrade: 0, // This would be calculated from grades
            attendanceRate: 0, // This would be calculated from attendance
            assignmentCompletionRate: 0, // This would be calculated from assignments
            activeAssignments: 0 // This would come from assignments API
          }
        };
        
        return {
          success: true,
          data: transformedData
        };
      } else {
        return {
          success: false,
          error: 'Data kelas tidak ditemukan'
        };
      }

    } catch (error: unknown) {
      console.error('Error in getClassDetail:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Gagal mengambil detail kelas')
      };
    }
  }
};

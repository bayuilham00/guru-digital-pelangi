// Assignment Service for Guru Digital Pelangi
import { getAuthHeaders, API_BASE_URL } from './apiClient';

export const assignmentService = {
  // Get assignments for current teacher
  getAssignments: async (params?: {
    classId?: string;
    status?: string;
    type?: string;
    search?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/assignments?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return { success: false, error: 'Gagal mengambil data tugas' };
    }
  },

  // Get assignment statistics
  getAssignmentStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      return { success: false, error: 'Gagal mengambil statistik tugas' };
    }
  },

  // Get single assignment details
  getAssignment: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return { success: false, error: 'Gagal mengambil detail tugas' };
    }
  },

  // Get assignment submissions with student data
  getAssignmentSubmissions: async (assignmentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submissions`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      return { success: false, error: 'Gagal mengambil data pengumpulan tugas' };
    }
  },

  // Grade a student submission
  gradeSubmission: async (assignmentId: string, studentId: string, gradeData: {
    grade: number;
    feedback: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submissions/${studentId}/grade`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(gradeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error grading submission:', error);
      return { success: false, error: 'Gagal memberikan nilai' };
    }
  },

  // Bulk grade submissions
  bulkGradeSubmissions: async (assignmentId: string, bulkData: {
    studentIds: string[];
    grade: number;
    feedback: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/bulk-grade`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk grading:', error);
      return { success: false, error: 'Gagal memberikan nilai bulk' };
    }
  },

  // Create new assignment
  createAssignment: async (assignmentData: {
    title: string;
    description?: string;
    instructions?: string;
    points?: number;
    deadline: string;
    type?: string;
    classId: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, error: 'Gagal membuat tugas' };
    }
  },

  // Update assignment
  updateAssignment: async (id: string, assignmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating assignment:', error);
      return { success: false, error: 'Gagal mengupdate tugas' };
    }
  },

  // Delete assignment
  deleteAssignment: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return { success: false, error: 'Gagal menghapus tugas' };
    }
  }
};

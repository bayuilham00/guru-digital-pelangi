// Gamification Service for Guru Digital Pelangi
import { apiClient, getAuthHeaders, API_BASE_URL } from './apiClient';
import { ApiResponse, StudentXp, Achievement } from './types';

// Helper function for consistent error handling
const getErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: { message?: string, error?: string } } };
  return apiError.response?.data?.message || apiError.response?.data?.error || 'Terjadi kesalahan';
};

export const gamificationService = {
  async getStudentXp(studentId: string): Promise<ApiResponse<StudentXp>> {
    try {
      const response = await apiClient.get(`/gamification/student/${studentId}`);
      return {
        success: true,
        data: response.data.data.studentXp
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data XP siswa'
      };
    }
  },

  async getClassLeaderboard(classId: string, params?: { limit?: number }): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await apiClient.get(`/gamification/leaderboard/class/${classId}`, { params });
      return {
        success: true,
        data: response.data.data.leaderboard
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil leaderboard kelas'
      };
    }
  },

  async getGlobalLeaderboard(params?: { limit?: number }): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await apiClient.get('/gamification/leaderboard/global', { params });
      return {
        success: true,
        data: response.data.data.leaderboard
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil leaderboard global'
      };
    }
  },

  async addXp(studentId: string, amount: number, reason: string): Promise<ApiResponse<StudentXp>> {
    try {
      const response = await apiClient.post('/gamification/xp/add', {
        studentId,
        amount,
        reason
      });
      return {
        success: true,
        data: response.data.data.studentXp,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal menambah XP'
      };
    }
  },

  async getAchievements(studentId?: string): Promise<ApiResponse<Achievement[]>> {
    try {
      const url = studentId ? `/gamification/achievements/${studentId}` : '/gamification/achievements';
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data.data.achievements
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil pencapaian'
      };
    }
  },

  async getLevels(): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/gamification/levels`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data.levels
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data level'
      };
    }
  },

  async createLevel(levelData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/gamification/levels`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(levelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data.level,
        message: data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal membuat level'
      };
    }
  },

  async updateLevel(id: string, levelData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/gamification/levels/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(levelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data.level,
        message: data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengupdate level'
      };
    }
  },

  async deleteLevel(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/gamification/levels/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal menghapus level'
      };
    }
  }
};

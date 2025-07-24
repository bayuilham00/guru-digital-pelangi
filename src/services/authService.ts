// Authentication Service for Guru Digital Pelangi
import { apiClient } from './apiClient';
import { ApiResponse, User } from './types';

// Helper function for consistent error handling
const getErrorMessage = (error: unknown): string => {
  const apiError = error as { response?: { data?: { message?: string, error?: string } } };
  return apiError.response?.data?.message || apiError.response?.data?.error || 'Terjadi kesalahan';
};

export const authService = {
  async login(identifier: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password
      });

      console.log('🔧 ExpressAPI: Login response data:', response.data);

      // Store token
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
        console.log('🔧 ExpressAPI: Token stored:', response.data.data.token.substring(0, 20) + '...');
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Login gagal'
      };
    }
  },

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    nip?: string;
    classId?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Registrasi gagal'
      };
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post('/auth/logout');
      
      // Clear token
      localStorage.removeItem('auth_token');
      
      return {
        success: true,
        message: response.data.message || 'Logout berhasil'
      };
    } catch (error: unknown) {
      // Even if API call fails, clear local token
      localStorage.removeItem('auth_token');
      return {
        success: false,
        error: getErrorMessage(error) || 'Logout gagal'
      };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get('/auth/me');
      return {
        success: true,
        data: response.data.data.user
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengambil data user'
      };
    }
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return {
        success: true,
        data: response.data.data.user,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal update profil'
      };
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error) || 'Gagal mengganti password'
      };
    }
  }
};

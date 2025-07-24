// Subjects Service for Teacher Planner
import { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export const subjectsService = {
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data || result,
        message: 'Success'
      };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch subjects'
      };
    }
  }
};

export default subjectsService;

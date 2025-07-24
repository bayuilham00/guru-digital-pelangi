// Dashboard Service for Guru Digital Pelangi
import { getAuthHeaders, API_BASE_URL } from './apiClient';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: 'Gagal mengambil statistik dashboard' };
    }
  },

  // Get recent classes
  getRecentClasses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-classes`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent classes:', error);
      return { success: false, error: 'Gagal mengambil kelas terbaru' };
    }
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-activities`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return { success: false, error: 'Gagal mengambil aktivitas terbaru' };
    }
  }
};

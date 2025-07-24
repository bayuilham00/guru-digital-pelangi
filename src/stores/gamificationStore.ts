// Updated: Gamification store with XP, badges, and leaderboard
import { create } from 'zustand';
import type { StudentXP, Badge, Leaderboard } from '../types/api';
// XP service will be implemented in expressApi later

interface GamificationState {
  leaderboard: Leaderboard[];
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLeaderboard: (classId?: string) => Promise<void>;
  addXP: (studentId: string, xpAmount: number, reason: string) => Promise<boolean>;
  clearError: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  leaderboard: [],
  badges: [],
  isLoading: false,
  error: null,

  fetchLeaderboard: async (classId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await xpService.getLeaderboard(classId);
      
      if (response.success && response.data) {
        set({
          leaderboard: response.data,
          isLoading: false
        });
      } else {
        set({
          error: response.error || 'Gagal mengambil data leaderboard',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat mengambil data leaderboard',
        isLoading: false
      });
    }
  },

  addXP: async (studentId: string, xpAmount: number, reason: string) => {
    try {
      const response = await xpService.addXP(studentId, xpAmount, reason);
      
      if (response.success) {
        // Refresh leaderboard after XP addition
        const { fetchLeaderboard } = get();
        await fetchLeaderboard();
        return true;
      } else {
        set({
          error: response.error || 'Gagal menambahkan XP'
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat menambahkan XP'
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

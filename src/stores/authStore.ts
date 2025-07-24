// Updated: Authentication store with Express API integration
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (identifier: string, password: string) => {
        console.log('🔐 AuthStore: Starting login...', { identifier });
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(identifier, password);
          console.log('🔐 AuthStore: Login response:', response);

          if (response.success && response.data) {
            console.log('🔐 AuthStore: Login successful, setting user:', response.data.user);
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            console.log('🔐 AuthStore: Login failed:', response.error);
            set({
              error: response.error || 'Login gagal',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          console.error('🔐 AuthStore: Login error:', error);
          set({
            error: 'Terjadi kesalahan saat login',
            isLoading: false
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        console.log('🔐 AuthStore: checkAuth called');
        const { user } = get();
        const token = localStorage.getItem('auth_token');
        console.log('🔐 AuthStore: checkAuth - user:', !!user, 'token:', !!token);

        if (user && token) {
          try {
            const response = await authService.getCurrentUser();
            console.log('🔐 AuthStore: checkAuth response:', response);
            if (response.success && response.data) {
              set({ user: response.data, isAuthenticated: true });
            } else {
              console.log('🔐 AuthStore: checkAuth failed, clearing auth');
              set({ user: null, isAuthenticated: false });
            }
          } catch (error) {
            console.error('🔐 AuthStore: checkAuth error:', error);
            set({ user: null, isAuthenticated: false });
          }
        } else {
          console.log('🔐 AuthStore: checkAuth - no user or token, skipping');
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

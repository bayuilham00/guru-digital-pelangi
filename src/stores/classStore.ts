// Updated: Class management store with Express API integration
import { create } from 'zustand';
import { classService, type Class } from '../services/expressApi';

interface ClassState {
  classes: Class[];
  selectedClass: Class | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchClasses: () => Promise<void>;
  createClass: (classData: Partial<Class>) => Promise<boolean>;
  updateClass: (id: string, classData: Partial<Class>) => Promise<boolean>;
  deleteClass: (id: string) => Promise<boolean>;
  selectClass: (classItem: Class | null) => void;
  clearError: () => void;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  selectedClass: null,
  isLoading: false,
  error: null,

  fetchClasses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await classService.getClasses();
      
      if (response.success && response.data) {
        set({
          classes: response.data,
          isLoading: false
        });
      } else {
        set({
          error: response.error || 'Gagal mengambil data kelas',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat mengambil data kelas',
        isLoading: false
      });
    }
  },

  createClass: async (classData: Partial<Class>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await classService.createClass(classData);
      
      if (response.success && response.data) {
        const { classes } = get();
        set({
          classes: [...classes, response.data],
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.error || 'Gagal membuat kelas',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat membuat kelas',
        isLoading: false
      });
      return false;
    }
  },

  updateClass: async (id: string, classData: Partial<Class>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await classService.updateClass(id, classData);
      
      if (response.success && response.data) {
        const { classes } = get();
        const updatedClasses = classes.map(cls => 
          cls.id === id ? response.data! : cls
        );
        
        set({
          classes: updatedClasses,
          selectedClass: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.error || 'Gagal mengupdate kelas',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat mengupdate kelas',
        isLoading: false
      });
      return false;
    }
  },

  deleteClass: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await classService.deleteClass(id);
      
      if (response.success) {
        const { classes, selectedClass } = get();
        const updatedClasses = classes.filter(cls => cls.id !== id);
        
        set({
          classes: updatedClasses,
          selectedClass: selectedClass?.id === id ? null : selectedClass,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.error || 'Gagal menghapus kelas',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat menghapus kelas',
        isLoading: false
      });
      return false;
    }
  },

  selectClass: (classItem: Class | null) => {
    set({ selectedClass: classItem });
  },

  clearError: () => {
    set({ error: null });
  }
}));

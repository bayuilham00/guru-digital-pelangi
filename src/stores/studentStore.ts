// Updated: Student management store with Express API integration
import { create } from 'zustand';
import { studentService, type Student } from '../services/expressApi';

interface StudentState {
  students: Student[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStudents: (classId?: string) => Promise<void>;
  createStudent: (studentData: Partial<Student>) => Promise<boolean>;
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  selectStudent: (student: Student | null) => void;
  clearError: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  selectedStudent: null,
  isLoading: false,
  error: null,

  fetchStudents: async (classId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentService.getStudents(classId);
      
      if (response.success && response.data) {
        set({
          students: response.data,
          isLoading: false
        });
      } else {
        set({
          error: response.error || 'Gagal mengambil data siswa',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat mengambil data siswa',
        isLoading: false
      });
    }
  },

  createStudent: async (studentData: Partial<Student>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentService.createStudent(studentData);
      
      if (response.success && response.data) {
        const { students } = get();
        set({
          students: [...students, response.data],
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.error || 'Gagal menambahkan siswa',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat menambahkan siswa',
        isLoading: false
      });
      return false;
    }
  },

  updateStudent: async (id: string, studentData: Partial<Student>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentService.updateStudent(id, studentData);
      
      if (response.success && response.data) {
        const { students } = get();
        const updatedStudents = students.map(student => 
          student.id === id ? response.data! : student
        );
        
        set({
          students: updatedStudents,
          selectedStudent: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.error || 'Gagal mengupdate data siswa',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat mengupdate data siswa',
        isLoading: false
      });
      return false;
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentService.deleteStudent(id);
      
      if (response.success) {
        const { students, selectedStudent } = get();
        const updatedStudents = students.filter(student => student.id !== id);
        
        set({
          students: updatedStudents,
          selectedStudent: selectedStudent?.id === id ? null : selectedStudent,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.error || 'Gagal menghapus siswa',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Terjadi kesalahan saat menghapus siswa',
        isLoading: false
      });
      return false;
    }
  },

  selectStudent: (student: Student | null) => {
    set({ selectedStudent: student });
  },

  clearError: () => {
    set({ error: null });
  }
}));

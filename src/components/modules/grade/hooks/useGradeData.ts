// Custom hook for managing grade data fetching and state
import { useState, useEffect, useCallback } from 'react';
import { gradeService, classService, studentService } from '../../../../services/expressApi';
import { GradeRecord, GradeStudent, GradeClass } from '../types/gradeTypes';

export const useGradeData = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedGradeType, setSelectedGradeType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [students, setStudents] = useState<GradeStudent[]>([]);
  const [classes, setClasses] = useState<GradeClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load classes on component mount
  const loadClasses = useCallback(async () => {
    try {
      const response = await classService.getClasses();
      if (response.success && response.data) {
        // Map to GradeClass format
        const mappedClasses: GradeClass[] = response.data.map(cls => ({
          id: cls.id,
          name: cls.name,
          subject: (cls.subject && typeof cls.subject === 'object') ? (cls.subject as any).name : (cls.subject as string || '')
        }));
        setClasses(mappedClasses);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      const response = await studentService.getStudents({ classId: selectedClass });
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
    setIsLoading(false);
  }, [selectedClass]);

  const loadGrades = useCallback(async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    try {
      const params: { classId: string; date: string; gradeType?: string } = {
        classId: selectedClass,
        date: selectedDate
      };

      if (selectedGradeType) params.gradeType = selectedGradeType;

      const response = await gradeService.getGrades(params);
      if (response.success && response.data) {
        setGrades(response.data);
      } else {
        setGrades([]);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      setGrades([]);
    }
    setIsLoading(false);
  }, [selectedClass, selectedDate, selectedGradeType]);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Load students and grades when dependencies change
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadGrades();
    }
  }, [selectedClass, selectedGradeType, selectedDate, loadStudents, loadGrades]);

  return {
    // State
    selectedClass,
    selectedGradeType,
    selectedDate,
    grades,
    students,
    classes,
    isLoading,
    
    // Actions
    setSelectedClass,
    setSelectedGradeType,
    setSelectedDate,
    loadGrades,
    
    // Computed
    refresh: () => {
      loadStudents();
      loadGrades();
    }
  };
};

// Custom hook for managing attendance data fetching and state
import { useState, useEffect, useCallback } from 'react';
import { classService, studentService, attendanceService } from '../../../../services/expressApi';
import { Attendance, Student } from '../../../../services/types';
import { Class } from '../types/attendanceTypes';

export const useAttendanceData = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load classes on component mount
  const loadClasses = useCallback(async () => {
    try {
      const response = await classService.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, []);

  const loadAttendanceAndStudents = useCallback(async () => {
    if (!selectedClass || !selectedDate) return;
    
    setIsLoading(true);
    try {
      // Load students in the class
      const studentsResponse = await studentService.getStudents({ classId: selectedClass });
      if (studentsResponse.success && studentsResponse.data) {
        setAllStudents(studentsResponse.data);
      }

      // Load existing attendance for the date
      const attendanceResponse = await attendanceService.getAttendance({
        classId: selectedClass,
        startDate: selectedDate,
        endDate: selectedDate
      });

      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendanceData(attendanceResponse.data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, [selectedClass, selectedDate]);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Load attendance when class or date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendanceAndStudents();
    }
  }, [selectedClass, selectedDate, loadAttendanceAndStudents]);

  return {
    // State
    selectedClass,
    selectedDate,
    attendanceData,
    allStudents,
    classes,
    isLoading,
    
    // Actions
    setSelectedClass,
    setSelectedDate,
    loadAttendanceAndStudents,
    
    // Computed
    refresh: loadAttendanceAndStudents
  };
};

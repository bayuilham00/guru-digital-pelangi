// Attendance utility functions for status handling and formatting
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Attendance, Student } from '../../../../services/types';

// Status color mapping for HeroUI components
export const getStatusColor = (status: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
  switch (status) {
    case 'PRESENT': return 'success';
    case 'LATE': return 'warning';
    case 'ABSENT': return 'danger';
    case 'EXCUSED': return 'primary';
    default: return 'default';
  }
};

// Status icon mapping - returns icon name instead of JSX
export const getStatusIconName = (status: string): string => {
  switch (status) {
    case 'PRESENT': return 'CheckCircle';
    case 'LATE': return 'AlertCircle';
    case 'ABSENT': return 'XCircle';
    case 'EXCUSED': return 'Clock';
    default: return '';
  }
};

// Status text formatting with reason
export const getStatusText = (status: string, reason?: string) => {
  switch (status) {
    case 'PRESENT': return 'Hadir';
    case 'LATE': return 'Terlambat';
    case 'ABSENT':
      if (reason) {
        switch (reason) {
          case 'ALPA': return 'Tidak Hadir (Alpa)';
          case 'IZIN': return 'Tidak Hadir (Izin)';
          case 'SAKIT': return 'Tidak Hadir (Sakit)';
          default: return 'Tidak Hadir';
        }
      }
      return 'Tidak Hadir';
    case 'EXCUSED': return 'Izin';
    default: return 'Belum Dicek';
  }
};

// Calculate attendance statistics
export const calculateAttendanceStats = (allStudents: Student[], attendanceData: Attendance[]) => {
  const totalStudents = allStudents.length;
  const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length;
  const lateCount = attendanceData.filter(a => a.status === 'LATE').length;
  const absentCount = attendanceData.filter(a => a.status === 'ABSENT').length;
  const notMarkedCount = totalStudents - attendanceData.length;

  const presentPercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return {
    totalStudents,
    presentCount,
    lateCount,
    absentCount,
    notMarkedCount,
    presentPercentage
  };
};

// Get attendance record for a specific student
export const getStudentAttendance = (studentId: string, attendanceData: Attendance[]) => {
  return attendanceData.find(att => att.studentId === studentId);
};

// Format time for Indonesian locale
export const formatTimeForLocale = () => {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

// Pagination utility
export const getPaginatedItems = function<T>(items: T[], page: number, itemsPerPage: number): T[] {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

// Calculate total pages
export const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

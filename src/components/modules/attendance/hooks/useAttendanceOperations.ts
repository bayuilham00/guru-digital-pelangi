// Custom hook for handling attendance CRUD operations
import { useState } from 'react';
import { attendanceService } from '../../../../services/expressApi';
import { Attendance, Student } from '../../../../services/types';
import { AttendanceStatus, AbsentReason, AttendanceRecord } from '../types/attendanceTypes';
import { formatTimeForLocale } from '../utils/attendanceUtils';

interface UseAttendanceOperationsProps {
  selectedClass: string;
  selectedDate: string;
  allStudents: Student[];
  onDataRefresh: () => void;
}

export const useAttendanceOperations = ({
  selectedClass,
  selectedDate,
  allStudents,
  onDataRefresh
}: UseAttendanceOperationsProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleQuickMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    setIsSaving(true);
    try {
      const attendanceRecord: AttendanceRecord = {
        studentId,
        classId: selectedClass,
        date: selectedDate,
        status,
        timeIn: formatTimeForLocale(),
        notes: ''
      };

      const response = await attendanceService.markAttendance(attendanceRecord);
      if (response.success) {
        onDataRefresh();
        alert('Presensi berhasil disimpan!');
      } else {
        alert('Error: ' + (response.error || 'Gagal menyimpan presensi'));
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Terjadi error saat menyimpan presensi');
    }
    setIsSaving(false);
  };

  const handleAbsentSubmit = async (student: Student, reason: AbsentReason, notes: string) => {
    setIsSaving(true);
    try {
      const attendanceRecord: AttendanceRecord = {
        studentId: student.id,
        classId: selectedClass,
        date: selectedDate,
        status: 'ABSENT',
        reason,
        timeIn: formatTimeForLocale(),
        notes
      };

      const response = await attendanceService.markAttendance(attendanceRecord);
      if (response.success) {
        onDataRefresh();
        alert('Presensi berhasil disimpan!');
        return true;
      } else {
        alert('Error: ' + (response.error || 'Gagal menyimpan presensi'));
        return false;
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Terjadi error saat menyimpan presensi');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAttendance = async (
    studentId: string,
    status: AttendanceStatus,
    notes: string,
    reason?: AbsentReason
  ) => {
    setIsSaving(true);
    try {
      const updateData: Partial<Attendance> = {
        status,
        notes
      };

      if (status === 'ABSENT' && reason) {
        updateData.reason = reason;
      }

      const response = await attendanceService.updateAttendance(studentId, updateData);
      if (response.success) {
        onDataRefresh();
        alert('Presensi berhasil diupdate!');
        return true;
      } else {
        alert('Error: ' + (response.error || 'Gagal update presensi'));
        return false;
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Terjadi error saat update presensi');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!confirm('Tandai semua siswa sebagai hadir?')) return;

    setIsSaving(true);
    try {
      const attendanceRecords = allStudents.map(student => ({
        studentId: student.id,
        classId: selectedClass,
        date: selectedDate,
        status: 'PRESENT',
        timeIn: formatTimeForLocale(),
        notes: ''
      }));

      const response = await attendanceService.bulkMarkAttendance({
        attendanceRecords
      });
      if (response.success) {
        onDataRefresh();
        alert('Semua siswa berhasil ditandai hadir!');
      } else {
        alert('Error: ' + (response.error || 'Gagal menyimpan presensi bulk'));
      }
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      alert('Terjadi error saat menyimpan presensi bulk');
    }
    setIsSaving(false);
  };

  return {
    isSaving,
    handleQuickMarkAttendance,
    handleAbsentSubmit,
    handleEditAttendance,
    handleBulkMarkPresent
  };
};

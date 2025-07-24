// Custom hook for handling grade CRUD operations
import { useState } from 'react';
import { gradeService } from '../../../../services/expressApi';
import { GradeRecord, GradeType, GradeStudent } from '../types/gradeTypes';

interface UseGradeOperationsProps {
  selectedClass: string;
  selectedDate: string;
  onDataRefresh: () => void;
}

export const useGradeOperations = ({
  selectedClass,
  selectedDate,
  onDataRefresh
}: UseGradeOperationsProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const createGrade = async (
    studentId: string,
    gradeType: GradeType,
    score: number,
    maxScore: number,
    description?: string
  ) => {
    setIsSaving(true);
    try {
      const gradeData = {
        studentId,
        classId: selectedClass,
        gradeType,
        score,
        maxScore,
        description: description || '',
        date: selectedDate
      };

      const response = await gradeService.createGrade(gradeData);
      if (response.success) {
        onDataRefresh();
        alert('Nilai berhasil disimpan!');
        return true;
      } else {
        alert('Error: ' + (response.error || 'Gagal menyimpan nilai'));
        return false;
      }
    } catch (error) {
      console.error('Error creating grade:', error);
      alert('Terjadi error saat menyimpan nilai');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateGrade = async (
    gradeId: string,
    score: number,
    maxScore: number,
    description?: string
  ) => {
    setIsSaving(true);
    try {
      const updateData = {
        score,
        maxScore,
        description: description || ''
      };

      const response = await gradeService.updateGrade(gradeId, updateData);
      if (response.success) {
        onDataRefresh();
        alert('Nilai berhasil diupdate!');
        return true;
      } else {
        alert('Error: ' + (response.error || 'Gagal update nilai'));
        return false;
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      alert('Terjadi error saat update nilai');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteGrade = async (gradeId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus nilai ini?')) return false;

    setIsSaving(true);
    try {
      const response = await gradeService.deleteGrade(gradeId);
      if (response.success) {
        onDataRefresh();
        alert('Nilai berhasil dihapus!');
        return true;
      } else {
        alert('Error: ' + (response.error || 'Gagal menghapus nilai'));
        return false;
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Terjadi error saat menghapus nilai');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const bulkCreateGrades = async (
    students: GradeStudent[],
    gradeType: GradeType,
    maxScore: number,
    description: string,
    scores: { [studentId: string]: number }
  ) => {
    setIsSaving(true);
    try {
      const gradeRecords = students.map(student => ({
        studentId: student.id,
        classId: selectedClass,
        gradeType,
        score: scores[student.id] || 0,
        maxScore,
        description,
        date: selectedDate
      }));

      const response = await gradeService.bulkCreateGrades(gradeRecords);
      if (response.success) {
        onDataRefresh();
        alert('Nilai berhasil disimpan untuk semua siswa!');
        return true;
      } else {
        alert('Error: ' + (response.error || 'Gagal menyimpan nilai bulk'));
        return false;
      }
    } catch (error) {
      console.error('Error bulk creating grades:', error);
      alert('Terjadi error saat menyimpan nilai bulk');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    createGrade,
    updateGrade,
    deleteGrade,
    bulkCreateGrades
  };
};

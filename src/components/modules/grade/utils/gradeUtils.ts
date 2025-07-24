// Grade utility functions for calculations and formatting
import { GradeRecord, GradeStudent, GradeStats, GradeType, Class } from '../types/gradeTypes';

// Extract subject name from class object (handles both string and object formats)
export const getSubjectName = (cls: Class): string => {
  if (typeof cls.subject === 'string') {
    return cls.subject;
  }
  if (typeof cls.subject === 'object' && cls.subject && 'name' in cls.subject) {
    return (cls.subject as { name: string }).name;
  }
  return 'Mata Pelajaran';
};

// Grade type labels mapping
export const getGradeTypeLabel = (gradeType: GradeType): string => {
  const labels: Record<GradeType, string> = {
    'TUGAS_HARIAN': 'Tugas Harian',
    'QUIZ': 'Quiz',
    'ULANGAN_HARIAN': 'Ulangan Harian',
    'PTS': 'Penilaian Tengah Semester',
    'PAS': 'Penilaian Akhir Semester',
    'PRAKTIK': 'Praktik',
    'SIKAP': 'Sikap',
    'KETERAMPILAN': 'Keterampilan'
  };
  return labels[gradeType] || gradeType;
};

// Grade type color mapping for HeroUI components
export const getGradeTypeColor = (gradeType: GradeType): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
  switch (gradeType) {
    case 'TUGAS_HARIAN': return 'primary';
    case 'QUIZ': return 'secondary';
    case 'ULANGAN_HARIAN': return 'warning';
    case 'PTS': return 'success';
    case 'PAS': return 'danger';
    case 'PRAKTIK': return 'default';
    case 'SIKAP': return 'primary';
    case 'KETERAMPILAN': return 'secondary';
    default: return 'default';
  }
};

// Get score color based on performance
export const getScoreColor = (score: number, maxScore: number): "success" | "warning" | "danger" => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 75) return 'success';
  if (percentage >= 60) return 'warning';
  return 'danger';
};

// Calculate percentage score
export const calculatePercentage = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

// Get grade letter based on score percentage
export const getGradeLetter = (score: number, maxScore: number): string => {
  const percentage = calculatePercentage(score, maxScore);
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'E';
};

// Calculate grade statistics
export const calculateGradeStats = (students: GradeStudent[], grades: GradeRecord[]): GradeStats => {
  const totalStudents = students.length;
  const totalGrades = grades.length;
  
  if (totalGrades === 0) {
    return {
      totalStudents,
      totalGrades: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passedStudents: 0,
      failedStudents: 0,
      passRate: 0
    };
  }

  const scores = grades.map(grade => calculatePercentage(grade.score, grade.maxScore));
  const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const passedStudents = scores.filter(score => score >= 75).length;
  const failedStudents = scores.filter(score => score < 75).length;
  const passRate = totalGrades > 0 ? Math.round((passedStudents / totalGrades) * 100) : 0;

  return {
    totalStudents,
    totalGrades,
    averageScore,
    highestScore,
    lowestScore,
    passedStudents,
    failedStudents,
    passRate
  };
};

// Get grade record for a specific student
export const getStudentGrade = (studentId: string, grades: GradeRecord[]): GradeRecord | undefined => {
  return grades.find(grade => grade.studentId === studentId);
};

// Format date for display
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Pagination utility
export const getPaginatedItems = <T>(items: T[], page: number, itemsPerPage: number): T[] => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

// Calculate total pages
export const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

// Validate score input
export const validateScore = (score: string, maxScore: string): { isValid: boolean; error?: string } => {
  const scoreNum = parseFloat(score);
  const maxScoreNum = parseFloat(maxScore);
  
  if (isNaN(scoreNum) || isNaN(maxScoreNum)) {
    return { isValid: false, error: 'Nilai harus berupa angka' };
  }
  
  if (scoreNum < 0) {
    return { isValid: false, error: 'Nilai tidak boleh negatif' };
  }
  
  if (scoreNum > maxScoreNum) {
    return { isValid: false, error: 'Nilai tidak boleh melebihi nilai maksimal' };
  }
  
  return { isValid: true };
};

// Export options for grades
export const exportGradesToCSV = (grades: GradeRecord[], filename: string = 'grades.csv') => {
  const headers = [
    'Nama Siswa',
    'NISN', 
    'Jenis Penilaian',
    'Nilai',
    'Nilai Maksimal',
    'Persentase',
    'Huruf',
    'Deskripsi',
    'Tanggal'
  ];
  
  const csvContent = [
    headers.join(','),
    ...grades.map(grade => [
      grade.student?.fullName || '',
      grade.student?.studentId || '',
      getGradeTypeLabel(grade.gradeType),
      grade.score,
      grade.maxScore,
      calculatePercentage(grade.score, grade.maxScore) + '%',
      getGradeLetter(grade.score, grade.maxScore),
      grade.description || '',
      formatDateForDisplay(grade.date)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

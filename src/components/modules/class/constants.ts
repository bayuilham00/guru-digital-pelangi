// Constants for ClassManager
export const GRADE_OPTIONS = [
  { key: '7', label: 'Kelas 7' },
  { key: '8', label: 'Kelas 8' },
  { key: '9', label: 'Kelas 9' },
  { key: '10', label: 'Kelas 10' },
  { key: '11', label: 'Kelas 11' },
  { key: '12', label: 'Kelas 12' }
];

export const GRADIENT_COLORS = [
  'from-cyan-400 to-blue-500',
  'from-purple-400 to-pink-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-indigo-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-teal-400 to-cyan-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-green-500',
  'from-violet-400 to-purple-500'
];

export const getGradientColor = (index: number) => {
  return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
};

export interface ClassFormData {
  name: string;
  subjectId: string;
  teacherIds: string[];
  description: string;
  gradeLevel: string;
}

export const DEFAULT_FORM_DATA: ClassFormData = {
  name: '',
  subjectId: '',
  teacherIds: [],
  description: '',
  gradeLevel: ''
};

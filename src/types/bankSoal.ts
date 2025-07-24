// Bank Soal Module Types
// All interfaces and types for Bank Soal functionality

// ================================================
// QUESTION TYPES
// ================================================

export interface Question {
  id: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_COMPLEX' | 'TRUE_FALSE' | 'FILL_BLANK' | 'FILL_IN_BLANK' | 'ESSAY' | 'MATCHING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subjectId: string;
  topicId?: string;
  categoryId?: string;
  gradeLevel: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  tags?: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    fullName: string;
  };
  options?: QuestionOption[];
  _count?: {
    questionBanks: number;
    assignmentQuestions: number;
    studentAnswers: number;
  };
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// QUESTION BANK TYPES
// ================================================

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  gradeLevel: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  creator?: {
    id: string;
    fullName: string;
  };
  questions?: QuestionBankItem[];
  _count?: {
    questions: number;
  };
}

export interface QuestionBankItem {
  id: string;
  questionBankId: string;
  questionId: string;
  orderIndex: number;
  createdAt: string;
  // Relations
  question?: Question;
}

// ================================================
// TOPIC TYPES
// ================================================

export interface Topic {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    questions: number;
  };
}

// ================================================
// SUBJECT, TOPIC, CATEGORY TYPES
// ================================================

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// FILTER TYPES
// ================================================

export interface QuestionFilters {
  search?: string;
  subjectId?: string;
  topicId?: string;
  categoryId?: string;
  difficulty?: string;
  gradeLevel?: string;
  questionType?: string;
  isPublic?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface QuestionBankFilters {
  search?: string;
  subjectId?: string;
  gradeLevel?: string;
  isPublic?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
}

// ================================================
// CREATE/UPDATE TYPES
// ================================================

export interface CreateQuestionRequest {
  questionText: string;
  questionType: Question['questionType'];
  difficulty: Question['difficulty'];
  subjectId: string;
  topicId?: string;
  gradeLevel: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  tags?: string[];
  isPublic: boolean;
  options?: { text: string; isCorrect: boolean }[];
}

export type UpdateQuestionRequest = Partial<CreateQuestionRequest>;


export interface CreateQuestionData {
  questionText: string;
  questionType: Question['questionType'];
  difficulty?: Question['difficulty'];
  subjectId: string;
  topicId?: string;
  categoryId?: string;
  gradeLevel: string;
  correctAnswer: string;
  explanation?: string;
  points?: number;
  timeLimit?: number;
  tags?: string[];
  isPublic?: boolean;
  options?: CreateQuestionOptionData[];
}

export interface CreateQuestionOptionData {
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface UpdateQuestionData {
  questionText?: string;
  questionType?: Question['questionType'];
  difficulty?: Question['difficulty'];
  subjectId?: string;
  topicId?: string;
  categoryId?: string;
  gradeLevel?: string;
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  timeLimit?: number;
  tags?: string[];
  isPublic?: boolean;
  options?: UpdateQuestionOptionData[];
}

export interface UpdateQuestionOptionData {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface CreateQuestionBankData {
  name: string;
  description?: string;
  subjectId: string;
  gradeLevel: string;
  isPublic?: boolean;
  questionIds?: string[];
}

export interface UpdateQuestionBankData {
  name?: string;
  description?: string;
  subjectId?: string;
  gradeLevel?: string;
  isPublic?: boolean;
}

export interface CreateTopicData {
  name: string;
  description?: string;
  subjectId: string;
  gradeLevel: string;
}

export interface UpdateTopicData {
  name?: string;
  description?: string;
  subjectId?: string;
  gradeLevel?: string;
}

// ================================================
// UTILITY TYPES
// ================================================

export type QuestionType = Question['questionType'];
export type DifficultyLevel = Question['difficulty'];

export interface QuestionStats {
  totalQuestions: number;
  byDifficulty: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  byType: {
    MULTIPLE_CHOICE: number;
    MULTIPLE_CHOICE_COMPLEX: number;
    TRUE_FALSE: number;
    FILL_BLANK: number;
    FILL_IN_BLANK: number;
    ESSAY: number;
    MATCHING: number;
  };
  bySubject: Array<{
    subjectId: string;
    subjectName: string;
    count: number;
  }>;
}

export interface QuestionBankStats {
  totalBanks: number;
  totalQuestions: number;
  averageQuestionsPerBank: number;
  bySubject: Array<{
    subjectId: string;
    subjectName: string;
    count: number;
  }>;
}

// ================================================
// PAGINATION & UTILITY TYPES
// ================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ================================================
// RESPONSE WRAPPERS
// ================================================

export interface QuestionWithMeta extends Question {
  meta?: {
    usageCount: number;
    averageScore: number;
    lastUsed?: string;
  };
}

export interface QuestionBankWithStats extends QuestionBank {
  stats?: {
    totalQuestions: number;
    averageDifficulty: number;
    questionTypes: string[];
  };
}

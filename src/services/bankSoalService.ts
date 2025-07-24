// Bank Soal Service
// Handles API calls for Bank Soal module
import { ApiResponse, PaginatedResponse } from './types';
import {
  Question,
  QuestionBank,
  Topic,
  Subject,
  QuestionFilters,
  QuestionBankFilters,
  CreateQuestionData,
  UpdateQuestionData,
  CreateQuestionBankData,
  UpdateQuestionBankData
} from '../types/bankSoal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = `${API_BASE_URL}/bank-soal`;

// ================================================
// HELPER FUNCTIONS
// ================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleApiError = (error: unknown): never => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('An unknown error occurred');
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid tokens and let ProtectedRoute handle redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  // Ensure we return a consistent format
  if (result.success !== undefined) {
    return result; // Already in API response format
  }
  
  // Wrap raw data in API response format
  return {
    success: true,
    data: result,
    message: 'Success'
  };
};

// ================================================
// QUESTIONS API
// ================================================

export const questionsApi = {
  /**
   * Get all questions with filtering and pagination
   */
  async getQuestions(filters: QuestionFilters = {}): Promise<PaginatedResponse<Question>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE}/questions?${params}`, {
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get single question by ID
   */
  async getQuestionById(id: string): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Create new question
   */
  async createQuestion(data: CreateQuestionData): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update question
   */
  async updateQuestion(id: string, data: UpdateQuestionData): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  }
};

// ================================================
// QUESTION BANKS API
// ================================================

export const questionBanksApi = {
  /**
   * Get all question banks with filtering and pagination
   */
  async getQuestionBanks(filters: QuestionBankFilters = {}): Promise<PaginatedResponse<QuestionBank>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE}/banks?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get single question bank by ID with questions
   */
  async getQuestionBankById(id: string): Promise<ApiResponse<QuestionBank>> {
    try {
      const response = await fetch(`${API_BASE}/banks/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Create new question bank
   */
  async createQuestionBank(data: CreateQuestionBankData): Promise<ApiResponse<QuestionBank>> {
    try {
      const response = await fetch(`${API_BASE}/banks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update question bank
   */
  async updateQuestionBank(id: string, data: UpdateQuestionBankData): Promise<ApiResponse<QuestionBank>> {
    try {
      const response = await fetch(`${API_BASE}/banks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Delete question bank
   */
  async deleteQuestionBank(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE}/banks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  }
};

// ================================================
// TOPICS API
// ================================================

export const topicsApi = {
  /**
   * Get all topics with optional filtering
   */
  async getTopics(filters: { subjectId?: string; gradeLevel?: string } = {}): Promise<ApiResponse<Topic[]>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE}/topics?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
    }
  }
};

// ================================================
// SUBJECTS API
// ================================================

export const subjectsApi = {
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    try {
      const response = await fetch(`${API_BASE}/subjects`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// ================================================
// EXPORT DEFAULT SERVICE
// ================================================

const bankSoalService = {
  // Questions API - flatten the structure
  getQuestions: questionsApi.getQuestions,
  getQuestion: questionsApi.getQuestionById, // Map to the actual method name
  createQuestion: questionsApi.createQuestion,
  updateQuestion: questionsApi.updateQuestion,
  deleteQuestion: questionsApi.deleteQuestion,
  
  // Question Banks API - flatten the structure
  getQuestionBanks: questionBanksApi.getQuestionBanks,
  getQuestionBank: questionBanksApi.getQuestionBankById, // Map to the actual method name
  createQuestionBank: questionBanksApi.createQuestionBank,
  updateQuestionBank: questionBanksApi.updateQuestionBank, // Now implemented
  deleteQuestionBank: questionBanksApi.deleteQuestionBank, // Now implemented
  
  // Topics API - flatten the structure
  getTopics: topicsApi.getTopics,

  // Subjects API - flatten the structure
  getSubjects: subjectsApi.getSubjects,
  
  // Original nested structure for backward compatibility
  questions: questionsApi,
  questionBanks: questionBanksApi,
  topics: topicsApi,
  subjects: subjectsApi
};

export default bankSoalService;
export { bankSoalService };

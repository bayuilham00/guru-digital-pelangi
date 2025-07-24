// Template Service for Teacher Planner
import { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export interface Template {
  id: string;
  name: string;
  description?: string;
  subjectId?: string;
  templateStructure: Record<string, unknown>;
  learningObjectives: string[];
  estimatedDuration?: number;
  difficultyLevel?: string;
  gradeLevel?: string;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  createdByUser?: {
    id: string;
    fullName: string;
  };
  // Frontend display properties (derived from backend data)
  title?: string;
  duration?: number;
  creator?: {
    id: string;
    name: string;
  };
}

export interface TemplateFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  isPublic?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const templateService = {
  async getTemplates(filters: TemplateFilters = {}): Promise<ApiResponse<Template[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${API_BASE_URL}/templates?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination,
        message: 'Success'
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch templates'
      };
    }
  },

  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: 'Success'
      };
    } catch (error) {
      console.error('Error fetching template:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch template'
      };
    }
  },

  async createTemplate(templateData: Partial<Template>): Promise<ApiResponse<Template>> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: 'Template created successfully'
      };
    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create template'
      };
    }
  },

  async updateTemplate(id: string, templateData: Partial<Template>): Promise<ApiResponse<Template>> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: 'Template updated successfully'
      };
    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update template'
      };
    }
  },

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return {
        success: true,
        data: undefined,
        message: 'Template deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting template:', error);
      return {
        success: false,
        data: undefined,
        message: error instanceof Error ? error.message : 'Failed to delete template'
      };
    }
  },

  async duplicateTemplate(id: string): Promise<ApiResponse<Template>> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: 'Template duplicated successfully'
      };
    } catch (error) {
      console.error('Error duplicating template:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to duplicate template'
      };
    }
  },

  async bulkDeleteTemplates(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/bulk-delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: 'Templates deleted successfully'
      };
    } catch (error) {
      console.error('Error bulk deleting templates:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to delete templates'
      };
    }
  }
};

export default templateService;

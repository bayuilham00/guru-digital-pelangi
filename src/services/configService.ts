import { apiClient } from './apiClient';

export interface ConfigItem {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  updatedAt: string;
}

export interface ConfigResponse {
  success: boolean;
  message: string;
  data: {
    configs: Record<string, ConfigItem[]>;
    total: number;
  };
}

export interface SystemStatus {
  initialized: boolean;
  school_name?: string;
  default_academic_year?: string;
  default_school_id?: string;
  school_address?: string;
  school_phone?: string;
  school_email?: string;
  principal_name?: string;
  principal_nip?: string;
}

export interface InitializeSystemRequest {
  schoolName: string;
  schoolId?: string;
  academicYear: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  principalName?: string;
  principalNip?: string;
}

const configService = {
  // Check if system is initialized
  async checkSystemStatus(): Promise<SystemStatus> {
    const response = await apiClient.get('/config/status');
    return response.data.data;
  },

  // Initialize system with basic configuration
  async initializeSystem(data: InitializeSystemRequest) {
    const response = await apiClient.post('/config/initialize', data);
    return response.data;
  },

  // Get all configurations
  async getAllConfigs(): Promise<ConfigResponse> {
    const response = await apiClient.get('/config');
    return response.data;
  },

  // Get specific configuration by key
  async getConfigByKey(key: string): Promise<ConfigItem> {
    const response = await apiClient.get(`/config/${key}`);
    return response.data.data;
  },

  // Update single configuration
  async updateConfig(key: string, value: string, description?: string) {
    const response = await apiClient.put(`/config/${key}`, {
      value,
      description
    });
    return response.data;
  },

  // Update multiple configurations
  async updateMultipleConfigs(configs: Array<{
    key: string;
    value: string;
    description?: string;
    category?: string;
  }>) {
    const response = await apiClient.put('/config', { configs });
    return response.data;
  }
};

export default configService;

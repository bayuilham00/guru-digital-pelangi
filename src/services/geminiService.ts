import { apiClient } from './apiClient';

interface GenerateTemplateParams {
  subject: string;
  topic: string;
  duration: number;
}

interface GenerateTemplateResponse {
  content: string;
}

const generateTemplate = async (params: GenerateTemplateParams): Promise<GenerateTemplateResponse> => {
  try {
    const response = await apiClient.post('/gemini/generate-template', params);
    return response.data;
  } catch (error) {
    console.error('Error generating template with AI:', error);
    throw new Error('Gagal menghasilkan template dengan AI.');
  }
};

export const geminiService = {
  generateTemplate,
};
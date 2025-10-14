import axios, { AxiosResponse } from 'axios';
import type { 
  CoverLetterRequest, 
  RegenerateCoverLetterRequest 
} from '../../core/types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Re-export types for convenience
export type { 
  CoverLetterRequest, 
  RegenerateCoverLetterRequest 
} from '../../core/types/index.js';

export const coverLetterService = {
  /**
   * Get Cover Letter Page
   * GET /cover-letter
   */
  async getCoverLetterPage(): Promise<string> {
    const response: AxiosResponse<string> = await api.get('/cover-letter');
    return response.data;
  },

  /**
   * Generate Cover Letter
   * POST /cover-letter
   */
  async generateCoverLetter(coverLetterData: CoverLetterRequest): Promise<string> {
    const formData = new FormData();
    formData.append('resume_id', coverLetterData.resume_id.toString());
    formData.append('jd_id', coverLetterData.jd_id.toString());
    formData.append('your_name', coverLetterData.your_name);
    formData.append('your_email', coverLetterData.your_email);
    if (coverLetterData.your_phone) {
      formData.append('your_phone', coverLetterData.your_phone);
    }
    
    const response: AxiosResponse<string> = await api.post('/cover-letter', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Regenerate Cover Letter
   * POST /cover-letter/regenerate
   */
  async regenerateCoverLetter(regenerateData: RegenerateCoverLetterRequest): Promise<string> {
    const formData = new FormData();
    formData.append('resume_id', regenerateData.resume_id.toString());
    formData.append('jd_id', regenerateData.jd_id.toString());
    formData.append('your_name', regenerateData.your_name);
    formData.append('your_email', regenerateData.your_email);
    if (regenerateData.your_phone) {
      formData.append('your_phone', regenerateData.your_phone);
    }
    formData.append('include_achievements', (regenerateData.include_achievements || false).toString());
    formData.append('emphasize_skills', (regenerateData.emphasize_skills || false).toString());
    formData.append('add_passion', (regenerateData.add_passion || false).toString());
    formData.append('professional_tone', (regenerateData.professional_tone || false).toString());
    
    const response: AxiosResponse<string> = await api.post('/cover-letter/regenerate', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Download Cover Letter
   * GET /cover-letter/download/{format}
   */
  async downloadCoverLetter(format: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await api.get(`/cover-letter/download/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

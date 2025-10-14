import axios, { AxiosResponse } from 'axios';
import type { 
  JobDescription, 
  JobDescriptionListResponse, 
  JobDescriptionResponse, 
  CreateJobDescriptionRequest, 
  BaseResponse 
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
  JobDescription, 
  JobDescriptionListResponse, 
  JobDescriptionResponse, 
  CreateJobDescriptionRequest, 
  BaseResponse 
} from '../../core/types/index.js';

export const jobService = {
  /**
   * Get Job Descriptions
   * GET /job-descriptions
   */
  async getJobDescriptions(): Promise<JobDescriptionListResponse> {
    const response: AxiosResponse<JobDescriptionListResponse> = await api.get('/job-descriptions');
    return response.data;
  },

  /**
   * Create Job Description (API version)
   * POST /job-descriptions
   */
  async createJobDescription(jobData: CreateJobDescriptionRequest): Promise<JobDescriptionResponse> {
    const formData = new FormData();
    formData.append('title', jobData.title);
    formData.append('company', jobData.company);
    formData.append('content', jobData.content);
    
    const response: AxiosResponse<JobDescriptionResponse> = await api.post('/job-descriptions', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Delete Job Description
   * DELETE /job-descriptions/{jd_id}
   */
  async deleteJobDescription(jdId: number): Promise<BaseResponse> {
    const response: AxiosResponse<BaseResponse> = await api.delete(`/job-descriptions/${jdId}`);
    return response.data;
  },

  /**
   * Get Job Description Page
   * GET /jd
   */
  async getJdPage(success: string | null = null, error: string | null = null): Promise<string> {
    const params = new URLSearchParams();
    if (success) params.append('success', success);
    if (error) params.append('error', error);
    
    const response: AxiosResponse<string> = await api.get(`/jd?${params.toString()}`);
    return response.data;
  },

  /**
   * Create Job Description (Form version)
   * POST /jd
   */
  async createJdForm(jobData: CreateJobDescriptionRequest): Promise<string> {
    const formData = new FormData();
    formData.append('jd_title', jobData.title);
    formData.append('jd_company', jobData.company);
    formData.append('jd_content', jobData.content);
    
    const response: AxiosResponse<string> = await api.post('/jd', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Delete Job Description (Form version)
   * DELETE /jd/{jd_id}
   */
  async deleteJdForm(jdId: number): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await api.delete(`/jd/${jdId}`);
    return response.data;
  },

  /**
   * Debug Job Description
   * GET /debug/jd/{jd_id}
   */
  async debugJd(jdId: number): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await api.get(`/debug/jd/${jdId}`);
    return response.data;
  },

  /**
   * Debug All Job Descriptions
   * GET /debug/jds
   */
  async debugAllJds(): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await api.get('/debug/jds');
    return response.data;
  }
};

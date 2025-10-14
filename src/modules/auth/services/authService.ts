import axios, { AxiosResponse } from 'axios';
import type { 
  AuthResponse 
} from '@types';

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

// Handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors for actual authentication failures, not network issues
    if (error.response?.status === 401 && error.response?.data?.message?.includes('token')) {
      // Only clear token if it's actually an authentication error
      localStorage.removeItem('token');
      localStorage.removeItem('google_auth_token');
      localStorage.removeItem('linkedin_auth_token');
      window.location.href = '/login';
    }
    // For network errors or backend unavailability, don't clear tokens
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);


export const authService = {
  /**
   * User Login
   * POST /api/auth/login
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * User Registration
   * POST /api/auth/register
   */
  async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', { 
      email, 
      password, 
      first_name: firstName, 
      last_name: lastName 
    });
    return response.data;
  },

  /**
   * Get Current User
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Forgot Password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset Password
   * POST /api/auth/reset-password
   */
  async resetPassword(token: string, new_password: string, confirm_password: string): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await api.post('/auth/reset-password', { 
      token, 
      new_password, 
      confirm_password 
    });
    return response.data;
  },

  /**
   * Health Check
   * GET /health
   */
  async healthCheck(): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await api.get('/health');
    return response.data;
  }
};

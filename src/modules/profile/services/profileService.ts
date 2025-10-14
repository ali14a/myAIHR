import axios, { AxiosResponse } from 'axios';
import type { 
  User, 
  ProfileUpdateRequest, 
  SocialLinksRequest, 
  ChangePasswordRequest, 
  AuthResponse, 
  BaseResponse 
} from '../../core/types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate axios instance for profile endpoints that don't use /api prefix
const profileApi = axios.create({
  baseURL: '', // No base URL prefix for profile endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests for both instances
const addTokenInterceptor = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addTokenInterceptor);
profileApi.interceptors.request.use(addTokenInterceptor);

// Re-export types for convenience
export type { 
  User, 
  ProfileUpdateRequest, 
  SocialLinksRequest, 
  ChangePasswordRequest, 
  AuthResponse, 
  BaseResponse 
} from '../../core/types/index.js';

export const profileService = {
  /**
   * Get User Profile
   * GET /api/profile
   */
  async getProfile(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.get('/profile');
    return response.data;
  },

  /**
   * Update User Profile (API version)
   * PUT /api/profile
   */
  async updateProfile(profileData: ProfileUpdateRequest): Promise<BaseResponse> {
    const response: AxiosResponse<BaseResponse> = await api.put('/profile', profileData);
    return response.data;
  },

  /**
   * Update User Profile (Compatibility version)
   * PUT /profile
   */
  async updateProfileCompat(profileData: ProfileUpdateRequest): Promise<BaseResponse> {
    const response: AxiosResponse<BaseResponse> = await profileApi.put('/profile', profileData);
    return response.data;
  },

  /**
   * Update Profile (Form version)
   * POST /profile/update
   */
  async updateProfileForm(profileData: ProfileUpdateRequest): Promise<Record<string, any>> {
    const formData = new FormData();
    if (profileData.first_name) formData.append('first_name', profileData.first_name);
    if (profileData.last_name) formData.append('last_name', profileData.last_name);
    if (profileData.mobile_number) formData.append('mobile_number', profileData.mobile_number);
    if (profileData.company) formData.append('company', profileData.company);
    if (profileData.job_title) formData.append('job_title', profileData.job_title);
    if (profileData.location) formData.append('location', profileData.location);
    if (profileData.bio) formData.append('bio', profileData.bio);
    
    const response: AxiosResponse<Record<string, any>> = await profileApi.post('/profile/update', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Update Social Links
   * POST /profile/social
   */
  async updateSocialLinks(socialData: SocialLinksRequest): Promise<Record<string, any>> {
    const formData = new FormData();
    if (socialData.linkedin_url) formData.append('linkedin_url', socialData.linkedin_url);
    if (socialData.github_url) formData.append('github_url', socialData.github_url);
    if (socialData.website_url) formData.append('website_url', socialData.website_url);
    
    const response: AxiosResponse<Record<string, any>> = await profileApi.post('/profile/social', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Change Password
   * POST /profile/password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append('current_password', passwordData.current_password);
    formData.append('new_password', passwordData.new_password);
    formData.append('confirm_password', passwordData.confirm_password);
    
    const response: AxiosResponse<Record<string, any>> = await profileApi.post('/profile/password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Upload Profile Photo
   * POST /profile/photo
   */
  async uploadProfilePhoto(photo: File): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response: AxiosResponse<Record<string, any>> = await profileApi.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete Profile Photo
   * DELETE /profile/photo
   */
  async deleteProfilePhoto(): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await profileApi.delete('/profile/photo');
    return response.data;
  },

  /**
   * Get Profile Photo
   * GET /profile-photo/{user_id}
   */
  async getProfilePhoto(userId: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await api.get(`/profile-photo/${userId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Forgot Password (Form version)
   * POST /forgot-password
   */
  async forgotPasswordForm(email: string): Promise<string> {
    const formData = new FormData();
    formData.append('email', email);
    
    const response: AxiosResponse<string> = await api.post('/forgot-password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Reset Password (Form version)
   * POST /reset-password
   */
  async resetPasswordForm(token: string, newPassword: string, confirmPassword: string): Promise<string> {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('new_password', newPassword);
    formData.append('confirm_password', confirmPassword);
    
    const response: AxiosResponse<string> = await api.post('/reset-password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }
};

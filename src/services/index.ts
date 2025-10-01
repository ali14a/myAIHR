// Import services
import { authService } from './authService.js';
import { resumeService } from './resumeService.js';
import { profileService } from './profileService.js';
import { jobService } from './jobService.js';
import { coverLetterService } from './coverLetterService.js';

// Export all API services and types
export { authService } from './authService.js';
export { resumeService } from './resumeService.js';
export { profileService } from './profileService.js';
export { jobService } from './jobService.js';
export { coverLetterService } from './coverLetterService.js';

// Re-export all types from the main types file
export type * from '../types/index.js';

// Re-export all services as a single object for convenience
export const apiServices = {
  auth: authService,
  resume: resumeService,
  profile: profileService,
  job: jobService,
  coverLetter: coverLetterService
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // Profile
    PROFILE: '/api/profile',
    PROFILE_UPDATE: '/profile/update',
    PROFILE_SOCIAL: '/profile/social',
    PROFILE_PASSWORD: '/profile/password',
    PROFILE_PHOTO: '/profile/photo',
    
    // Resume
    USER_RESUMES: '/resume/user-resumes',
    UPLOAD: '/api/upload',
    COMPARE: '/compare',
    IMPROVE: '/improve',
    
    // Job Descriptions
    JOB_DESCRIPTIONS: '/job-descriptions',
    JD_PAGE: '/jd',
    
    // Cover Letter
    COVER_LETTER: '/cover-letter',
    COVER_LETTER_REGENERATE: '/cover-letter/regenerate',
    COVER_LETTER_DOWNLOAD: '/cover-letter/download',
    
    // Health
    HEALTH: '/health'
  },
  
  // HTTP Methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },
  
  // Content Types
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_URLENCODED: 'application/x-www-form-urlencoded',
    MULTIPART_FORM: 'multipart/form-data'
  }
};

// Main API Types
export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  mobile_number: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  profile_photo: string | null;
  updated_at: string | null;
}

export interface ResumeScan {
  id: number;
  filename: string;
  original_filename: string;
  ats_score: number;
  feedback: string;
  analysis: Record<string, any>;
  file_size: number;
  timestamp: string | null;
  uploaded_at: string;
  analysis_status: string;
}

export interface ResumeAnalysis {
  overall_score: number;
  category_scores: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  found_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
}

export interface CategoryScore {
  name: string;
  category: string;
  score: number;
  max_score: number;
}

export interface ResumeImprovements {
  summary: {
    high_priority: number;
    medium_priority: number;
    low_priority: number;
  };
  suggestions: ImprovementSuggestion[];
}

export interface ImprovementSuggestion {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  examples: string[];
  keywords: string[];
}

export interface JobMatchResult {
  overall_score: number;
  skills_match: {
    percentage: number;
    matched_skills: string[];
    missing_skills: string[];
  };
  experience_match: {
    percentage: number;
    gaps: string[];
  };
  recommendations: string[];
}

export interface CoverLetter {
  content: string;
  analysis?: {
    strengths: string[];
    improvements: string[];
  };
}

export interface JobDescription {
  id: number;
  title: string;
  company: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  message: string | null;
  token: string | null;
  user: User | null;
}

export interface BaseResponse {
  success: boolean;
  message: string | null;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error_code?: string | null;
  details?: Record<string, any> | null;
}

export interface ResumeListResponse {
  success: boolean;
  message: string | null;
  resumes: ResumeScan[];
}

export interface ResumeResponse {
  success: boolean;
  message: string | null;
  resume: ResumeScan | null;
}

export interface JobDescriptionListResponse {
  success: boolean;
  message: string | null;
  job_descriptions: JobDescription[];
}

export interface JobDescriptionResponse {
  success: boolean;
  message: string | null;
  job_description: JobDescription | null;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  mobile_number?: string | null;
  company?: string | null;
  job_title?: string | null;
  location?: string | null;
  bio?: string | null;
}

export interface SocialLinksRequest {
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface CreateJobDescriptionRequest {
  title: string;
  company: string;
  content: string;
}

export interface CompareRequest {
  resume_id: number;
  jd_id?: number | null;
  jd_title?: string | null;
  jd_company?: string | null;
  jd_content?: string | null;
}

export interface ImproveRequest {
  resume_id: number;
  improvement_type: string;
}

export interface CoverLetterRequest {
  resume_id: number;
  jd_id: number;
  your_name: string;
  your_email: string;
  your_phone?: string | null;
}

export interface RegenerateCoverLetterRequest {
  resume_id: number;
  jd_id: number;
  your_name: string;
  your_email: string;
  your_phone?: string | null;
  include_achievements?: boolean;
  emphasize_skills?: boolean;
  add_passion?: boolean;
  professional_tone?: boolean;
}

export interface UpdateResumeNameRequest {
  new_name: string;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  linkedinLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; message?: string; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => number;
  removeNotification: (id: number) => void;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  warning: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  clear: () => void;
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface NotificationProps {
  // Add any specific props if needed
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  mobile_number: string;
  company: string;
  job_title: string;
  location: string;
  bio: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
}

// API Service Types
export interface ApiService {
  // This will be extended by specific services
}

// Environment Variables
export interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

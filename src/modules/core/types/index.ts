// Core types
export interface User {
  id: string | number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  mobile_number?: string | null;
  company?: string | null;
  location?: string | null;
  bio?: string | null;
  profile_photo?: string | null;
  job_title?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
  updated_at?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<{ success: boolean; message?: string; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  googleLogin: () => Promise<{ success: boolean; message?: string; error?: string }>;
  linkedinLogin: () => Promise<{ success: boolean; message?: string; error?: string }>;
}

// Resume types
export interface ResumeScan {
  id: string;
  filename: string;
  upload_date: string;
  analysis?: ResumeAnalysisData;
  improvements?: ResumeImprovements;
}

export interface ResumeAnalysisData {
  id: string;
  resume_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skills: string[];
  experience_level: string;
  education: string[];
  certifications: string[];
  languages: string[];
  analysis_date: string;
}

export interface ResumeImprovements {
  id: string;
  resume_id: string;
  improved_content: string;
  improvements_made: string[];
  improvement_date: string;
}

export interface ResumeListResponse {
  resumes: ResumeScan[];
  total: number;
}

// Job types
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_range?: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  posted_date: string;
}

export interface JobMatchResult {
  id: string;
  resume_id: string;
  job_id: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  match_date: string;
}

// Cover Letter types
export interface CoverLetterData {
  id: string;
  resume_id: string;
  job_description: string;
  content: string;
  generated_date: string;
}

// Notification types
export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => number;
  removeNotification: (id: number) => void;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  warning: (message: string, duration?: number) => number;
  clear: () => void;
}

// API Response types
export interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
}

// Profile types
export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  location?: string;
  bio?: string;
  company?: string;
  job_title?: string;
}

export interface SocialLinksRequest {
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  website_url?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Resume types (extended)
export interface ResumeScanExtended extends ResumeScan {
  original_filename?: string;
  uploaded_at?: string;
  timestamp?: string;
  analysis_status?: string;
  ats_score?: number;
  file_size?: number;
}

export interface ResumeAnalysisExtended extends ResumeAnalysisData {
  category_scores?: { [key: string]: number };
  found_keywords?: string[];
  missing_keywords?: string[];
  recommendations?: string[];
}

export interface ResumeImprovementsExtended extends ResumeImprovements {
  summary?: string;
  suggestions?: string[];
}

// Job types (extended)
export interface JobDescriptionListResponse {
  job_descriptions: JobDescription[];
  total: number;
}

export interface JobDescriptionResponse {
  job_description: JobDescription;
}

export interface CreateJobDescriptionRequest {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_range?: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  content?: string;
}

export interface JobMatchResultExtended extends JobMatchResult {
  overall_score?: number;
  skills_match?: string[];
  experience_match?: string[];
}

// Cover Letter types (extended)
export interface CoverLetterRequest {
  resume_id: string;
  job_description: string;
  tone?: string;
  length?: string;
  jd_id?: string;
  your_name?: string;
  your_email?: string;
  your_phone?: string;
}

export interface RegenerateCoverLetterRequest {
  cover_letter_id: string;
  changes?: string;
  resume_id?: string;
  jd_id?: string;
  your_name?: string;
  your_email?: string;
  your_phone?: string;
  include_achievements?: boolean;
  emphasize_skills?: boolean;
  add_passion?: boolean;
  professional_tone?: boolean;
}

export interface CoverLetterExtended extends CoverLetterData {
  analysis?: {
    strengths: string[];
    improvements: string[];
  };
}

// Notification types (extended)
export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface NotificationContextTypeExtended extends NotificationContextType {
  notifications: Notification[];
  removeNotification: (id: number) => void;
}
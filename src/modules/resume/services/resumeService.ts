import axios, { AxiosResponse } from "axios";
import type { CompareRequest, ResumeListResponse } from "@types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a separate axios instance for resume endpoints that don't use /api prefix
const resumeApi = axios.create({
  baseURL: "http://localhost:8000", // Direct connection to backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests for both instances
const addTokenInterceptor = (config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addTokenInterceptor);
resumeApi.interceptors.request.use(addTokenInterceptor);

// Re-export types for convenience
export type {
  CompareRequest,
  ImproveRequest,
  ResumeListResponse,
  ResumeScan,
  UpdateResumeNameRequest,
} from "@types";

export const resumeService = {
  /**
   * Upload Resume
   * POST /api/upload
   */
  async uploadResume(file: File): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("file", file);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/api/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Get User Resumes
   * GET /resume/user-resumes
   */
  async getUserResumes(): Promise<ResumeListResponse> {
    const response: AxiosResponse<ResumeListResponse> = await resumeApi.get(
      "/resume/user-resumes"
    );
    return response.data;
  },

  /**
   * Download Resume
   * GET /resume/{resume_id}
   */
  async downloadResume(resumeId: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await resumeApi.get(
      `/resume/${resumeId}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  /**
   * Delete Resume
   * DELETE /resume/{resume_id}
   */
  async deleteResume(resumeId: number): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await resumeApi.delete(
      `/resume/${resumeId}`
    );
    return response.data;
  },

  /**
   * Update Resume Name
   * PUT /resume/{resume_id}/name
   */
  async updateResumeName(
    resumeId: number,
    newName: string
  ): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("new_name", newName);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.put(
      `/resume/${resumeId}/name`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  /**
   * Compare Resume with Job Description
   * POST /compare
   */
  async compareResume(
    compareData: CompareRequest
  ): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("resume_id", compareData.resume_id.toString());
    if (compareData.jd_id)
      formData.append("jd_id", compareData.jd_id.toString());
    if (compareData.jd_title) formData.append("jd_title", compareData.jd_title);
    if (compareData.jd_company)
      formData.append("jd_company", compareData.jd_company);
    if (compareData.jd_content)
      formData.append("jd_content", compareData.jd_content);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/compare",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  /**
   * Get Job Description Compare Page
   * GET /jd/{jd_id}/compare
   */
  async getJdCompare(jdId: number): Promise<string> {
    const response: AxiosResponse<string> = await resumeApi.get(
      `/jd/${jdId}/compare`
    );
    return response.data;
  },

  /**
   * Debug Compare (for testing)
   * POST /debug/compare
   */
  async debugCompare(
    compareData: CompareRequest
  ): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("resume_id", compareData.resume_id.toString());
    if (compareData.jd_id)
      formData.append("jd_id", compareData.jd_id.toString());
    if (compareData.jd_title) formData.append("jd_title", compareData.jd_title);
    if (compareData.jd_company)
      formData.append("jd_company", compareData.jd_company);
    if (compareData.jd_content)
      formData.append("jd_content", compareData.jd_content);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/debug/compare",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  /**
   * Get Resume Improvement Suggestions
   * POST /improve
   */
  async improveResume(
    resumeId: number,
    improvementType: string
  ): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("resume_id", resumeId.toString());
    formData.append("improvement_type", improvementType);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/improve",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  /**
   * Analyze Resume
   * POST /analyze
   */
  async analyzeResume(resumeId: number): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("resume_id", resumeId.toString());

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/analyze",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  /**
   * Get Resume Analysis
   * GET /resume/{resume_id}
   */
  async getResumeAnalysis(resumeId: number): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await resumeApi.get(
      `/resume/${resumeId}`
    );
    const analysis = response.data.resume.analysis;

    // Transform the backend analysis format to match frontend expectations
    return {
      overall_score: analysis.score || 0,
      category_scores: [
        {
          name: "ATS Compatibility",
          category: "ats",
          score: analysis.score || 0,
          max_score: 100,
        },
        {
          name: "Content Quality",
          category: "content",
          score: Math.max(0, (analysis.score || 0) - 10),
          max_score: 100,
        },
        {
          name: "Keywords",
          category: "keywords",
          score: Math.max(0, (analysis.score || 0) - 5),
          max_score: 100,
        },
        {
          name: "Formatting",
          category: "formatting",
          score: Math.max(0, (analysis.score || 0) - 15),
          max_score: 100,
        },
      ],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      found_keywords: [], // Not provided by backend
      missing_keywords: [], // Not provided by backend
      recommendations: analysis.suggestions || [],
    };
  },

  /**
   * Get Resume Improvements
   * GET /resume/{resume_id}/improvements
   */
  async getResumeImprovements(resumeId: number): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = await resumeApi.get(
      `/resume/${resumeId}/improvements`
    );
    return response.data;
  },

  /**
   * Generate Cover Letter
   * POST /cover-letter/generate
   */
  async generateCoverLetter(
    resumeId: number,
    jobDescription: string
  ): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("resume_id", resumeId.toString());
    formData.append("job_description", jobDescription);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/cover-letter/generate",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  /**
   * Match Resume with Job
   * POST /match
   */
  async matchJob(
    resumeId: number,
    jobDescription: string
  ): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append("resume_id", resumeId.toString());
    formData.append("job_description", jobDescription);

    const response: AxiosResponse<Record<string, any>> = await resumeApi.post(
      "/match",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },
};

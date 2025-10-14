import React, { useState, useEffect } from 'react';
import { useNotification } from '@contexts/NotificationContext.js';
import { resumeService } from '@resume/services';
import { formatDate } from '@utils/dateUtils.js';
import type { ResumeScan, ResumeListResponse, ResumeImprovements } from '@types';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ResumeImprovement = () => {
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [userResumes, setUserResumes] = useState<ResumeScan[]>([]);
  const [improvements, setImprovements] = useState<ResumeImprovements | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { success, error } = useNotification();

  useEffect(() => {
    loadUserResumes();
  }, []);

  const loadUserResumes = async (): Promise<void> => {
    try {
      const response: ResumeListResponse = await resumeService.getUserResumes();
      const resumes = response.resumes;
      setUserResumes(resumes);
      if (resumes.length > 0) {
        setSelectedResume(parseInt(resumes[0].id));
        loadImprovements(parseInt(resumes[0].id));
      }
    } catch (err: any) {
      error('Failed to load resumes');
    }
  };

  const loadImprovements = async (resumeId: number): Promise<void> => {
    setLoading(true);
    try {
      const data = await resumeService.getResumeImprovements(resumeId);
      setImprovements(data as ResumeImprovements);
    } catch (err: any) {
      error('Failed to load improvement suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (resumeId: number): void => {
    setSelectedResume(resumeId);
    loadImprovements(resumeId);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string): React.ReactElement => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'low':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <LightBulbIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Resume Improvement</h1>
        <p className="mt-2 text-gray-600">
          Get personalized suggestions to optimize your resume for better ATS compatibility
        </p>
      </div>

      {/* Resume Selection */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Resume to Improve</h3>
        {userResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userResumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => handleResumeChange(parseInt(resume.id))}
                className={`p-4 border rounded-lg text-left transition-colors w-full min-h-[80px] ${
                  selectedResume === parseInt(resume.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate break-all" title={resume.original_filename || resume.filename}>
                      {resume.original_filename || resume.filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(resume.uploaded_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No resumes uploaded yet</p>
            <a href="/upload" className="text-blue-600 hover:text-blue-500 text-sm">
              Upload your first resume
            </a>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {improvements && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Improvement Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {0}
                </div>
                <div className="text-sm text-red-600">High Priority</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {0}
                </div>
                <div className="text-sm text-yellow-600">Medium Priority</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {0}
                </div>
                <div className="text-sm text-green-600">Low Priority</div>
              </div>
            </div>
          </div>

          {/* Detailed Improvements */}
          <div className="space-y-4">
            {improvements.suggestions?.map((suggestion: any, index: number) => (
              <div key={index} className="card">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                      {getPriorityIcon(suggestion.priority)}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{suggestion.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    
                    {suggestion.examples && suggestion.examples.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Examples:</h4>
                        <ul className="space-y-1">
                          {suggestion.examples.map((example: string, exampleIndex: number) => (
                            <li key={exampleIndex} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {suggestion.keywords && suggestion.keywords.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Keywords:</h4>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.keywords.map((keyword: string, keywordIndex: number) => (
                            <span
                              key={keywordIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ATS Optimization Tips */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">General ATS Optimization Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Do's</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Use standard section headings (Experience, Education, Skills)
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Include relevant keywords from job descriptions
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Use bullet points for easy scanning
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Keep formatting simple and consistent
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Don'ts</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start">
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Use images, graphics, or complex formatting
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Include tables or columns
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Use unusual fonts or colors
                  </li>
                  <li className="flex items-start">
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Save as image files (JPG, PNG)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Download Improved Resume
            </button>
            <button className="btn-secondary">
              Compare with Original
            </button>
            <button className="btn-success">
              Save Improvements
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeImprovement;

import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext.js';
import { resumeService } from '../services/resumeService.js';
import { formatDateWithPrefix } from '../utils/dateUtils.js';
import type { ResumeScan, ResumeListResponse, JobMatchResult } from '../types/index.js';
import {
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const JobMatching = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [userResumes, setUserResumes] = useState<ResumeScan[]>([]);
  const [matching, setMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
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
        setSelectedResume(resumes[0].id);
      }
    } catch (err: any) {
      error('Failed to load resumes');
    }
  };

  const handleMatch = async (): Promise<void> => {
    if (!selectedResume || !jobDescription.trim()) {
      error('Please select a resume and enter a job description');
      return;
    }

    setMatching(true);
    try {
      const result = await resumeService.matchJob(selectedResume, jobDescription);
      setMatchResult(result as JobMatchResult);
      success('Job matching completed!');
    } catch (err: any) {
      error('Job matching failed');
    } finally {
      setMatching(false);
    }
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchIcon = (score: number): React.ReactElement => {
    if (score >= 80) return <CheckCircleIcon className="h-5 w-5" />;
    if (score >= 60) return <ExclamationTriangleIcon className="h-5 w-5" />;
    return <XCircleIcon className="h-5 w-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Job Matching</h1>
        <p className="mt-2 text-gray-600">
          Compare your resume against job descriptions to see how well you match
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Selection */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Resume</h3>
          {userResumes.length > 0 ? (
            <div className="space-y-3">
              {userResumes.map((resume) => (
                <label key={resume.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="resume"
                    value={resume.id}
                    checked={selectedResume === resume.id}
                    onChange={(e) => setSelectedResume(parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{resume.filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateWithPrefix(resume.uploaded_at, 'Uploaded')}
                    </p>
                  </div>
                </label>
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

        {/* Job Description */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Description</h3>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Match Button */}
      <div className="flex justify-center">
        <button
          onClick={handleMatch}
          disabled={matching || !selectedResume || !jobDescription.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {matching ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Matching...
            </div>
          ) : (
            'Match Resume with Job'
          )}
        </button>
      </div>

      {/* Results */}
      {matchResult && (
        <div className="space-y-6">
          {/* Overall Match Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Overall Match Score</h2>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(matchResult.overall_score)}`}>
                {getMatchIcon(matchResult.overall_score)}
                <span className="ml-1">{matchResult.overall_score}%</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${matchResult.overall_score}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600">
              {matchResult.overall_score >= 80 
                ? "Excellent match! Your resume aligns very well with this job."
                : matchResult.overall_score >= 60
                ? "Good match! There are some areas where you could improve alignment."
                : "Low match. Consider tailoring your resume more specifically to this role."
              }
            </p>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Match */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Alignment</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Required Skills Match</span>
                    <span>{matchResult.skills_match?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${matchResult.skills_match?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Matched Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.skills_match?.matched_skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Missing Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.skills_match?.missing_skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Match */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Alignment</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Experience Level Match</span>
                    <span>{matchResult.experience_match?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${matchResult.experience_match?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Experience Gaps</h4>
                  <ul className="space-y-1">
                    {matchResult.experience_match?.gaps?.map((gap, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Improvement Recommendations</h3>
            <ul className="space-y-3">
              {matchResult.recommendations?.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Generate Cover Letter
            </button>
            <button className="btn-secondary">
              View Resume Improvements
            </button>
            <button className="btn-success">
              Save Match Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;

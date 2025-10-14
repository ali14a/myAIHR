import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../core/contexts/NotificationContext.js';
import { resumeService } from '../../resume/services/resumeService.js';
import { formatDateWithPrefix } from '../../core/utils/dateUtils.js';
import type { ResumeScan, ResumeListResponse, CoverLetter } from '../../core/types/index.js';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CoverLetter = () => {
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [userResumes, setUserResumes] = useState<ResumeScan[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const { success, error } = useNotification();

  useEffect(() => {
    loadUserResumes();
  }, []);

  const loadUserResumes = useCallback(async (): Promise<void> => {
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
  }, [error]);

  const generateCoverLetter = async (): Promise<void> => {
    if (!selectedResume || !jobDescription.trim()) {
      error('Please select a resume and enter a job description');
      return;
    }

    setGenerating(true);
    try {
      const result = await resumeService.generateCoverLetter(selectedResume, jobDescription);
      setCoverLetter(result as CoverLetter);
      success('Cover letter generated successfully!');
    } catch (err: any) {
      error('Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCoverLetter = (): void => {
    if (!coverLetter) return;
    
    const element = document.createElement('a');
    const file = new Blob([coverLetter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover_letter_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const regenerateCoverLetter = (): void => {
    setCoverLetter(null);
    generateCoverLetter();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
        <p className="mt-2 text-gray-600">
          Generate personalized cover letters tailored to specific job descriptions
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
            placeholder="Paste the job description here to generate a tailored cover letter..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateCoverLetter}
          disabled={generating || !selectedResume || !jobDescription.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Cover Letter'
          )}
        </button>
      </div>

      {/* Cover Letter Results */}
      {coverLetter && (
        <div className="space-y-6">
          {/* Cover Letter Header */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Generated Cover Letter</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button
                  onClick={regenerateCoverLetter}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Regenerate
                </button>
                <button
                  onClick={downloadCoverLetter}
                  className="btn-primary"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Cover Letter Content */}
          <div className="card">
            {previewMode ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                  {coverLetter.content}
                </div>
              </div>
            ) : (
              <textarea
                value={coverLetter.content}
                onChange={(e) => setCoverLetter({...coverLetter, content: e.target.value})}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
            )}
          </div>

          {/* Cover Letter Analysis */}
          {coverLetter.analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter Strengths</h3>
                <ul className="space-y-2">
                  {coverLetter.analysis.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suggestions for Improvement</h3>
                <ul className="space-y-2">
                  {coverLetter.analysis.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <PencilSquareIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Best Practices</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Keep it concise (3-4 paragraphs)</li>
                  <li>• Address the hiring manager by name if possible</li>
                  <li>• Highlight specific achievements relevant to the role</li>
                  <li>• Show enthusiasm for the company and position</li>
                  <li>• End with a clear call to action</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">What to Avoid</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Generic templates without personalization</li>
                  <li>• Repeating information from your resume</li>
                  <li>• Being too formal or too casual</li>
                  <li>• Focusing only on what you want</li>
                  <li>• Typos and grammatical errors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetter;

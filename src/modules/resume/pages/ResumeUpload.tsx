import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@contexts/NotificationContext.js';
import { resumeService } from '@resume/services';
import type { ResumeAnalysisData } from '@types';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ResumeUpload = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File): void => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      error('Please upload a PDF or DOCX file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
  };

  const removeFile = (): void => {
    setUploadedFile(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (): Promise<void> => {
    if (!uploadedFile) return;

    setUploading(true);
    
    // Add timeout to prevent hanging
    const uploadTimeout = setTimeout(() => {
      setUploading(false);
      error('Upload timed out. Please try again.');
    }, 30000); // 30 second timeout

    try {
      console.log('Starting resume upload...');
      console.log('File details:', {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      });
      
      const response = await resumeService.uploadResume(uploadedFile);
      console.log('Upload response:', response);
      
      // Clear timeout since upload succeeded
      clearTimeout(uploadTimeout);
      setUploading(false);
      
      // Check if response has resume_id
      if (response && response.resume_id) {
        success('Resume uploaded successfully!');
        
        // Navigate to analysis page after a short delay
        setTimeout(() => {
          navigate(`/analysis?resumeId=${response.resume_id}`);
        }, 1000);
      } else {
        // Upload succeeded but no resume_id returned
        success('Resume uploaded successfully!');
        console.warn('Upload succeeded but no resume_id in response:', response);
      }
      
    } catch (err: any) {
      console.error('Upload failed:', err);
      clearTimeout(uploadTimeout);
      setUploading(false);
      
      // More detailed error message
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      error(`Upload failed: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Your Resume</h1>
        <p className="mt-2 text-gray-600">
          Upload your resume to get AI-powered analysis and optimization suggestions
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : uploadedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {uploadedFile ? (
            <div className="space-y-4">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <p className="text-lg font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your resume here, or{' '}
                  <span className="text-blue-600">browse</span>
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF and DOCX files up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {uploadedFile && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={uploadFile}
              disabled={uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload & Analyze Resume'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Preview */}
      {analysisResult && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Complete!</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Your resume has been successfully analyzed
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Redirecting to detailed analysis results...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tips for Best Results</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Use a clear, well-formatted resume with standard sections (Experience, Education, Skills)
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Include relevant keywords from job descriptions you're targeting
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Ensure your contact information is up to date
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Use action verbs to describe your achievements and responsibilities
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;

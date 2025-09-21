import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { resumeService } from '../services/resumeService.js';
import type { ResumeScan, ResumeListResponse } from '../types/index.js';
import {
  DocumentArrowUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalResumes: number;
  analyzedResumes: number;
  jobMatches: number;
  coverLetters: number;
  monthlyQuota: number;
  usedQuota: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    analyzedResumes: 0,
    jobMatches: 0,
    coverLetters: 0,
    monthlyQuota: 50,
    usedQuota: 0
  });
  const [recentResumes, setRecentResumes] = useState<ResumeScan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      const response: ResumeListResponse = await resumeService.getUserResumes();
      const resumes = response.resumes;
      setRecentResumes(resumes.slice(0, 5));
      
      setStats(prev => ({
        ...prev,
        totalResumes: resumes.length,
        analyzedResumes: resumes.filter((r: ResumeScan) => r.analysis_status === 'completed').length,
        usedQuota: resumes.length
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuotaPercentage = () => {
    return (stats.usedQuota / stats.monthlyQuota) * 100;
  };

  const getQuotaColor = () => {
    const percentage = getQuotaPercentage();
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your resume analysis and job matching.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Resumes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalResumes}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Analyzed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.analyzedResumes}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Job Matches</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.jobMatches}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cover Letters</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.coverLetters}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Usage */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Quota Usage</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Used: {stats.usedQuota} / {stats.monthlyQuota}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuotaColor()}`}>
              {getQuotaPercentage().toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getQuotaPercentage(), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/upload"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Upload New Resume</span>
            </Link>
            <Link
              to="/matching"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Match with Jobs</span>
            </Link>
            <Link
              to="/cover-letter"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Generate Cover Letter</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Resumes</h3>
          <div className="space-y-3">
            {recentResumes.length > 0 ? (
              recentResumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resume.filename}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {resume.analysis_status === 'completed' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : resume.analysis_status === 'processing' ? (
                      <ClockIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No resumes uploaded yet. <Link to="/upload" className="text-blue-600 hover:text-blue-500">Upload your first resume</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

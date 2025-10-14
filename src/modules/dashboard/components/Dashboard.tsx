import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext.js';
import { resumeService } from '@resume/services/resumeService.js';
import { formatDate } from '@core/utils/dateUtils.js';
import type { ResumeScan, ResumeListResponse } from '@core/types/index.js';
import {
  DocumentArrowUpIcon,
  ChartBarIcon,
  UserGroupIcon,
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

  const getResumeStatusIcon = (status: string) => {
    if (status === 'completed') {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="text-xs font-medium">Complete</span>
        </div>
      );
    }
    
    if (status === 'processing') {
      return (
        <div className="flex items-center space-x-1 text-yellow-600">
          <ClockIcon className="h-5 w-5" />
          <span className="text-xs font-medium">Processing</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 text-red-600">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span className="text-xs font-medium">Error</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-300/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user?.first_name || 'User'}! 👋
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              Here's what's happening with your resume analysis and job matching. Let's make your career dreams come true!
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DocumentArrowUpIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.totalResumes}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Resumes Uploaded</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.analyzedResumes}</p>
                  <p className="text-sm text-gray-500">Analyzed</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Analysis Complete</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.jobMatches}</p>
                  <p className="text-sm text-gray-500">Matches</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Job Matches Found</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.coverLetters}</p>
                  <p className="text-sm text-gray-500">Generated</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Cover Letters</p>
            </div>
          </div>
        </div>

        {/* Quota Usage */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Monthly Quota Usage</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Active Plan</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Used: {stats.usedQuota} / {stats.monthlyQuota}</span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getQuotaColor()}`}>
                  {getQuotaPercentage().toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${Math.min(getQuotaPercentage(), 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {stats.monthlyQuota - stats.usedQuota} uploads remaining this month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Resumes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Link
                  to="/upload"
                  className="group flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover:scale-105 border border-blue-200/50"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <DocumentArrowUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <span className="text-lg font-semibold text-gray-900">Upload New Resume</span>
                    <p className="text-sm text-gray-600">Get started with AI analysis</p>
                  </div>
                </Link>
                <Link
                  to="/matching"
                  className="group flex items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:scale-105 border border-purple-200/50"
                >
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <span className="text-lg font-semibold text-gray-900">Match with Jobs</span>
                    <p className="text-sm text-gray-600">Find your perfect role</p>
                  </div>
                </Link>
                <Link
                  to="/cover-letter"
                  className="group flex items-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 border border-orange-200/50"
                >
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <span className="text-lg font-semibold text-gray-900">Generate Cover Letter</span>
                    <p className="text-sm text-gray-600">AI-powered writing assistant</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Resumes</h3>
              <div className="space-y-4">
                {recentResumes.length > 0 ? (
                  recentResumes.map((resume) => (
                    <div key={resume.id} className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-all duration-300 border border-gray-200/50">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="p-2 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <DocumentArrowUpIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate" title={resume.original_filename || resume.filename}>
                            {resume.original_filename || resume.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(resume.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getResumeStatusIcon(resume.analysis_status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No resumes uploaded yet</p>
                    <Link 
                      to="/upload" 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                    >
                      Upload your first resume
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;

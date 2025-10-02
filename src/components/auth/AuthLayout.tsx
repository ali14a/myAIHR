import React from 'react';
import { DocumentIcon } from '../../assets/icons';

interface AuthLayoutProps {
  title: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  className = ""
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Unified background with seamless gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-35 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Content container with centered layout */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="w-32 h-32 mx-auto lg:mx-0 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-blue-800 mb-4">
                AI-Powered HR
              </h1>
              <p className="text-xl text-blue-700 mb-6">
                Transform your recruitment process with intelligent resume analysis and job matching
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-blue-600">
                <div className="flex items-center bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Resume Analysis
                </div>
                <div className="flex items-center bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Job Matching
                </div>
                <div className="flex items-center bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Cover Letter Generation
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth card */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            {/* Glassmorphism card with enhanced blending */}
            <div className={`backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl p-8 space-y-8 ${className}`}>
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <DocumentIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-blue-800 mb-2">
                    {title}
                  </h2>
                  {subtitle && (
                    <div className="text-blue-600 text-sm">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
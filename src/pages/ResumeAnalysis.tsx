import {
  ArrowRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  StarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { useNotification } from "../contexts/NotificationContext.js";
import { resumeService } from "../services/resumeService.js";
import type {
  ResumeAnalysis as ResumeAnalysisType,
  ResumeScan,
} from "../types/index.js";

const ResumeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resumeId = searchParams.get("resumeId");
  const [analysis, setAnalysis] = useState<ResumeAnalysisType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userResumes, setUserResumes] = useState<ResumeScan[]>([]);
  const [showDefaultPage, setShowDefaultPage] = useState<boolean>(false);
  const { error } = useNotification();
  const { user, loading: authLoading } = useAuth();

  // Force re-render when resumeId changes by using it as a key
  const componentKey = resumeId || "default";

  // Separate effect to handle URL parameter changes
  useEffect(() => {
    console.log("URL parameter changed:", { resumeId });

    // Reset states when resumeId changes
    setAnalysis(null);
    setLoading(true);
    setShowDefaultPage(false);
  }, [resumeId]);

  useEffect(() => {
    console.log("ResumeAnalysis useEffect triggered:", {
      resumeId,
      user: !!user,
      authLoading,
    });

    // Check if user is authenticated
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (resumeId) {
      console.log("Loading analysis for resume ID:", resumeId);
      loadAnalysis();
    } else {
      console.log("Loading user resumes (no resumeId)");
      loadUserResumes();
    }
  }, [resumeId, user, authLoading, navigate]);

  const loadAnalysis = async (): Promise<void> => {
    if (!resumeId) {
      console.log("No resumeId, skipping loadAnalysis");
      return;
    }

    console.log("loadAnalysis called with resumeId:", resumeId);
    const currentResumeId = resumeId; // Capture the current resumeId to prevent race conditions

    try {
      const data = await resumeService.getResumeAnalysis(parseInt(resumeId));
      console.log("Analysis data received:", data);

      // Only update state if this is still the current resumeId
      if (currentResumeId === resumeId) {
        setAnalysis(data as ResumeAnalysisType);
      }
    } catch (err: any) {
      console.error("Failed to load analysis:", err);
      if (err.response?.status === 401) {
        error("Please log in to view analysis results");
        navigate("/login");
      } else if (err.response?.status === 404) {
        error("Resume not found");
      } else {
        error("Failed to load analysis results");
      }
    } finally {
      // Only update loading state if this is still the current resumeId
      if (currentResumeId === resumeId) {
        setLoading(false);
      }
    }
  };

  const loadUserResumes = async (): Promise<void> => {
    try {
      const data = await resumeService.getUserResumes();
      setUserResumes(data.resumes || []);
      setShowDefaultPage(true);
    } catch (err: any) {
      console.error("Failed to load resumes:", err);
      if (err.response?.status === 401) {
        error("Please log in to view your resumes");
        navigate("/login");
      } else {
        error("Failed to load resumes");
      }
      setShowDefaultPage(true);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score: number): React.ReactElement => {
    if (score >= 80) return <CheckCircleIcon className="h-5 w-5" />;
    if (score >= 60) return <ExclamationTriangleIcon className="h-5 w-5" />;
    return <XCircleIcon className="h-5 w-5" />;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDefaultPage) {
    return <DefaultAnalysisPage userResumes={userResumes} />;
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No analysis found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Please upload a resume first to see analysis results.
        </p>
        <div className="mt-6">
          <Link to="/upload" className="btn-primary">
            Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div key={componentKey} className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
          <p className="mt-2 text-gray-600">
            Detailed analysis of your resume with ATS compatibility and
            improvement suggestions
          </p>
        </div>
        <Link to="/improvement" className="btn-primary">
          View Improvements
        </Link>
      </div>

      {/* Overall Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Overall ATS Score
          </h2>
          <div
            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
              analysis.overall_score
            )}`}
          >
            {getScoreIcon(analysis.overall_score)}
            <span className="ml-1">{analysis.overall_score}/100</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
            style={{ width: `${analysis.overall_score}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-600">
          {analysis.overall_score >= 80
            ? "Excellent! Your resume is well-optimized for ATS systems."
            : analysis.overall_score >= 60
            ? "Good! Your resume has room for improvement to better match ATS requirements."
            : "Your resume needs significant improvements to be ATS-compatible."}
        </p>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analysis.category_scores?.map((category) => (
          <div key={category.name} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                {category.name}
              </h3>
              <div
                className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                  category.score
                )}`}
              >
                {getScoreIcon(category.score)}
                <span className="ml-1">{category.score}/100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${category.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start">
                <StarIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="card">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Areas for Improvement
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses?.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keywords Analysis */}
      <div className="card">
        <div className="flex items-center mb-4">
          <LightBulbIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Keyword Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Found Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.found_keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Missing Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="flex items-center mb-4">
          <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
        </div>
        <ul className="space-y-3">
          {analysis.recommendations?.map((recommendation, index) => (
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
        <Link to="/matching" className="btn-primary">
          Match with Jobs
        </Link>
        <Link to="/cover-letter" className="btn-secondary">
          Generate Cover Letter
        </Link>
        <Link to="/improvement" className="btn-success">
          View Detailed Improvements
        </Link>
      </div>
    </div>
  );
};

// Default Analysis Page Component
const DefaultAnalysisPage = ({
  userResumes,
}: {
  userResumes: ResumeScan[];
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score: number): React.ReactElement => {
    if (score >= 80) return <CheckCircleIcon className="h-5 w-5" />;
    if (score >= 60) return <ExclamationTriangleIcon className="h-5 w-5" />;
    return <XCircleIcon className="h-5 w-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <ChartBarIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Resume Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get detailed insights into your resume's ATS compatibility and
          discover areas for improvement
        </p>
      </div>

      {userResumes.length === 0 ? (
        /* No Resumes Uploaded */
        <div className="text-center py-12">
          <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
            <DocumentArrowUpIcon className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No Resumes Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Upload your first resume to get started with our AI-powered analysis
            and optimization tools.
          </p>
          <div className="space-y-4">
            <Link to="/upload" className="btn-primary text-lg px-8 py-3">
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Your Resume
            </Link>
            <div className="text-sm text-gray-500">
              <p>Supported formats: PDF, DOC, DOCX</p>
            </div>
          </div>
        </div>
      ) : (
        /* Has Resumes - Show List */
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Resumes
            </h2>
            <p className="text-gray-600">
              Select a resume to view its detailed analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userResumes.map((resume) => (
              <div
                key={resume.id}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {resume.original_filename || resume.filename}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {resume.timestamp
                          ? new Date(resume.timestamp).toLocaleDateString()
                          : "Recently uploaded"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                      resume.ats_score
                    )}`}
                  >
                    {getScoreIcon(resume.ats_score)}
                    <span className="ml-1">{resume.ats_score}/100</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${resume.ats_score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    ATS Score:{" "}
                    {resume.ats_score >= 80
                      ? "Excellent"
                      : resume.ats_score >= 60
                      ? "Good"
                      : "Needs Improvement"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {(resume.file_size / 1024).toFixed(1)} KB
                  </span>
                  <Link
                    to={`/analysis?resumeId=${resume.id}`}
                    className="btn-primary text-sm px-4 py-2"
                    onClick={() => {
                      console.log(
                        "View Analysis clicked for resume ID:",
                        resume.id
                      );
                    }}
                  >
                    View Analysis
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <Link to="/upload" className="btn-secondary">
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Upload Another Resume
            </Link>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          What You'll Get with Resume Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              ATS Compatibility
            </h4>
            <p className="text-gray-600">
              Get a detailed score on how well your resume performs with
              Applicant Tracking Systems
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LightBulbIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Smart Recommendations
            </h4>
            <p className="text-gray-600">
              Receive personalized suggestions to improve your resume's
              effectiveness
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <StarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Keyword Analysis
            </h4>
            <p className="text-gray-600">
              Identify missing keywords and optimize your content for better job
              matching
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;

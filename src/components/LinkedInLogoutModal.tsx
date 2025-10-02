import React, { useState } from 'react';
import { linkedinAuthService } from '../services/linkedinAuthService';

interface LinkedInLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutComplete: () => void;
}

/**
 * Modal component for LinkedIn logout options
 * Provides users with choices for how to logout from LinkedIn
 */
const LinkedInLogoutModal: React.FC<LinkedInLogoutModalProps> = ({
  isOpen,
  onClose,
  onLogoutComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoutResult, setLogoutResult] = useState<string>('');

  const handleTokenRevocation = async () => {
    setIsLoading(true);
    setLogoutResult('');
    
    try {
      const result = await linkedinAuthService.revokeAccess();
      if (result.success) {
        setLogoutResult('✅ LinkedIn access token revoked successfully!');
        setTimeout(() => {
          onLogoutComplete();
          onClose();
        }, 1500);
      } else {
        setLogoutResult(`❌ Token revocation failed: ${result.error}`);
      }
    } catch (error) {
      setLogoutResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToLinkedIn = () => {
    linkedinAuthService.redirectToLinkedInLogout();
    setLogoutResult('🔄 Redirecting to LinkedIn logout page...');
    setTimeout(() => {
      onLogoutComplete();
      onClose();
    }, 2000);
  };

  const handleSkipLinkedInLogout = () => {
    setLogoutResult('ℹ️ Skipped LinkedIn logout - you remain logged into LinkedIn');
    setTimeout(() => {
      onLogoutComplete();
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            LinkedIn Logout Options
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose how you'd like to logout from LinkedIn:
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleTokenRevocation}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Revoking Access...
              </>
            ) : (
              '🔐 Revoke App Access (Recommended)'
            )}
          </button>

          <button
            onClick={handleRedirectToLinkedIn}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🌐 Open LinkedIn Logout Page
          </button>

          <button
            onClick={handleSkipLinkedInLogout}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏭️ Skip LinkedIn Logout
          </button>
        </div>

        {logoutResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <p className="text-sm text-gray-700">{logoutResult}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p><strong>Note:</strong> Revoking app access only removes permissions for this app. You'll remain logged into LinkedIn.</p>
        </div>
      </div>
    </div>
  );
};

export default LinkedInLogoutModal;


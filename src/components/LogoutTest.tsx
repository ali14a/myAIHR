import React, { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { logoutService } from '@auth/services';

/**
 * Test component to demonstrate logout functionality
 * This can be used for testing different logout scenarios
 */
const LogoutTest: React.FC = () => {
  const { user, logout } = useAuth();
  const [logoutResult, setLogoutResult] = useState<string>('');

  const handleLogout = async () => {
    try {
      const result = await logout();
      setLogoutResult(`Logout ${result.success ? 'successful' : 'failed'}: ${result.message || result.error || 'Unknown result'}`);
    } catch (error) {
      setLogoutResult(`Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleForceLogout = async () => {
    try {
      const result = await logoutService.forceLogout();
      setLogoutResult(`Force logout ${result.success ? 'successful' : 'failed'}: ${result.message || result.error || 'Unknown result'}`);
    } catch (error) {
      setLogoutResult(`Force logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getCurrentAuthMethod = () => {
    return logoutService.getCurrentAuthMethod() || 'Unknown';
  };

  const isAuthenticated = () => {
    return logoutService.isAuthenticated();
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Logout Test</h3>
        <p className="text-yellow-700">Please log in first to test logout functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-lg font-medium text-blue-800 mb-4">Logout Test</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-900">User Info</h4>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
            <p className="text-sm text-gray-600">Name: {user.first_name} {user.last_name}</p>
            <p className="text-sm text-gray-600">Auth Method: {getCurrentAuthMethod()}</p>
            <p className="text-sm text-gray-600">Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-900">Logout Actions</h4>
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Smart Logout
              </button>
              <button
                onClick={handleForceLogout}
                className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Force Logout
              </button>
            </div>
          </div>
        </div>

        {logoutResult && (
          <div className="bg-gray-100 p-3 rounded border">
            <h4 className="font-medium text-gray-900">Last Result</h4>
            <p className="text-sm text-gray-700">{logoutResult}</p>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded border">
          <h4 className="font-medium text-gray-900">How it works:</h4>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>• <strong>Smart Logout:</strong> Detects auth method and performs appropriate cleanup</li>
            <li>• <strong>Force Logout:</strong> Clears all data regardless of auth method</li>
            <li>• <strong>Email/Password:</strong> Clears local token only</li>
            <li>• <strong>Google OAuth:</strong> Signs out from Google and clears local data</li>
            <li>• <strong>LinkedIn OAuth:</strong> Clears local data (tokens expire naturally)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoutTest;


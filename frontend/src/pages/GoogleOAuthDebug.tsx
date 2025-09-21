import React, { useEffect, useState } from 'react';

const GoogleOAuthDebug: React.FC = () => {
  const [clientId, setClientId] = useState<string>('');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    // Check environment variables
    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setClientId(envClientId || 'NOT SET');
    
    // Load Google Identity Services
    if (window.google) {
      setIsGoogleLoaded(true);
      addDebugInfo('Google Identity Services already loaded');
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
        addDebugInfo('Google Identity Services loaded successfully');
      };
      script.onerror = () => {
        addDebugInfo('Failed to load Google Identity Services');
      };
      document.head.appendChild(script);
    }
  }, []);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testGoogleAuth = () => {
    if (!window.google) {
      addDebugInfo('Google Identity Services not loaded');
      return;
    }

    if (!clientId || clientId === 'NOT SET') {
      addDebugInfo('Google Client ID not configured');
      return;
    }

    addDebugInfo('Starting Google OAuth flow...');
    
    try {
      const auth = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        redirect_uri: window.location.origin,
        callback: (response: any) => {
          addDebugInfo(`OAuth callback received: ${JSON.stringify(response)}`);
          
          if (response.code) {
            addDebugInfo('Authorization code received, sending to backend...');
            
            fetch('http://localhost:8000/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                code: response.code,
                redirect_uri: window.location.origin
              }),
            })
            .then(async response => {
              addDebugInfo(`Backend status: ${response.status} ${response.statusText}`);
              
              const responseText = await response.text();
              addDebugInfo(`Backend response text: ${responseText}`);
              
              try {
                const data = JSON.parse(responseText);
                addDebugInfo(`Backend response parsed: ${JSON.stringify(data)}`);
              } catch (parseError) {
                addDebugInfo(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
              }
            })
            .catch(error => {
              addDebugInfo(`Backend error: ${error.message}`);
            });
          } else {
            addDebugInfo('No authorization code received');
          }
        },
      });

      auth.requestCode();
      addDebugInfo('Authorization code request sent');
    } catch (error) {
      addDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google OAuth Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2">
            <p><strong>Client ID:</strong> {clientId}</p>
            <p><strong>Google Loaded:</strong> {isGoogleLoaded ? 'Yes' : 'No'}</p>
            <p><strong>Current Origin:</strong> {window.location.origin}</p>
            <p><strong>Current URL:</strong> {window.location.href}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test OAuth Flow</h2>
          <button
            onClick={testGoogleAuth}
            disabled={!isGoogleLoaded || clientId === 'NOT SET'}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Google OAuth
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Log</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No debug information yet...</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {info}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthDebug;

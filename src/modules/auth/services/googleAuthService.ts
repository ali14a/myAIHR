import { GoogleAuth } from 'google-auth-library';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    mobile_number: string | null;
    company: string | null;
    job_title: string | null;
    location: string | null;
    bio: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    website_url: string | null;
    profile_photo: string | null;
    profile_photo_path: string | null;
    updated_at: string | null;
  };
  error?: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized: boolean = false;
  private gapi: any;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!this.clientId) {
      console.warn('Google Client ID not found. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }
  }

  private async initializeGoogleAuth(): Promise<void> {
    if (this.isInitialized) return;

    // Load Google Identity Services script
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.isInitialized = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isInitialized = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<GoogleAuthResponse> {
    try {
      await this.initializeGoogleAuth();

      if (!this.clientId) {
        throw new Error('Google Client ID not configured');
      }

      return new Promise((resolve) => {
        const auth = window.google.accounts.oauth2.initCodeClient({
          client_id: this.clientId,
          scope: 'openid email profile',
          redirect_uri: window.location.origin,
          callback: async (response: any) => {
            try {
              // Send the authorization code to our backend
              const backendResponse = await fetch('http://localhost:8000/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  code: response.code,
                  redirect_uri: window.location.origin
                }),
              });

              let result;
              try {
                const responseText = await backendResponse.text();
                console.log('Backend response text:', responseText);
                
                if (!responseText) {
                  throw new Error('Empty response from server');
                }
                
                result = JSON.parse(responseText);
              } catch (parseError) {
                console.error('JSON parse error:', parseError);
                resolve({
                  success: false,
                  error: `Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
                });
                return;
              }

              resolve(result);
            } catch (error) {
              resolve({
                success: false,
                error: 'Failed to authenticate with backend',
              });
            }
          },
        });

        auth.requestCode();
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google authentication failed',
      };
    }
  }

  // Alternative method using Google Identity Services (newer approach)
  async signInWithPopup(): Promise<GoogleAuthResponse> {
    try {
      await this.initializeGoogleAuth();

      if (!this.clientId) {
        throw new Error('Google Client ID not configured');
      }

      return new Promise((resolve) => {
        const auth = window.google.accounts.oauth2.initCodeClient({
          client_id: this.clientId,
          scope: 'openid email profile',
          callback: async (response: any) => {
            try {
              // Send the authorization code to our backend
              const backendResponse = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: response.code }),
              });

              const result = await backendResponse.json();
              resolve(result);
            } catch (error) {
              resolve({
                success: false,
                error: 'Failed to authenticate with backend',
              });
            }
          },
        });

        auth.requestCode();
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google authentication failed',
      };
    }
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.gapi?.auth2?.getAuthInstance()) {
        await this.gapi.auth2.getAuthInstance().signOut();
        console.log('Google sign out successful');
        return { success: true };
      } else {
        console.log('Google API not initialized, clearing local data');
        return { success: true };
      }
    } catch (error) {
      console.error('Google sign out error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign out from Google' 
      };
    }
  }

  /**
   * Revoke Google access token
   */
  async revokeAccess(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.gapi?.auth2?.getAuthInstance()) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        const user = authInstance.currentUser.get();
        if (user) {
          await user.disconnect();
          console.log('Google access revoked');
        }
        return { success: true };
      } else {
        console.log('Google API not initialized, cannot revoke access');
        return { success: true };
      }
    } catch (error) {
      console.error('Google revoke access error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to revoke Google access' 
      };
    }
  }
}

// Declare global Google types
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initCodeClient: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

export const googleAuthService = new GoogleAuthService();

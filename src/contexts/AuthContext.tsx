import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { googleAuthService } from '../services/googleAuthService';
import { linkedinAuthService } from '../services/linkedinAuthService';
import { logoutService } from '../services/logoutService';
import type { User, AuthContextType } from '../types/index';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Initialize auth method detection
      logoutService.initializeAuthMethod();
      
      authService.getCurrentUser()
        .then(response => {
          setUser(response.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Handle LinkedIn OAuth callback
  useEffect(() => {
    const handleLinkedInCallback = async () => {
      // Check if we're returning from LinkedIn OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state && !user) {
        setLoading(true);
        try {
          console.log('🔗 LinkedIn OAuth callback - processing...');
          const response = await linkedinAuthService.signIn();
          console.log('🔗 LinkedIn response:', response);
          
          if (response.success && response.token) {
            localStorage.setItem('token', response.token);
            // Store LinkedIn auth token for detection
            localStorage.setItem('linkedin_auth_token', response.token);
            // Track authentication method
            logoutService.setAuthMethod('linkedin');
            console.log('🔗 LinkedIn auth method set successfully');
          }
          if (response.success && response.user) {
            const user: User = {
              id: response.user.id,
              email: response.user.email,
              first_name: response.user.first_name,
              last_name: response.user.last_name,
              mobile_number: response.user.mobile_number,
              company: response.user.company,
              job_title: response.user.job_title,
              location: response.user.location,
              bio: response.user.bio,
              linkedin_url: response.user.linkedin_url,
              github_url: response.user.github_url,
              website_url: response.user.website_url,
              profile_photo: response.user.profile_photo || response.user.profile_photo_path,
              updated_at: response.user.updated_at || new Date().toISOString()
            };
            setUser(user);
          }
        } catch (error) {
          console.error('LinkedIn callback error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleLinkedInCallback();
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login(email, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        // Track authentication method
        logoutService.setAuthMethod('email');
      }
      if (response.user) {
        setUser(response.user);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register(email, password, firstName, lastName);
      if (response.token) {
        localStorage.setItem('token', response.token);
        // Track authentication method
        logoutService.setAuthMethod('email');
      }
      if (response.user) {
        setUser(response.user);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      // Use the comprehensive logout service
      const result = await logoutService.logout();
      
      // Clear user state
      setUser(null);
      
      return result;
    } catch (error: any) {
      // Fallback to basic logout if service fails
      localStorage.removeItem('token');
      setUser(null);
      return { 
        success: false, 
        error: error.message || 'Logout failed' 
      };
    }
  };

  const googleLogin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await googleAuthService.signIn();
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        // Store Google auth token for detection
        localStorage.setItem('google_auth_token', response.token);
        // Track authentication method
        logoutService.setAuthMethod('google');
      }
      if (response.success && response.user) {
        // The backend already returns the user in the correct format
        // No need to convert - just use it directly
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          mobile_number: response.user.mobile_number,
          company: response.user.company,
          job_title: response.user.job_title,
          location: response.user.location,
          bio: response.user.bio,
          linkedin_url: response.user.linkedin_url,
          github_url: response.user.github_url,
          website_url: response.user.website_url,
          profile_photo: response.user.profile_photo || response.user.profile_photo_path,
          updated_at: response.user.updated_at || new Date().toISOString()
        };
        setUser(user);
      }
      return { success: response.success, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const linkedinLogin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔗 LinkedIn login initiated...');
      const response = await linkedinAuthService.signIn();
      console.log('🔗 LinkedIn login response:', response);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        // Store LinkedIn auth token for detection
        localStorage.setItem('linkedin_auth_token', response.token);
        // Track authentication method
        logoutService.setAuthMethod('linkedin');
        console.log('🔗 LinkedIn auth method set in linkedinLogin');
      }
      if (response.success && response.user) {
        // The backend already returns the user in the correct format
        // No need to convert - just use it directly
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          mobile_number: response.user.mobile_number,
          company: response.user.company,
          job_title: response.user.job_title,
          location: response.user.location,
          bio: response.user.bio,
          linkedin_url: response.user.linkedin_url,
          github_url: response.user.github_url,
          website_url: response.user.website_url,
          profile_photo: response.user.profile_photo || response.user.profile_photo_path,
          updated_at: response.user.updated_at || new Date().toISOString()
        };
        setUser(user);
      }
      return { success: response.success, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    login,
    register,
    googleLogin,
    linkedinLogin,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

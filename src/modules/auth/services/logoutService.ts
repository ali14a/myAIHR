/**
 * Comprehensive Logout Service
 * Handles logout for different authentication methods (Email, Google, LinkedIn)
 */

export interface LogoutResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface AuthMethod {
  type: 'email' | 'google' | 'linkedin';
  timestamp: number;
}

class LogoutService {
  private readonly AUTH_METHOD_KEY = 'auth_method';
  private readonly GOOGLE_LOGOUT_URL = 'https://accounts.google.com/logout';
  private readonly LINKEDIN_LOGOUT_URL = 'https://www.linkedin.com/oauth/v2/logout';

  /**
   * Track the authentication method used for login
   */
  setAuthMethod(method: 'email' | 'google' | 'linkedin'): void {
    const authData: AuthMethod = {
      type: method,
      timestamp: Date.now()
    };
    localStorage.setItem(this.AUTH_METHOD_KEY, JSON.stringify(authData));
  }

  /**
   * Get the authentication method used for login
   */
  getAuthMethod(): AuthMethod | null {
    try {
      const authData = localStorage.getItem(this.AUTH_METHOD_KEY);
      return authData ? JSON.parse(authData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear sessionStorage
    sessionStorage.removeItem('linkedin_oauth_state');
    sessionStorage.removeItem('google_oauth_state');
    
    // Clear localStorage auth method
    localStorage.removeItem(this.AUTH_METHOD_KEY);
    
    // Clear any other auth-related storage
    localStorage.removeItem('google_auth_token');
    localStorage.removeItem('linkedin_auth_token');
  }

  /**
   * Handle Google OAuth logout
   */
  private async handleGoogleLogout(): Promise<void> {
    try {
      // Revoke Google access token if available
      const googleToken = localStorage.getItem('google_auth_token');
      if (googleToken) {
        // Google doesn't provide a direct revoke endpoint for client-side apps
        // The token will expire naturally
        console.log('Google token will expire naturally');
      }

      // Clear Google-specific data
      localStorage.removeItem('google_auth_token');
      sessionStorage.removeItem('google_oauth_state');
    } catch (error) {
      console.warn('Error during Google logout:', error);
    }
  }

  /**
   * Handle LinkedIn OAuth logout
   */
  private async handleLinkedInLogout(): Promise<void> {
    try {
      // Use the graceful logout method from LinkedIn auth service
      const { linkedinAuthService } = await import('./linkedinAuthService');
      const result = await linkedinAuthService.gracefulLogout();
      
      if (result.success) {
        console.log('LinkedIn logout completed successfully');
      } else if (result.requiresUserAction) {
        console.log('LinkedIn logout requires user action:', result.error);
        // The UI should handle showing the LinkedIn logout modal
        // This is just for logging purposes
        this.showLinkedInLogoutNotification();
      } else {
        console.warn('LinkedIn logout failed:', result.error);
      }
    } catch (error) {
      console.warn('Error during LinkedIn logout:', error);
    }
  }

  /**
   * Show notification for LinkedIn logout action
   */
  private showLinkedInLogoutNotification(): void {
    // This could be enhanced to show a proper UI notification
    console.log('💡 Tip: To completely logout from LinkedIn, visit https://www.linkedin.com/m/logout');
  }

  /**
   * Check if LinkedIn logout requires user interaction
   */
  async checkLinkedInLogoutRequirement(): Promise<{ requiresUserAction: boolean; message?: string }> {
    try {
      const { linkedinAuthService } = await import('./linkedinAuthService');
      const result = await linkedinAuthService.gracefulLogout();
      
      return {
        requiresUserAction: result.requiresUserAction || false,
        message: result.error
      };
    } catch (error) {
      return {
        requiresUserAction: true,
        message: 'LinkedIn logout check failed'
      };
    }
  }

  /**
   * Handle email/password logout
   */
  private async handleEmailLogout(): Promise<void> {
    try {
      // For email/password auth, we just need to clear the token
      // The backend will invalidate the session
      console.log('Email/password logout - token cleared');
    } catch (error) {
      console.warn('Error during email logout:', error);
    }
  }

  /**
   * Perform logout based on authentication method
   */
  async logout(): Promise<LogoutResult> {
    try {
      const authMethod = this.getAuthMethod();
      console.log("🚀 ~ LogoutService ~ logout ~ authMethod:", authMethod)
      
      // Clear all authentication data first
      this.clearAuthData();

      // Handle method-specific logout
      if (authMethod) {
        switch (authMethod.type) {
          case 'google':
            await this.handleGoogleLogout();
            break;
          case 'linkedin':
            await this.handleLinkedInLogout();
            break;
          case 'email':
          default:
            await this.handleEmailLogout();
            break;
        }
      }

      return {
        success: true,
        message: `Successfully logged out from ${authMethod?.type || 'email'} authentication`
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout completed with warnings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Force logout - clears all data regardless of auth method
   */
  async forceLogout(): Promise<LogoutResult> {
    try {
      this.clearAuthData();
      
      return {
        success: true,
        message: 'Force logout completed - all authentication data cleared'
      };
    } catch (error) {
      console.error('Force logout error:', error);
      return {
        success: false,
        message: 'Force logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const authMethod = this.getAuthMethod();
    return !!(token && authMethod);
  }

  /**
   * Detect authentication method from existing tokens/storage
   */
  detectAuthMethod(): 'email' | 'google' | 'linkedin' | null {
    // Check for Google auth token
    if (localStorage.getItem('google_auth_token')) {
      return 'google';
    }
    
    // Check for LinkedIn auth token
    if (localStorage.getItem('linkedin_auth_token')) {
      return 'linkedin';
    }
    
    // Check for LinkedIn OAuth state (indicates recent LinkedIn login)
    if (sessionStorage.getItem('linkedin_oauth_state')) {
      return 'linkedin';
    }
    
    // Check for Google OAuth state (indicates recent Google login)
    if (sessionStorage.getItem('google_oauth_state')) {
      return 'google';
    }
    
    // If we have a token but no specific OAuth indicators, assume email/password
    if (localStorage.getItem('token')) {
      return 'email';
    }
    
    return null;
  }

  /**
   * Initialize auth method if not already set
   */
  initializeAuthMethod(): void {
    const existingMethod = this.getAuthMethod();
    console.log('🔍 Existing auth method:', existingMethod);
    
    if (!existingMethod) {
      const detectedMethod = this.detectAuthMethod();
      console.log('🔍 Detected auth method:', detectedMethod);
      
      if (detectedMethod) {
        this.setAuthMethod(detectedMethod);
        console.log('🔍 Set detected auth method:', detectedMethod);
      }
    }
  }

  /**
   * Get current authentication method
   */
  getCurrentAuthMethod(): string | null {
    const authMethod = this.getAuthMethod();
    return authMethod?.type || null;
  }

  /**
   * Clear expired authentication data
   */
  clearExpiredAuth(): void {
    const authMethod = this.getAuthMethod();
    if (authMethod) {
      // Check if auth is older than 24 hours
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - authMethod.timestamp > twentyFourHours) {
        this.clearAuthData();
        console.log('Cleared expired authentication data');
      }
    }
  }
}

// Create and export singleton instance
export const logoutService = new LogoutService();

// Export the class for testing
export { LogoutService };

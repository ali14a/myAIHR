export interface LinkedInAuthResponse {
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

class LinkedInAuthService {
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';
    this.redirectUri = window.location.origin;
    
    if (!this.clientId || this.clientId === 'your-linkedin-client-id') {
      console.warn('LinkedIn Client ID not found or not configured. Please set VITE_LINKEDIN_CLIENT_ID in your environment variables.');
    }
  }

  /**
   * Generate LinkedIn OAuth authorization URL
   */
  private generateAuthUrl(): string {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const scope = 'openid profile email';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: scope
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Extract authorization code from URL
   */
  private getCodeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }

  /**
   * Extract state from URL
   */
  private getStateFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('state');
  }

  /**
   * Check if we're returning from LinkedIn OAuth
   */
  private isReturningFromLinkedIn(): boolean {
    return window.location.search.includes('code=') && window.location.search.includes('state=');
  }

  /**
   * Clear URL parameters after processing
   */
  private clearUrlParameters(): void {
    if (this.isReturningFromLinkedIn()) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Sign in with LinkedIn
   */
  async signIn(): Promise<LinkedInAuthResponse> {
    try {
      // Check if we're returning from LinkedIn OAuth
      if (this.isReturningFromLinkedIn()) {
        const code = this.getCodeFromUrl();
        
        if (!code) {
          return {
            success: false,
            error: 'No authorization code received from LinkedIn'
          };
        }

        // Clear URL parameters
        this.clearUrlParameters();

        try {
          // Send the authorization code to our backend
          const backendResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/linkedin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              code: code,
              redirect_uri: this.redirectUri
            }),
          });

          const result = await backendResponse.json();
          return result;
        } catch (error) {
          return {
            success: false,
            error: 'Failed to authenticate with backend',
          };
        }
      } else {
        // Redirect to LinkedIn OAuth
        window.location.href = this.generateAuthUrl();
        return {
          success: false,
          error: 'Redirecting to LinkedIn...'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'LinkedIn authentication failed',
      };
    }
  }

  /**
   * Check if LinkedIn OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!this.clientId && this.clientId !== 'your-linkedin-client-id' && this.clientId !== 'REPLACE_WITH_YOUR_ACTUAL_LINKEDIN_CLIENT_ID';
  }

  /**
   * Get LinkedIn OAuth configuration status
   */
  getConfigStatus(): { configured: boolean; clientId: string } {
    return {
      configured: this.isConfigured(),
      clientId: this.clientId
    };
  }

  /**
   * Sign out from LinkedIn
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('LinkedIn sign out - clearing local data');
      
      // Clear LinkedIn-specific data
      sessionStorage.removeItem('linkedin_oauth_state');
      localStorage.removeItem('linkedin_auth_token');
      
      return { success: true };
    } catch (error) {
      console.error('LinkedIn sign out error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign out from LinkedIn' 
      };
    }
  }

  /**
   * Revoke LinkedIn access token
   */
  async revokeAccess(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('linkedin_auth_token');
      
      if (accessToken) {
        try {
          // Use LinkedIn's token invalidation endpoint
          const response = await fetch('https://api.linkedin.com/uas/oauth/invalidateToken', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          if (response.ok) {
            console.log('LinkedIn access token invalidated successfully');
          } else {
            console.warn('LinkedIn token invalidation failed, but continuing with local cleanup');
          }
        } catch (tokenError) {
          console.warn('LinkedIn token invalidation request failed:', tokenError);
        }
      }
      
      // Clear LinkedIn-specific data
      sessionStorage.removeItem('linkedin_oauth_state');
      localStorage.removeItem('linkedin_auth_token');
      
      return { success: true };
    } catch (error) {
      console.error('LinkedIn revoke access error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to revoke LinkedIn access' 
      };
    }
  }

  /**
   * Redirect to LinkedIn logout page
   */
  redirectToLinkedInLogout(): void {
    try {
      // LinkedIn logout URL (mobile version that works better)
      const logoutUrl = 'https://www.linkedin.com/m/logout';
      window.open(logoutUrl, '_blank');
    } catch (error) {
      console.error('Error redirecting to LinkedIn logout:', error);
    }
  }

  /**
   * Graceful LinkedIn logout with user choice
   */
  async gracefulLogout(): Promise<{ success: boolean; error?: string; requiresUserAction?: boolean }> {
    try {
      // First, try to revoke the access token
      const revokeResult = await this.revokeAccess();
      
      if (revokeResult.success) {
        return {
          success: true,
          requiresUserAction: false
        };
      } else {
        // If token revocation fails, offer to redirect to LinkedIn logout
        return {
          success: false,
          error: 'Token revocation failed. Would you like to logout from LinkedIn directly?',
          requiresUserAction: true
        };
      }
    } catch (error) {
      console.error('LinkedIn graceful logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'LinkedIn logout failed',
        requiresUserAction: true
      };
    }
  }
}

// Create and export singleton instance
export const linkedinAuthService = new LinkedInAuthService();

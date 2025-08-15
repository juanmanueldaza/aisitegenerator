interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface OAuthState {
  token: string | null;
  user: {
    login: string;
    name: string | null;
    avatar_url: string;
  } | null;
}

class OAuthService {
  private config: OAuthConfig | null = null;
  private state: OAuthState = {
    token: null,
    user: null,
  };

  /**
   * Initialize OAuth configuration
   */
  configure(config: OAuthConfig): void {
    this.config = config;
    
    // Try to load token from localStorage
    this.loadTokenFromStorage();
  }

  /**
   * Check if OAuth is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get current authentication state
   */
  getState(): OAuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.token !== null;
  }

  /**
   * Get the OAuth token
   */
  getToken(): string | null {
    return this.state.token;
  }

  /**
   * Get authenticated user info
   */
  getUser(): OAuthState['user'] {
    return this.state.user;
  }

  /**
   * Generate GitHub OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.config) {
      throw new Error('OAuth not configured. Call configure() first.');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: this.generateState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and extract authorization code
   */
  handleCallback(): { code: string; state: string } | null {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      return null;
    }

    // Verify state parameter (basic security check)
    const storedState = localStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid OAuth state parameter');
    }

    // Clear state from storage
    localStorage.removeItem('oauth_state');

    return { code, state };
  }

  /**
   * Set the OAuth token (typically after exchanging the authorization code)
   */
  setToken(token: string, user?: OAuthState['user']): void {
    this.state.token = token;
    this.state.user = user || null;
    
    // Save to localStorage
    localStorage.setItem('github_token', token);
    if (user) {
      localStorage.setItem('github_user', JSON.stringify(user));
    }
  }

  /**
   * Clear authentication state
   */
  logout(): void {
    this.state.token = null;
    this.state.user = null;
    
    // Clear from localStorage
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    localStorage.removeItem('oauth_state');
  }

  /**
   * Start OAuth flow by redirecting to GitHub
   */
  startAuthFlow(): void {
    if (!this.config) {
      throw new Error('OAuth not configured. Call configure() first.');
    }

    window.location.href = this.getAuthorizationUrl();
  }

  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('oauth_state', state);
    return state;
  }

  private loadTokenFromStorage(): void {
    try {
      const token = localStorage.getItem('github_token');
      const userStr = localStorage.getItem('github_user');
      
      if (token) {
        this.state.token = token;
      }
      
      if (userStr) {
        this.state.user = JSON.parse(userStr);
      }
    } catch (error) {
      console.warn('Failed to load OAuth data from localStorage:', error);
      // Clear potentially corrupted data
      this.logout();
    }
  }
}

// Create a singleton instance
export const oauthService = new OAuthService();
export type { OAuthConfig, OAuthState };
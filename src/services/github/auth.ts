/**
 * GitHub OAuth Authentication Service
 * Implements PKCE (Proof Key for Code Exchange) for secure frontend-only OAuth
 */

import type { GitHubAuthConfig, GitHubAuthState, PKCEParams } from '../../types/github';

export class GitHubAuthService {
  private config: GitHubAuthConfig;
  private readonly STORAGE_KEY = 'github_auth_state';

  constructor(config: GitHubAuthConfig) {
    this.config = config;
  }

  /**
   * Generate PKCE parameters for secure OAuth flow
   */
  private async generatePKCE(): Promise<PKCEParams> {
    // Generate code verifier (43-128 characters)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = this.base64URLEncode(array);

    // Generate code challenge (SHA256 hash of verifier)
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = this.base64URLEncode(new Uint8Array(digest));

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }

  /**
   * Generate cryptographically secure state parameter
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Base64URL encoding (RFC 4648 Section 5)
   */
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Store authentication state securely
   */
  private storeAuthState(state: GitHubAuthState): void {
    try {
      // Use sessionStorage for security (cleared on tab close)
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to store auth state:', error);
      throw new Error('Unable to store authentication state');
    }
  }

  /**
   * Retrieve and validate authentication state
   */
  private getAuthState(): GitHubAuthState | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const state = JSON.parse(stored) as GitHubAuthState;

      // Validate state structure
      if (!state.state || !state.codeVerifier || !state.timestamp) {
        return null;
      }

      // Check if state is expired (5 minutes max)
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (now - state.timestamp > maxAge) {
        this.clearAuthState();
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to retrieve auth state:', error);
      return null;
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  }

  /**
   * Build authorization URL with PKCE parameters
   */
  async buildAuthorizationURL(scopes: string[] = ['user:email', 'public_repo']): Promise<string> {
    const pkce = await this.generatePKCE();
    const state = this.generateState();

    // Store state for validation
    const authState: GitHubAuthState = {
      state,
      codeVerifier: pkce.codeVerifier,
      timestamp: Date.now(),
      scopes,
    };
    this.storeAuthState(authState);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
      state,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod,
      response_type: 'code',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(callbackURL: string): Promise<string> {
    const url = new URL(callbackURL);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state parameter');
    }

    // Validate state parameter
    const storedState = this.getAuthState();
    if (!storedState || storedState.state !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          code,
          code_verifier: storedState.codeVerifier,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(`Token exchange error: ${tokenData.error_description || tokenData.error}`);
      }

      if (!tokenData.access_token) {
        throw new Error('No access token received');
      }

      // Clear auth state after successful exchange
      this.clearAuthState();

      return tokenData.access_token;
    } catch (error) {
      this.clearAuthState();
      throw error;
    }
  }

  /**
   * Initiate OAuth flow
   */
  async initiateAuth(scopes?: string[]): Promise<void> {
    const authURL = await this.buildAuthorizationURL(scopes);
    window.location.href = authURL;
  }

  /**
   * Check if we're currently in an OAuth callback
   */
  isCallback(): boolean {
    const url = new URL(window.location.href);
    return url.searchParams.has('code') && url.searchParams.has('state');
  }

  /**
   * Validate redirect URI against configuration
   */
  validateRedirectURI(uri: string): boolean {
    try {
      const url = new URL(uri);
      const configUrl = new URL(this.config.redirectUri);

      return url.origin === configUrl.origin && url.pathname === configUrl.pathname;
    } catch {
      return false;
    }
  }
}

export default GitHubAuthService;

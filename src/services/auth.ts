import { GITHUB_CONFIG, GITHUB_OAUTH_URLS } from '../config/github';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../utils/crypto';
import { User } from '../types/auth';

/**
 * Secure token storage utility
 * Uses sessionStorage for security (cleared on tab close)
 */
export class TokenStorage {
  private static readonly TOKEN_KEY = 'github_token';
  private static readonly USER_KEY = 'github_user';

  static setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static setUser(user: User): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userData = sessionStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static clear(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    // Also clear any OAuth state
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_code_verifier');
  }
}

/**
 * GitHub OAuth service with PKCE implementation
 */
export class GitHubAuthService {
  /**
   * Initiates the OAuth flow by redirecting to GitHub
   */
  static async initiateOAuth(): Promise<void> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store PKCE parameters securely
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: GITHUB_CONFIG.clientId,
      redirect_uri: GITHUB_CONFIG.redirectUri,
      scope: GITHUB_CONFIG.scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      allow_signup: 'true'
    });

    const authUrl = `${GITHUB_OAUTH_URLS.authorize}?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Handles the OAuth callback and exchanges code for token
   */
  static async handleCallback(code: string, state: string): Promise<{ token: string; user: User }> {
    // Verify state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
    if (!codeVerifier) {
      throw new Error('Missing code verifier. OAuth flow may have been tampered with.');
    }

    // Exchange code for token
    const tokenResponse = await fetch(GITHUB_OAUTH_URLS.token, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GITHUB_CONFIG.clientId,
        code: code,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`);
    }

    const token = tokenData.access_token;
    
    // Get user information
    const user = await this.fetchUser(token);
    
    // Clean up OAuth state
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_code_verifier');
    
    return { token, user };
  }

  /**
   * Fetches user information using the access token
   */
  static async fetchUser(token: string): Promise<User> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user information');
    }

    return await response.json();
  }

  /**
   * Revokes the GitHub OAuth token
   */
  static async revokeToken(token: string): Promise<void> {
    try {
      // Note: For frontend-only apps, we can't use the revoke endpoint directly
      // as it requires client secret. Instead, we'll clear local storage
      // and let the user know they can revoke manually on GitHub.
      
      // For a complete revocation, users need to go to GitHub Settings
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      // If token is still valid, we can't revoke it programmatically
      // but we can clear local storage
      if (response.ok) {
        console.warn('Token is still valid. Users should revoke access manually on GitHub.');
      }
    } catch (error) {
      // Token might already be invalid, which is fine
      console.log('Token validation failed (possibly already revoked):', error);
    }
  }

  /**
   * Securely signs out the user
   */
  static async signOut(token?: string): Promise<void> {
    if (token) {
      await this.revokeToken(token);
    }
    
    // Clear all authentication data
    TokenStorage.clear();
    
    // Clear any sensitive data from memory
    // (JavaScript garbage collection will handle this)
    
    // Optional: Clear browser cache for sensitive data
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  /**
   * Validates if the current token is still valid
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
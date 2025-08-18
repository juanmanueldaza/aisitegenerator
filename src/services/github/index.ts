/**
 * GitHub Service - Main interface for GitHub integration
 * Combines authentication and API functionality
 */

import GitHubAuthService from './auth';
import GitHubAPIService from './api';
import type {
  GitHubAuthConfig,
  AuthStatus,
  GitHubUser,
  CreateRepositoryParams,
} from '../../types/github';
import { SCOPE_SETS } from '../../types/github';
import { dlog, mask } from '../../utils/debug';

export class GitHubService {
  private authService: GitHubAuthService;
  private apiService: GitHubAPIService;
  private currentUser: GitHubUser | null = null;
  private currentToken: string | null = null;
  private currentScopes: string[] = [];
  private initialized: boolean = false;
  private initializingPromise: Promise<AuthStatus> | null = null;

  constructor(config: GitHubAuthConfig) {
    this.authService = new GitHubAuthService(config);
    this.apiService = new GitHubAPIService();
  }

  /**
   * Initialize service and handle OAuth callback if present
   */
  async initialize(): Promise<AuthStatus> {
    // Avoid redundant initialization when we already have a token and user
    if (this.initialized && this.currentToken && this.currentUser) {
      return this.getAuthStatus();
    }
    // Deduplicate concurrent calls
    if (this.initializingPromise) {
      return this.initializingPromise;
    }

    this.initializingPromise = (async () => {
      // Check if we're in an OAuth callback
      if (this.authService.isCallback()) {
        dlog('OAuth callback detected');
        const token = await this.authService.handleCallback(window.location.href);
        dlog('OAuth token obtained', { token: mask(token) });
        await this.setToken(token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        this.initialized = true;
        return this.getAuthStatus();
      }

      // Check for existing token
      const existingToken = this.getStoredToken();
      if (existingToken) {
        try {
          dlog('existing token found', { token: mask(existingToken) });
          await this.setToken(existingToken);
          this.initialized = true;
          return this.getAuthStatus();
        } catch {
          // Token might be invalid, clear it
          dlog('existing token invalid, clearing');
          this.clearToken();
        }
      }

      this.initialized = true;
      return this.getAuthStatus();
    })();

    try {
      return await this.initializingPromise;
    } finally {
      this.initializingPromise = null;
    }
  }

  /**
   * Start OAuth authentication flow
   */
  async login(scopes: string[] = SCOPE_SETS.basic): Promise<void> {
    await this.authService.initiateAuth(scopes);
  }

  /**
   * Start Device Authorization Flow and return instructions + poll handle.
   */
  async startDeviceAuth(scopes: string[] = SCOPE_SETS.basic): Promise<{
    user_code: string;
    verification_uri: string;
    expires_in: number;
    poll: () => Promise<void>;
  }> {
    const session = await this.authService.startDeviceFlow(scopes);
    return {
      user_code: session.user_code,
      verification_uri: session.verification_uri,
      expires_in: session.expires_in,
      poll: async () => {
        const token = await session.poll();
        await this.setToken(token);
      },
    };
  }

  /**
   * Logout and clear all authentication data
   */
  logout(): void {
    this.clearToken();
    this.currentUser = null;
    this.currentToken = null;
  }

  /**
   * Set authentication token
   */
  private async setToken(token: string): Promise<void> {
    this.currentToken = token;
    this.apiService.setToken(token);

    // Store token securely
    this.storeToken(token);

    // Fetch user information
    try {
      dlog('fetch current user');
      this.currentUser = await this.apiService.getUser();
      // Also fetch token scopes
      try {
        this.currentScopes = await this.apiService.getTokenScopes();
      } catch {
        this.currentScopes = [];
      }
    } catch {
      // If we can't get user info, the token is likely invalid
      dlog('fetch user failed, clearing token');
      this.clearToken();
      throw new Error('Invalid authentication token');
    }
  }

  /**
   * Store token securely
   */
  private storeToken(token: string): void {
    try {
      // Use sessionStorage for security (cleared on tab close)
      // In production, consider more secure storage options
      sessionStorage.setItem('github_token', token);
      dlog('token stored in sessionStorage');
    } catch (error) {
      console.warn('Failed to store token:', error);
    }
  }

  /**
   * Get stored token
   */
  private getStoredToken(): string | null {
    try {
      const t = sessionStorage.getItem('github_token');
      dlog('getStoredToken', { present: !!t });
      return t;
    } catch (error) {
      console.warn('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Clear stored token
   */
  private clearToken(): void {
    try {
      sessionStorage.removeItem('github_token');
      this.apiService.clearToken();
      dlog('token cleared');
    } catch (error) {
      console.warn('Failed to clear token:', error);
    }
  }

  /**
   * Get current authentication status
   */
  getAuthStatus(): AuthStatus {
    return {
      isAuthenticated: !!this.currentToken && !!this.currentUser,
      user: this.currentUser,
      token: this.currentToken,
      scopes: this.currentScopes,
    };
  }

  /**
   * Get current user
   */
  getCurrentUser(): GitHubUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentToken && !!this.currentUser;
  }

  /**
   * Get API service instance (for direct API calls)
   */
  getAPI(): GitHubAPIService {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access API');
    }
    return this.apiService;
  }

  /**
   * Test connection and token validity
   */
  async testConnection(): Promise<boolean> {
    if (!this.currentToken) {
      return false;
    }
    return this.apiService.testConnection();
  }

  /**
   * Refresh user information
   */
  async refreshUser(): Promise<GitHubUser> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated');
    }

    this.currentUser = await this.apiService.getUser();
    return this.currentUser;
  }

  /**
   * Get user's repositories
   */
  async getRepositories() {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated');
    }
    return this.apiService.getUserRepositories();
  }

  /**
   * Create a new repository
   */
  async createRepository(params: CreateRepositoryParams) {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated');
    }
    return this.apiService.createRepository(params);
  }

  /**
   * Deploy website to GitHub Pages
   */
  async deployToPages(
    repoName: string,
    files: Array<{ path: string; content: string; message?: string }>
  ) {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated');
    }

    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User information not available');
    }

    // Upload files to repository (create or update, with sha handling)
    await this.apiService.uploadFiles(user.login, repoName, files);

    // Enable GitHub Pages
    try {
      await this.apiService.enablePages(user.login, repoName, {
        source: {
          branch: 'main',
          path: '/',
        },
      });
    } catch (error) {
      // Pages might already be enabled
      console.warn('Pages enablement warning:', error);
    }

    return `https://${user.login}.github.io/${repoName}`;
  }
}

export default GitHubService;
export { GitHubAuthService, GitHubAPIService };

// Lightweight singleton cache by clientId to avoid duplicate instances/log spam
const instanceCache = new Map<string, GitHubService>();
export function getGitHubServiceSingleton(config: GitHubAuthConfig): GitHubService {
  const key = `${config.clientId}|${config.redirectUri}`;
  let inst = instanceCache.get(key);
  if (!inst) {
    inst = new GitHubService(config);
    dlog('create GitHubService', { clientId: mask(config.clientId) });
    instanceCache.set(key, inst);
  }
  return inst;
}

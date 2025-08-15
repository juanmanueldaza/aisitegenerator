import { githubService } from '../src/github-service';
import { oauthService } from '../src/oauth-service';

describe('GitHub Integration', () => {
  describe('GitHubService', () => {
    test('should require initialization before use', () => {
      expect(githubService.isInitialized()).toBe(false);
      
      expect(() => {
        githubService.getAuthenticatedUser();
      }).rejects.toThrow('GitHubService not initialized');
    });

    test('should initialize with token', () => {
      const mockToken = 'test-token';
      githubService.initialize(mockToken);
      
      expect(githubService.isInitialized()).toBe(true);
    });

    test('should throw error for empty token', () => {
      expect(() => {
        githubService.initialize('');
      }).toThrow('OAuth token is required');
    });
  });

  describe('OAuthService', () => {
    test('should start unconfigured', () => {
      expect(oauthService.isConfigured()).toBe(false);
      expect(oauthService.isAuthenticated()).toBe(false);
    });

    test('should configure OAuth settings', () => {
      oauthService.configure({
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:5173',
        scopes: ['repo', 'user'],
      });
      
      expect(oauthService.isConfigured()).toBe(true);
    });

    test('should generate authorization URL', () => {
      oauthService.configure({
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:5173',
        scopes: ['repo', 'user'],
      });
      
      const authUrl = oauthService.getAuthorizationUrl();
      expect(authUrl).toContain('https://github.com/login/oauth/authorize');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('scope=repo%20user');
    });

    test('should manage authentication state', () => {
      const testToken = 'test-auth-token';
      const testUser = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.jpg',
      };
      
      oauthService.setToken(testToken, testUser);
      
      expect(oauthService.isAuthenticated()).toBe(true);
      expect(oauthService.getToken()).toBe(testToken);
      expect(oauthService.getUser()).toEqual(testUser);
      
      oauthService.logout();
      
      expect(oauthService.isAuthenticated()).toBe(false);
      expect(oauthService.getToken()).toBeNull();
      expect(oauthService.getUser()).toBeNull();
    });
  });
});
import { useState, useEffect } from 'react';
import { GitHubUser, AuthState } from '@/types';
import GitHubService from '@/services/GitHubService';

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const githubService = new GitHubService();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('github_token');
      if (!token) {
        setLoading(false);
        return;
      }

      githubService.setToken(token);
      const user = await githubService.getCurrentUser();
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
      });
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('github_token');
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would go through your backend
      // For demo purposes, we'll simulate token exchange
      const mockToken = 'mock-github-token';
      
      githubService.setToken(mockToken);
      const user = await githubService.getCurrentUser();
      
      localStorage.setItem('github_token', mockToken);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token: mockToken,
      });
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  const getAuthUrl = (clientId: string) => {
    const redirectUri = `${window.location.origin}/callback`;
    return githubService.getAuthUrl(clientId, redirectUri);
  };

  return {
    ...authState,
    loading,
    error,
    login,
    logout,
    getAuthUrl,
    githubService: authState.token ? githubService : null,
  };
};

export default useAuth;
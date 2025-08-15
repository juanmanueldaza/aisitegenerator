import { GitHubAuthConfig } from '../types/auth';

// GitHub OAuth configuration
export const GITHUB_CONFIG: GitHubAuthConfig = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-github-client-id',
  redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scopes: [
    'repo',      // Create and manage repositories
    'workflow',  // GitHub Actions access for Pages
    'user:email' // User email for GitHub Pages setup
  ]
};

// GitHub OAuth URLs
export const GITHUB_OAUTH_URLS = {
  authorize: 'https://github.com/login/oauth/authorize',
  token: 'https://github.com/login/oauth/access_token',
  revoke: 'https://api.github.com/applications/{client_id}/token'
} as const;
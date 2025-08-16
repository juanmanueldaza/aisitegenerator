/**
 * GitHub API and OAuth related types
 */

// GitHub OAuth Configuration
export interface GitHubAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes?: string[];
}

// PKCE Parameters for OAuth security
export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

// OAuth state stored during authentication flow
export interface GitHubAuthState {
  state: string;
  codeVerifier: string;
  timestamp: number;
  scopes: string[];
}

// GitHub User Information
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// GitHub Repository
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
  } | null;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

// Repository creation parameters
export interface CreateRepositoryParams {
  name: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  allow_squash_merge?: boolean;
  allow_merge_commit?: boolean;
  allow_rebase_merge?: boolean;
  delete_branch_on_merge?: boolean;
}

// File content for repository operations
export interface GitHubFileContent {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
  message?: string;
  branch?: string;
}

// GitHub Pages configuration
export interface GitHubPagesConfig {
  source: {
    branch: string;
    path?: '/' | '/docs';
  };
  cname?: string;
}

// GitHub API Error
export interface GitHubAPIError {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// Authentication status
export interface AuthStatus {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  scopes: string[];
  expiresAt?: number;
}

// OAuth scopes with descriptions
export const GITHUB_SCOPES = {
  user: 'Access user profile information',
  'user:email': 'Access user email addresses',
  public_repo: 'Access public repositories',
  repo: 'Full access to repositories',
  'repo:status': 'Access commit status',
  repo_deployment: 'Access deployment status',
  'read:repo_hook': 'Read repository hooks',
  'write:repo_hook': 'Write repository hooks',
  'admin:repo_hook': 'Admin repository hooks',
  'read:org': 'Read organization membership',
  'write:org': 'Write organization membership',
  'admin:org': 'Admin organization access',
  'read:public_key': 'Read public keys',
  'write:public_key': 'Write public keys',
  'admin:public_key': 'Admin public keys',
  gist: 'Create gists',
  notifications: 'Access notifications',
  'read:discussion': 'Read discussions',
  'write:discussion': 'Write discussions',
} as const;

export type GitHubScope = keyof typeof GITHUB_SCOPES;

// Recommended scope sets for different use cases
export const SCOPE_SETS = {
  minimal: ['user:email'] as GitHubScope[],
  basic: ['user:email', 'public_repo'] as GitHubScope[],
  full: ['user:email', 'repo'] as GitHubScope[],
  organization: ['user:email', 'public_repo', 'read:org'] as GitHubScope[],
} as const;

export type ScopeSet = keyof typeof SCOPE_SETS;

/**
 * GitHub API and OAuth related types following SOLID principles
 * Comprehensive type definitions for GitHub integration
 */

// GitHub OAuth Configuration following Single Responsibility
export interface GitHubAuthConfig {
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly redirectUri: string;
  readonly scopes?: readonly string[];
  readonly state?: string;
}

// PKCE Parameters for OAuth security following Single Responsibility
export interface PKCEParams {
  readonly codeVerifier: string;
  readonly codeChallenge: string;
  readonly codeChallengeMethod: 'S256';
}

// OAuth state stored during authentication flow
export interface GitHubAuthState {
  readonly state: string;
  readonly codeVerifier: string;
  readonly timestamp: number;
  readonly scopes: readonly string[];
  readonly redirectUri: string;
}

// GitHub User Information following Single Responsibility
export interface GitHubUser {
  readonly id: number;
  readonly login: string;
  readonly name: string | null;
  readonly email: string | null;
  readonly avatar_url: string;
  readonly html_url: string;
  readonly public_repos: number;
  readonly followers: number;
  readonly following: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly bio?: string;
  readonly location?: string;
  readonly company?: string;
}

// GitHub Repository following Single Responsibility
export interface GitHubRepository {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly description: string | null;
  readonly private: boolean;
  readonly html_url: string;
  readonly clone_url: string;
  readonly ssh_url: string;
  readonly homepage: string | null;
  readonly size: number;
  readonly stargazers_count: number;
  readonly watchers_count: number;
  readonly language: string | null;
  readonly has_issues: boolean;
  readonly has_projects: boolean;
  readonly has_wiki: boolean;
  readonly has_pages: boolean;
  readonly has_downloads: boolean;
  readonly archived: boolean;
  readonly disabled: boolean;
  readonly open_issues_count: number;
  readonly license: GitHubLicense | null;
  readonly forks: number;
  readonly open_issues: number;
  readonly watchers: number;
  readonly default_branch: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly pushed_at: string;
}

// GitHub License information
export interface GitHubLicense {
  readonly key: string;
  readonly name: string;
  readonly spdx_id: string;
  readonly url: string;
  readonly node_id: string;
}

// Repository creation parameters following Interface Segregation
export interface CreateRepositoryParams {
  readonly name: string;
  readonly description?: string;
  readonly homepage?: string;
  readonly private?: boolean;
  readonly has_issues?: boolean;
  readonly has_projects?: boolean;
  readonly has_wiki?: boolean;
  readonly auto_init?: boolean;
  readonly gitignore_template?: string;
  readonly license_template?: string;
  readonly allow_squash_merge?: boolean;
  readonly allow_merge_commit?: boolean;
  readonly allow_rebase_merge?: boolean;
  readonly delete_branch_on_merge?: boolean;
}

// File content for repository operations following Single Responsibility
export interface GitHubFileContent {
  readonly path: string;
  readonly content: string;
  readonly encoding?: 'utf-8' | 'base64';
  readonly message?: string;
  readonly branch?: string;
  readonly sha?: string; // Required for updates
}

// GitHub Pages configuration following Single Responsibility
export interface GitHubPagesConfig {
  readonly source: {
    readonly branch: string;
    readonly path?: '/' | '/docs';
  };
  readonly cname?: string;
  readonly public?: boolean;
}

// GitHub API Error following Interface Segregation
export interface GitHubAPIError {
  readonly message: string;
  readonly documentation_url?: string;
  readonly errors?: readonly GitHubAPIErrorDetail[];
}

// GitHub API Error Detail
export interface GitHubAPIErrorDetail {
  readonly resource: string;
  readonly field: string;
  readonly code: string;
  readonly message?: string;
}

// Authentication status following Single Responsibility
export interface AuthStatus {
  readonly isAuthenticated: boolean;
  readonly user: GitHubUser | null;
  readonly token: string | null;
  readonly scopes: readonly string[];
  readonly expiresAt?: number;
  readonly lastValidated?: Date;
}

// Device Flow types following Single Responsibility
export interface DeviceFlowStart {
  readonly device_code: string;
  readonly user_code: string;
  readonly verification_uri: string;
  readonly expires_in: number;
  readonly interval: number;
}

export interface DeviceFlowBeginInfo {
  readonly user_code: string;
  readonly verification_uri: string;
  readonly expires_in: number;
  readonly interval: number;
}

// GitHub API Response wrapper
export interface GitHubAPIResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly rateLimit?: GitHubRateLimit;
}

// GitHub Rate Limit information
export interface GitHubRateLimit {
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number; // Unix timestamp
  readonly used: number;
  readonly resource: string;
}

// GitHub Webhook types
export interface GitHubWebhook {
  readonly id: number;
  readonly url: string;
  readonly test_url: string;
  readonly ping_url: string;
  readonly deliveries_url: string;
  readonly name: string;
  readonly events: readonly string[];
  readonly active: boolean;
  readonly config: Record<string, unknown>;
  readonly updated_at: string;
  readonly created_at: string;
}

// GitHub Issue types
export interface GitHubIssue {
  readonly id: number;
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly state: 'open' | 'closed';
  readonly locked: boolean;
  readonly assignee: GitHubUser | null;
  readonly assignees: readonly GitHubUser[];
  readonly labels: readonly GitHubLabel[];
  readonly comments: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly closed_at: string | null;
  readonly user: GitHubUser;
}

// GitHub Label
export interface GitHubLabel {
  readonly id: number;
  readonly name: string;
  readonly color: string;
  readonly description: string | null;
  readonly default: boolean;
}

// GitHub Pull Request
export interface GitHubPullRequest {
  readonly id: number;
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly state: 'open' | 'closed';
  readonly locked: boolean;
  readonly head: GitHubBranch;
  readonly base: GitHubBranch;
  readonly user: GitHubUser;
  readonly assignee: GitHubUser | null;
  readonly assignees: readonly GitHubUser[];
  readonly requested_reviewers: readonly GitHubUser[];
  readonly labels: readonly GitHubLabel[];
  readonly merged: boolean;
  readonly mergeable: boolean | null;
  readonly mergeable_state: string;
  readonly merged_by: GitHubUser | null;
  readonly comments: number;
  readonly review_comments: number;
  readonly commits: number;
  readonly additions: number;
  readonly deletions: number;
  readonly changed_files: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly closed_at: string | null;
  readonly merged_at: string | null;
}

// GitHub Branch reference
export interface GitHubBranch {
  readonly label: string;
  readonly ref: string;
  readonly sha: string;
  readonly user: GitHubUser;
  readonly repo: GitHubRepository;
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

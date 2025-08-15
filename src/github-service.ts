import { Octokit } from '@octokit/rest';

interface GitHubConfig {
  userAgent: string;
  auth?: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string | null;
  updated_at: string | null;
  permissions?: {
    admin: boolean;
    maintain?: boolean;
    push: boolean;
    pull: boolean;
  };
}

interface CreateRepositoryOptions {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

interface CreateFileOptions {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  branch?: string;
}

interface GitHubError extends Error {
  status?: number;
  response?: {
    data: {
      message: string;
      documentation_url?: string;
    };
  };
}

class GitHubService {
  private octokit: Octokit | null = null;
  private config: GitHubConfig;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: number = 0;

  constructor() {
    this.config = {
      userAgent: 'AI Site Generator v1.0.0',
    };
  }

  /**
   * Initialize Octokit with OAuth token
   */
  initialize(token: string): void {
    if (!token) {
      throw new Error('OAuth token is required');
    }

    this.config.auth = token;
    this.octokit = new Octokit({
      auth: token,
      userAgent: this.config.userAgent,
    });
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.octokit !== null;
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<{ remaining: number; reset: Date }> {
    this.ensureInitialized();
    
    try {
      const response = await this.octokit!.rest.rateLimit.get();
      const { remaining, reset } = response.data.rate;
      
      this.rateLimitRemaining = remaining;
      this.rateLimitReset = reset;
      
      return {
        remaining,
        reset: new Date(reset * 1000),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List user repositories
   */
  async listRepositories(options: { type?: 'all' | 'owner' | 'member'; sort?: 'created' | 'updated' | 'pushed' | 'full_name'; per_page?: number; page?: number } = {}): Promise<Repository[]> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      const response = await this.octokit!.rest.repos.listForAuthenticatedUser({
        type: options.type || 'owner',
        sort: options.sort || 'updated',
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      this.updateRateLimitFromResponse(response);
      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        fork: repo.fork,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        permissions: repo.permissions ? {
          admin: repo.permissions.admin,
          maintain: repo.permissions.maintain || false,
          push: repo.permissions.push,
          pull: repo.permissions.pull,
        } : undefined,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(options: CreateRepositoryOptions): Promise<Repository> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      const response = await this.octokit!.rest.repos.createForAuthenticatedUser({
        name: options.name,
        description: options.description,
        private: options.private || false,
        auto_init: options.auto_init || true,
      });

      this.updateRateLimitFromResponse(response);
      const repo = response.data;
      return {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        description: repo.description,
        fork: repo.fork,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        permissions: repo.permissions ? {
          admin: repo.permissions.admin,
          maintain: repo.permissions.maintain || false,
          push: repo.permissions.push,
          pull: repo.permissions.pull,
        } : undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      const response = await this.octokit!.rest.repos.get({
        owner,
        repo,
      });

      this.updateRateLimitFromResponse(response);
      const repoData = response.data;
      return {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        private: repoData.private,
        html_url: repoData.html_url,
        description: repoData.description,
        fork: repoData.fork,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        permissions: repoData.permissions ? {
          admin: repoData.permissions.admin,
          maintain: repoData.permissions.maintain || false,
          push: repoData.permissions.push,
          pull: repoData.permissions.pull,
        } : undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create or update a file in repository
   */
  async createOrUpdateFile(options: CreateFileOptions): Promise<{ commit: { sha: string; html_url: string } }> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      // Check if file exists first
      let existingFile;
      try {
        const fileResponse = await this.octokit!.rest.repos.getContent({
          owner: options.owner,
          repo: options.repo,
          path: options.path,
          ref: options.branch,
        });
        existingFile = fileResponse.data;
      } catch (error: any) {
        // File doesn't exist, which is fine for creation
        if (error.status !== 404) {
          throw error;
        }
      }

      // Use btoa for base64 encoding in browser environment
      const content = btoa(options.content);
      
      const requestOptions: any = {
        owner: options.owner,
        repo: options.repo,
        path: options.path,
        message: options.message,
        content,
      };

      if (options.branch) {
        requestOptions.branch = options.branch;
      }

      if (existingFile && 'sha' in existingFile) {
        requestOptions.sha = existingFile.sha;
      }

      const response = await this.octokit!.rest.repos.createOrUpdateFileContents(requestOptions);
      
      this.updateRateLimitFromResponse(response);
      return {
        commit: {
          sha: response.data.commit.sha || '',
          html_url: response.data.commit.html_url || '',
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Enable GitHub Pages for a repository
   */
  async enableGitHubPages(owner: string, repo: string, source: { branch: string; path?: '/' | '/docs' } = { branch: 'main' }): Promise<{ html_url: string }> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      const response = await this.octokit!.rest.repos.createPagesSite({
        owner,
        repo,
        source: {
          branch: source.branch,
          path: source.path || '/',
        },
      });

      this.updateRateLimitFromResponse(response);
      return {
        html_url: response.data.html_url || '',
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check repository permissions for the authenticated user
   */
  async checkRepositoryPermissions(owner: string, repo: string): Promise<{ admin: boolean; maintain: boolean; push: boolean; pull: boolean }> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      const response = await this.octokit!.rest.repos.get({
        owner,
        repo,
      });

      this.updateRateLimitFromResponse(response);
      
      const permissions = response.data.permissions || {
        admin: false,
        maintain: false,
        push: false,
        pull: true,
      };

      return {
        admin: permissions.admin,
        maintain: permissions.maintain || false,
        push: permissions.push,
        pull: permissions.pull,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser(): Promise<{ login: string; id: number; avatar_url: string; name: string | null }> {
    this.ensureInitialized();
    await this.checkRateLimit();

    try {
      const response = await this.octokit!.rest.users.getAuthenticated();
      this.updateRateLimitFromResponse(response);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private ensureInitialized(): void {
    if (!this.octokit) {
      throw new Error('GitHubService not initialized. Call initialize() with a valid OAuth token first.');
    }
  }

  private async checkRateLimit(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    
    if (this.rateLimitRemaining <= 10 && now < this.rateLimitReset) {
      const waitTime = (this.rateLimitReset - now) * 1000;
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before making more requests.`);
    }
  }

  private updateRateLimitFromResponse(response: any): void {
    const headers = response.headers;
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining'], 10);
    }
    if (headers['x-ratelimit-reset']) {
      this.rateLimitReset = parseInt(headers['x-ratelimit-reset'], 10);
    }
  }

  private handleError(error: any): GitHubError {
    const gitHubError = error as GitHubError;
    
    if (gitHubError.response?.data?.message) {
      const enhancedError = new Error(gitHubError.response.data.message) as GitHubError;
      enhancedError.status = gitHubError.status;
      enhancedError.response = gitHubError.response;
      return enhancedError;
    }
    
    if (gitHubError.status === 401) {
      const authError = new Error('Authentication failed. Please check your OAuth token.') as GitHubError;
      authError.status = 401;
      return authError;
    }
    
    if (gitHubError.status === 403) {
      const forbiddenError = new Error('Access forbidden. You may not have the required permissions or have exceeded the rate limit.') as GitHubError;
      forbiddenError.status = 403;
      return forbiddenError;
    }
    
    if (gitHubError.status === 404) {
      const notFoundError = new Error('Resource not found. The repository or file may not exist, or you may not have access to it.') as GitHubError;
      notFoundError.status = 404;
      return notFoundError;
    }
    
    return error;
  }
}

// Create a singleton instance
export const githubService = new GitHubService();
export type { Repository, CreateRepositoryOptions, CreateFileOptions, GitHubError };
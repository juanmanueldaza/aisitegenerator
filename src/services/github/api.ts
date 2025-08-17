/**
 * GitHub API Service
 * Handles all GitHub API interactions with proper error handling and rate limiting
 */

import type {
  GitHubUser,
  GitHubRepository,
  CreateRepositoryParams,
  GitHubFileContent,
  GitHubPagesConfig,
} from '../../types/github';
import { normalizeGitHubError, sleep } from '@/utils/githubErrors';

export class GitHubAPIService {
  private baseURL = 'https://api.github.com';
  private token: string | null = null;

  constructor(token?: string) {
    if (token) {
      this.setToken(token);
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Make authenticated request to GitHub API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Site-Generator/1.0',
      ...options.headers,
    };

    // Simple retry with backoff for rate limit and 5xx
    const maxAttempts = 2;
    let attempt = 0;
    while (true) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          // Normalize and maybe retry
          const text = await response.text().catch(() => '');
          const norm = normalizeGitHubError(
            new Error(text || response.statusText),
            response.status,
            response.headers
          );
          if ((norm.code === 'rate_limited' || norm.code === 'server') && attempt < maxAttempts) {
            attempt++;
            const delay = norm.retryAfterMs ?? 1000 * attempt;
            await sleep(delay);
            continue;
          }
          throw new Error(norm.message);
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204) {
          return {} as T;
        }

        return (await response.json().catch(() => ({}))) as T;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Network error occurred';
        // Non-HTTP errors won't have status, try retry a bit
        if (attempt < maxAttempts) {
          attempt++;
          await sleep(500 * attempt);
          continue;
        }
        throw new Error(msg);
      }
    }
  }

  /**
   * Get authenticated user information
   */
  async getUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>('/user');
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(
    options: {
      type?: 'all' | 'owner' | 'member';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<GitHubRepository[]>(`/user/repos${query}`);
  }

  /**
   * Create a new repository
   */
  async createRepository(params: CreateRepositoryParams): Promise<GitHubRepository> {
    return this.request<GitHubRepository>('/user/repos', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * Delete a repository
   */
  async deleteRepository(owner: string, repo: string): Promise<void> {
    await this.request(`/repos/${owner}/${repo}`, {
      method: 'DELETE',
    });
  }

  /**
   * Create or update a file in repository
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<{ content: { sha: string; path: string } }> {
    const body: { message: string; content: string; sha?: string } = {
      message,
      content: btoa(unescape(encodeURIComponent(content))), // Base64 encode UTF-8
    };

    if (sha) {
      body.sha = sha;
    }

    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get file content from repository
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<{ content: string; sha: string; encoding: string }> {
    return this.request<{ content: string; sha: string; encoding: string }>(
      `/repos/${owner}/${repo}/contents/${path}`
    );
  }

  /**
   * Upload multiple files to repository
   */
  async uploadFiles(owner: string, repo: string, files: GitHubFileContent[]): Promise<void> {
    for (const file of files) {
      let existingSha: string | undefined;
      try {
        const existing = await this.getFileContent(owner, repo, file.path);
        if (existing && existing.sha) {
          existingSha = existing.sha;
        }
      } catch (err) {
        // If file not found, proceed without sha; any other error should rethrow
        const message = err instanceof Error ? err.message : String(err);
        if (!/not found/i.test(message)) {
          throw err;
        }
      }

      await this.createOrUpdateFile(
        owner,
        repo,
        file.path,
        file.content,
        file.message || (existingSha ? `Update ${file.path}` : `Add ${file.path}`),
        existingSha
      );
    }
  }

  /**
   * Enable GitHub Pages for repository
   */
  async enablePages(
    owner: string,
    repo: string,
    config: GitHubPagesConfig
  ): Promise<{ url: string; status: string }> {
    return this.request(`/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Get GitHub Pages information
   */
  async getPages(owner: string, repo: string): Promise<{ url: string; status: string }> {
    return this.request(`/repos/${owner}/${repo}/pages`);
  }

  /**
   * Update GitHub Pages configuration
   */
  async updatePages(
    owner: string,
    repo: string,
    config: Partial<GitHubPagesConfig>
  ): Promise<{ url: string; status: string }> {
    return this.request(`/repos/${owner}/${repo}/pages`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  /**
   * Check if repository has GitHub Pages enabled
   */
  async hasPagesEnabled(owner: string, repo: string): Promise<boolean> {
    try {
      await this.getPages(owner, repo);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimit(): Promise<{ rate: { limit: number; remaining: number; reset: number } }> {
    return this.request('/rate_limit');
  }

  /**
   * Test API connection and token validity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user's GitHub scopes
   */
  async getTokenScopes(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/user`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const scopes = response.headers.get('X-OAuth-Scopes');
    return scopes ? scopes.split(', ').map((s) => s.trim()) : [];
  }
}

export default GitHubAPIService;

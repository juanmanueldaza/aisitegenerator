import { Octokit } from '@octokit/rest';
import { GitHubUser, GitHubRepository } from '@/types';

class GitHubService {
  private octokit: Octokit | null = null;

  constructor(token?: string) {
    if (token) {
      this.setToken(token);
    }
  }

  setToken(token: string): void {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getCurrentUser(): Promise<GitHubUser> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    const response = await this.octokit.rest.users.getAuthenticated();
    return response.data as GitHubUser;
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    const response = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return response.data as GitHubRepository[];
  }

  async createRepository(
    name: string,
    description: string,
    isPrivate: boolean = false
  ): Promise<GitHubRepository> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    const response = await this.octokit.rest.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      has_pages: true,
      auto_init: true,
    });

    return response.data as GitHubRepository;
  }

  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string
  ): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    const encodedContent = Buffer.from(content).toString('base64');

    const response = await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
    });

    return response.data;
  }

  async enablePages(owner: string, repo: string): Promise<void> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    await this.octokit.rest.repos.createPagesSite({
      owner,
      repo,
      source: {
        branch: 'main',
        path: '/',
      },
    });
  }

  getAuthUrl(clientId: string, redirectUri: string): string {
    const scopes = 'repo,user';
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}`;
  }
}

export default GitHubService;
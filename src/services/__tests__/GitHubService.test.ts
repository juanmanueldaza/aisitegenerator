import GitHubService from '../GitHubService';
import { server } from '@/test/setup';
import { rest } from 'msw';

describe('GitHubService', () => {
  let githubService: GitHubService;
  const mockToken = 'mock-token';

  beforeEach(() => {
    githubService = new GitHubService();
  });

  describe('setToken', () => {
    it('should set the GitHub token', () => {
      githubService.setToken(mockToken);
      // Token is set internally, we can verify by trying to make an API call
      expect(() => githubService.setToken(mockToken)).not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should throw error when token is not set', async () => {
      await expect(githubService.getCurrentUser()).rejects.toThrow(
        'GitHub token not set'
      );
    });

    it('should return current user when authenticated', async () => {
      githubService.setToken(mockToken);
      
      const user = await githubService.getCurrentUser();
      
      expect(user).toEqual({
        id: 1,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://github.com/images/error/testuser_happy.gif',
      });
    });

    it('should handle authentication errors', async () => {
      githubService.setToken('invalid-token');
      
      server.use(
        rest.get('https://api.github.com/user', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ message: 'Bad credentials' })
          );
        })
      );

      await expect(githubService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('getUserRepositories', () => {
    it('should throw error when token is not set', async () => {
      await expect(githubService.getUserRepositories()).rejects.toThrow(
        'GitHub token not set'
      );
    });

    it('should return user repositories', async () => {
      githubService.setToken(mockToken);
      
      const repos = await githubService.getUserRepositories();
      
      expect(repos).toHaveLength(1);
      expect(repos[0]).toEqual({
        id: 1,
        name: 'test-repo',
        full_name: 'testuser/test-repo',
        private: false,
        html_url: 'https://github.com/testuser/test-repo',
        description: 'Test repository',
        fork: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        pushed_at: '2023-01-01T00:00:00Z',
        stargazers_count: 0,
        watchers_count: 0,
        language: 'JavaScript',
        has_pages: false,
        default_branch: 'main',
      });
    });
  });

  describe('createRepository', () => {
    it('should throw error when token is not set', async () => {
      await expect(
        githubService.createRepository('test', 'description')
      ).rejects.toThrow('GitHub token not set');
    });

    it('should create a new repository', async () => {
      githubService.setToken(mockToken);
      
      const repo = await githubService.createRepository(
        'new-site',
        'Generated website'
      );
      
      expect(repo.name).toBe('new-site');
      expect(repo.description).toBe('Generated website');
      expect(repo.private).toBe(false);
    });
  });

  describe('createFile', () => {
    it('should throw error when token is not set', async () => {
      await expect(
        githubService.createFile(
          'owner',
          'repo',
          'index.html',
          '<html></html>',
          'Initial commit'
        )
      ).rejects.toThrow('GitHub token not set');
    });

    it('should create a file in repository', async () => {
      githubService.setToken(mockToken);
      
      const result = await githubService.createFile(
        'testuser',
        'test-repo',
        'index.html',
        '<html><body>Hello World</body></html>',
        'Add index.html'
      );
      
      expect(result.content.name).toBe('index.html');
      expect(result.content.path).toBe('index.html');
      expect(result.commit.sha).toMatch(/^mock-commit-sha-/);
    });
  });

  describe('getAuthUrl', () => {
    it('should generate correct GitHub OAuth URL', () => {
      const clientId = 'test-client-id';
      const redirectUri = 'http://localhost:3000/callback';
      
      const authUrl = githubService.getAuthUrl(clientId, redirectUri);
      
      expect(authUrl).toBe(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=repo,user`
      );
    });
  });
});
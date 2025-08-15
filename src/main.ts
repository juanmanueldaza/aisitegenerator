import './style.css'
import { githubService } from './github-service'
import { oauthService } from './oauth-service'

// Initialize OAuth configuration
// Note: In a real application, these values should come from environment variables
oauthService.configure({
  clientId: 'your-github-app-client-id', // This would be replaced with actual client ID
  redirectUri: window.location.origin,
  scopes: ['repo', 'user', 'pages', 'admin:repo_hook'],
});

class GitHubDemo {
  private repositoriesContainer: HTMLElement;
  private statusContainer: HTMLElement;
  private userContainer: HTMLElement;

  constructor() {
    this.initializeUI();
    this.repositoriesContainer = document.getElementById('repositories')!;
    this.statusContainer = document.getElementById('status')!;
    this.userContainer = document.getElementById('user-info')!;
    
    // Handle OAuth callback if present
    this.handleOAuthCallback();
    
    // Initialize based on current auth state
    this.updateUI();
  }

  private initializeUI(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div>
        <h1>AI Site Generator - GitHub Integration Demo</h1>
        
        <div id="user-info" class="card">
          <!-- User info will be populated here -->
        </div>
        
        <div id="status" class="card">
          <!-- Status messages will appear here -->
        </div>
        
        <div class="card">
          <h2>Repository Operations</h2>
          <div class="button-group">
            <button id="login-btn" type="button">Login with GitHub</button>
            <button id="logout-btn" type="button" style="display: none;">Logout</button>
            <button id="list-repos-btn" type="button" disabled>List Repositories</button>
            <button id="create-repo-btn" type="button" disabled>Create Test Repository</button>
            <button id="rate-limit-btn" type="button" disabled>Check Rate Limit</button>
          </div>
        </div>
        
        <div id="repositories" class="card">
          <h2>Repositories</h2>
          <div id="repo-list">
            <!-- Repository list will be populated here -->
          </div>
        </div>
        
        <div class="card">
          <h2>Test Operations</h2>
          <div class="button-group">
            <button id="test-file-btn" type="button" disabled>Create Test File</button>
            <button id="test-pages-btn" type="button" disabled>Enable Pages</button>
            <button id="test-permissions-btn" type="button" disabled>Check Permissions</button>
          </div>
          <div id="test-results">
            <!-- Test results will appear here -->
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Login/Logout buttons
    document.getElementById('login-btn')!.addEventListener('click', () => {
      this.login();
    });

    document.getElementById('logout-btn')!.addEventListener('click', () => {
      this.logout();
    });

    // Repository operations
    document.getElementById('list-repos-btn')!.addEventListener('click', () => {
      this.listRepositories();
    });

    document.getElementById('create-repo-btn')!.addEventListener('click', () => {
      this.createTestRepository();
    });

    document.getElementById('rate-limit-btn')!.addEventListener('click', () => {
      this.checkRateLimit();
    });

    // Test operations
    document.getElementById('test-file-btn')!.addEventListener('click', () => {
      this.testFileOperations();
    });

    document.getElementById('test-pages-btn')!.addEventListener('click', () => {
      this.testGitHubPages();
    });

    document.getElementById('test-permissions-btn')!.addEventListener('click', () => {
      this.testPermissions();
    });
  }

  private async handleOAuthCallback(): Promise<void> {
    try {
      const callback = oauthService.handleCallback();
      if (callback) {
        this.showStatus('OAuth callback received. In a real application, the authorization code would be exchanged for an access token on the backend.', 'info');
        
        // For demo purposes, we'll simulate token exchange
        // In a real app, you'd send the code to your backend to exchange for a token
        const demoToken = 'demo-token-' + callback.code.substring(0, 8);
        this.showStatus(`Demo: Using simulated token (${demoToken}). Replace with real token exchange.`, 'warning');
        
        // Remove callback parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      this.showStatus(`OAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private updateUI(): void {
    const isAuthenticated = oauthService.isAuthenticated();
    const user = oauthService.getUser();
    
    // Update button states
    document.getElementById('login-btn')!.style.display = isAuthenticated ? 'none' : 'inline-block';
    document.getElementById('logout-btn')!.style.display = isAuthenticated ? 'inline-block' : 'none';
    
    const operationButtons = ['list-repos-btn', 'create-repo-btn', 'rate-limit-btn', 'test-file-btn', 'test-pages-btn', 'test-permissions-btn'];
    operationButtons.forEach(id => {
      (document.getElementById(id) as HTMLButtonElement).disabled = !isAuthenticated;
    });
    
    // Update user info
    if (isAuthenticated && user) {
      this.userContainer.innerHTML = `
        <h3>Authenticated User</h3>
        <div class="user-info">
          <img src="${user.avatar_url}" alt="Avatar" width="50" height="50">
          <div>
            <strong>${user.name || user.login}</strong><br>
            <small>@${user.login}</small>
          </div>
        </div>
      `;
    } else {
      this.userContainer.innerHTML = '<p>Not authenticated. Please login with GitHub to use the API.</p>';
    }
  }

  private login(): void {
    try {
      // For demo purposes, we'll allow manual token input
      const token = prompt('For demo purposes, enter a GitHub personal access token:');
      if (token) {
        githubService.initialize(token);
        
        // Get user info and update state
        githubService.getAuthenticatedUser()
          .then(user => {
            oauthService.setToken(token, user);
            this.updateUI();
            this.showStatus('Successfully authenticated with GitHub!', 'success');
          })
          .catch(error => {
            this.showStatus(`Authentication failed: ${error.message}`, 'error');
          });
      }
    } catch (error) {
      this.showStatus(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private logout(): void {
    oauthService.logout();
    this.updateUI();
    this.repositoriesContainer.querySelector('#repo-list')!.innerHTML = '';
    document.getElementById('test-results')!.innerHTML = '';
    this.showStatus('Logged out successfully.', 'info');
  }

  private async listRepositories(): Promise<void> {
    try {
      this.showStatus('Loading repositories...', 'info');
      const repos = await githubService.listRepositories({ per_page: 10 });
      
      const repoList = this.repositoriesContainer.querySelector('#repo-list')!;
      repoList.innerHTML = repos.map(repo => `
        <div class="repo-item">
          <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
          <p>${repo.description || 'No description'}</p>
          <small>
            ${repo.private ? '🔒 Private' : '🌐 Public'} • 
            Updated: ${repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'Unknown'}
          </small>
        </div>
      `).join('');
      
      this.showStatus(`Loaded ${repos.length} repositories.`, 'success');
    } catch (error) {
      this.showStatus(`Failed to load repositories: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private async createTestRepository(): Promise<void> {
    try {
      const name = `test-repo-${Date.now()}`;
      this.showStatus('Creating test repository...', 'info');
      
      const repo = await githubService.createRepository({
        name,
        description: 'Test repository created by AI Site Generator',
        private: false,
        auto_init: true,
      });
      
      this.showStatus(`Successfully created repository: ${repo.name}`, 'success');
      
      // Refresh repository list
      this.listRepositories();
    } catch (error) {
      this.showStatus(`Failed to create repository: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private async checkRateLimit(): Promise<void> {
    try {
      this.showStatus('Checking rate limit...', 'info');
      const rateLimit = await githubService.getRateLimit();
      
      this.showStatus(
        `Rate limit: ${rateLimit.remaining} requests remaining. Resets at ${rateLimit.reset.toLocaleTimeString()}.`,
        'info'
      );
    } catch (error) {
      this.showStatus(`Failed to check rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private async testFileOperations(): Promise<void> {
    try {
      const user = oauthService.getUser();
      if (!user) return;
      
      // Use the first repository or create a test one
      const repos = await githubService.listRepositories({ per_page: 1 });
      if (repos.length === 0) {
        this.showStatus('No repositories found. Create a repository first.', 'warning');
        return;
      }
      
      const repo = repos[0];
      const [owner, repoName] = repo.full_name.split('/');
      
      this.showStatus('Creating test file...', 'info');
      
      const result = await githubService.createOrUpdateFile({
        owner,
        repo: repoName,
        path: 'test-file.md',
        message: 'Add test file via AI Site Generator',
        content: `# Test File

This file was created by the AI Site Generator GitHub integration.

Created at: ${new Date().toISOString()}
`,
      });
      
      document.getElementById('test-results')!.innerHTML = `
        <h3>File Operation Result</h3>
        <p>✅ Successfully created/updated file</p>
        <p><strong>Commit SHA:</strong> ${result.commit.sha}</p>
        <p><a href="${result.commit.html_url}" target="_blank">View commit</a></p>
      `;
      
      this.showStatus('File operation completed successfully!', 'success');
    } catch (error) {
      this.showStatus(`File operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private async testGitHubPages(): Promise<void> {
    try {
      const user = oauthService.getUser();
      if (!user) return;
      
      const repos = await githubService.listRepositories({ per_page: 5 });
      const publicRepo = repos.find(repo => !repo.private);
      
      if (!publicRepo) {
        this.showStatus('No public repositories found. GitHub Pages requires a public repository.', 'warning');
        return;
      }
      
      const [owner, repoName] = publicRepo.full_name.split('/');
      
      this.showStatus('Enabling GitHub Pages...', 'info');
      
      const result = await githubService.enableGitHubPages(owner, repoName);
      
      document.getElementById('test-results')!.innerHTML = `
        <h3>GitHub Pages Result</h3>
        <p>✅ Successfully enabled GitHub Pages</p>
        <p><strong>Site URL:</strong> <a href="${result.html_url}" target="_blank">${result.html_url}</a></p>
        <p><small>Note: It may take a few minutes for the site to be available.</small></p>
      `;
      
      this.showStatus('GitHub Pages enabled successfully!', 'success');
    } catch (error) {
      this.showStatus(`GitHub Pages operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private async testPermissions(): Promise<void> {
    try {
      const user = oauthService.getUser();
      if (!user) return;
      
      const repos = await githubService.listRepositories({ per_page: 1 });
      if (repos.length === 0) {
        this.showStatus('No repositories found.', 'warning');
        return;
      }
      
      const repo = repos[0];
      const [owner, repoName] = repo.full_name.split('/');
      
      this.showStatus('Checking permissions...', 'info');
      
      const permissions = await githubService.checkRepositoryPermissions(owner, repoName);
      
      document.getElementById('test-results')!.innerHTML = `
        <h3>Repository Permissions</h3>
        <p><strong>Repository:</strong> ${repo.full_name}</p>
        <ul>
          <li>Admin: ${permissions.admin ? '✅' : '❌'}</li>
          <li>Maintain: ${permissions.maintain ? '✅' : '❌'}</li>
          <li>Push: ${permissions.push ? '✅' : '❌'}</li>
          <li>Pull: ${permissions.pull ? '✅' : '❌'}</li>
        </ul>
      `;
      
      this.showStatus('Permission check completed!', 'success');
    } catch (error) {
      this.showStatus(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private showStatus(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    const statusEl = this.statusContainer;
    statusEl.className = `card status-${type}`;
    statusEl.innerHTML = `<p>${message}</p>`;
    
    // Auto-clear success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusEl.innerHTML = '';
        statusEl.className = 'card';
      }, 5000);
    }
  }
}

// Initialize the demo when the page loads
new GitHubDemo();

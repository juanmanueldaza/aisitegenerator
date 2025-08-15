// GitHub OAuth Configuration
const GITHUB_CONFIG = {
    // For development, you'll need to set up a GitHub OAuth App and replace these
    // clientId: 'your-github-oauth-app-client-id',
    // For demo purposes, we'll use device flow authentication
    scopes: ['repo', 'user:email']
};

class GitHubAuth {
    constructor() {
        this.accessToken = localStorage.getItem('github_access_token');
        this.user = null;
        this.octokit = null;
        this.initializeOctokit();
    }

    initializeOctokit() {
        if (this.accessToken) {
            try {
                this.octokit = new window.Octokit.Octokit({
                    auth: this.accessToken
                });
            } catch (error) {
                console.error('Error initializing Octokit:', error);
                this.clearAuth();
            }
        }
    }

    async login() {
        try {
            // For demo purposes, we'll use a simple mock authentication
            // In production, this would be a proper GitHub OAuth flow
            const useDemo = confirm('Use demo mode? Click OK for demo mode, or Cancel to enter a real GitHub token.');
            
            let token, user;
            
            if (useDemo) {
                token = 'demo-token';
                user = {
                    login: 'demo-user',
                    name: 'Demo User',
                    email: 'demo@example.com'
                };
            } else {
                token = prompt('Please enter your GitHub Personal Access Token with repo and user:email scopes:\n\nTo create one, go to:\nGitHub → Settings → Developer settings → Personal access tokens → Generate new token\n\nRequired scopes: repo, user:email');
                
                if (!token) {
                    throw new Error('Access token is required');
                }

                // Test the token by getting user info
                const testOctokit = new window.Octokit.Octokit({
                    auth: token
                });

                const { data: userData } = await testOctokit.rest.users.getAuthenticated();
                user = userData;
            }
            
            this.accessToken = token;
            this.user = user;
            this.octokit = new window.Octokit.Octokit({
                auth: token
            });
            
            localStorage.setItem('github_access_token', token);
            localStorage.setItem('github_user', JSON.stringify(user));

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            this.clearAuth();
            throw new Error('Authentication failed. Please check your access token.');
        }
    }

    async logout() {
        this.clearAuth();
        return { success: true };
    }

    clearAuth() {
        this.accessToken = null;
        this.user = null;
        this.octokit = null;
        localStorage.removeItem('github_access_token');
        localStorage.removeItem('github_user');
    }

    async getCurrentUser() {
        if (!this.octokit) return null;

        try {
            if (!this.user) {
                const { data: user } = await this.octokit.rest.users.getAuthenticated();
                this.user = user;
                localStorage.setItem('github_user', JSON.stringify(user));
            }
            return this.user;
        } catch (error) {
            console.error('Error getting current user:', error);
            this.clearAuth();
            return null;
        }
    }

    isAuthenticated() {
        return !!(this.accessToken && this.octokit);
    }

    getOctokit() {
        return this.octokit;
    }

    async restoreSession() {
        const storedUser = localStorage.getItem('github_user');
        if (this.accessToken && storedUser) {
            try {
                this.user = JSON.parse(storedUser);
                // Verify the token is still valid
                await this.getCurrentUser();
                return true;
            } catch (error) {
                console.error('Error restoring session:', error);
                this.clearAuth();
                return false;
            }
        }
        return false;
    }
}

// Export for use in other modules
window.GitHubAuth = GitHubAuth;
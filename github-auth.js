// GitHub Authentication Module
class GitHubAuth {
    constructor() {
        this.clientId = 'Ov23liE8QqoHxg4Z8rJa'; // GitHub OAuth App Client ID (public)
        this.redirectUri = window.location.origin;
        this.scope = 'repo,user';
        this.accessToken = localStorage.getItem('github_token');
        this.user = null;
    }

    // Initialize authentication
    init() {
        this.attachEventListeners();
        this.checkAuthStatus();
        this.handleOAuthCallback();
    }

    // Attach event listeners
    attachEventListeners() {
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    // Check if user is authenticated
    async checkAuthStatus() {
        if (this.accessToken) {
            try {
                await this.fetchUser();
                this.showAuthenticatedState();
            } catch (error) {
                console.error('Authentication check failed:', error);
                this.logout();
            }
        }
    }

    // Handle OAuth callback
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            this.exchangeCodeForToken(code);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Start OAuth flow
    login() {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${this.scope}`;
        window.location.href = authUrl;
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(code) {
        try {
            // In a real application, this would be done on a backend server
            // For demo purposes, we'll simulate getting a token
            // Note: This is not secure and should not be used in production
            
            // For now, we'll use a mock token or prompt user to enter token
            const token = prompt('Please enter your GitHub Personal Access Token with repo permissions:');
            if (token) {
                this.accessToken = token;
                localStorage.setItem('github_token', this.accessToken);
                await this.fetchUser();
                this.showAuthenticatedState();
            }
        } catch (error) {
            console.error('Token exchange failed:', error);
            alert('Authentication failed. Please try again.');
        }
    }

    // Fetch user information
    async fetchUser() {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${this.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        this.user = await response.json();
        return this.user;
    }

    // Show authenticated state
    showAuthenticatedState() {
        document.getElementById('authSection').querySelector('button').style.display = 'none';
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('userName').textContent = `Welcome, ${this.user.login}!`;
        document.getElementById('uploadSection').classList.remove('hidden');
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('userAuthenticated', { 
            detail: { user: this.user, token: this.accessToken }
        }));
    }

    // Logout
    logout() {
        this.accessToken = null;
        this.user = null;
        localStorage.removeItem('github_token');
        
        document.getElementById('authSection').querySelector('button').style.display = 'inline-block';
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('uploadSection').classList.add('hidden');
        document.getElementById('pagesSection').classList.add('hidden');
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    // Get access token
    getAccessToken() {
        return this.accessToken;
    }

    // Get user info
    getUser() {
        return this.user;
    }

    // Check if authenticated
    isAuthenticated() {
        return this.accessToken && this.user;
    }

    // API helper method
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Authorization': `token ${this.accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(`https://api.github.com${endpoint}`, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
}

// Initialize GitHub Auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.githubAuth = new GitHubAuth();
    window.githubAuth.init();
});
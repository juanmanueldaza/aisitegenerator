/**
 * GitHub Authentication Handler
 * Manages GitHub OAuth authentication with comprehensive error handling
 */

class GitHubAuth {
    constructor() {
        this.clientId = 'your-github-client-id'; // Replace with actual client ID
        this.redirectUri = window.location.origin;
        this.scopes = ['repo', 'user', 'pages'];
        this.api = new GitHubAPI();
        this.currentUser = null;
    }

    /**
     * Initialize authentication system
     */
    async init() {
        try {
            // Check for existing token in localStorage
            const token = localStorage.getItem('github_token');
            if (token) {
                this.api.setToken(token);
                
                // Validate token
                try {
                    this.currentUser = await this.api.getCurrentUser();
                    this.updateUI(true);
                    
                    Toast.success('Welcome back!', `Signed in as ${this.currentUser.login}`);
                } catch (error) {
                    // Token is invalid, remove it
                    localStorage.removeItem('github_token');
                    this.updateUI(false);
                    
                    Toast.warning('Session Expired', 'Please sign in again');
                }
            } else {
                this.updateUI(false);
            }

            // Check for OAuth callback
            await this.handleOAuthCallback();

        } catch (error) {
            console.error('Auth initialization error:', error);
            Toast.error('Authentication Error', 'Failed to initialize authentication');
            this.updateUI(false);
        }
    }

    /**
     * Start GitHub OAuth flow
     */
    startOAuth() {
        try {
            Progress.show({
                title: 'Connecting to GitHub',
                message: 'Redirecting to GitHub for authentication...',
                percentage: 0
            });

            const state = this.generateState();
            localStorage.setItem('oauth_state', state);

            const authUrl = new URL('https://github.com/login/oauth/authorize');
            authUrl.searchParams.set('client_id', this.clientId);
            authUrl.searchParams.set('redirect_uri', this.redirectUri);
            authUrl.searchParams.set('scope', this.scopes.join(' '));
            authUrl.searchParams.set('state', state);

            // Small delay to show progress, then redirect
            setTimeout(() => {
                window.location.href = authUrl.toString();
            }, 1000);

        } catch (error) {
            Progress.hide();
            
            const handledError = GitHubErrorHandler.handleError(error, {
                operation: 'oauth_initiation'
            });
            
            ErrorModal.showError(handledError);
        }
    }

    /**
     * Handle OAuth callback
     */
    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            // OAuth error
            const errorDescription = urlParams.get('error_description') || 'OAuth authentication failed';
            
            Toast.error('Authentication Failed', errorDescription);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (code && state) {
            try {
                // Verify state parameter
                const savedState = localStorage.getItem('oauth_state');
                if (state !== savedState) {
                    throw new Error('Invalid OAuth state parameter');
                }

                Progress.show({
                    title: 'Completing Authentication',
                    message: 'Exchanging authorization code for access token...',
                    percentage: 50
                });

                // Exchange code for token
                const token = await this.exchangeCodeForToken(code);
                
                Progress.update({
                    percentage: 75,
                    message: 'Retrieving user information...'
                });

                // Set token and get user info
                this.api.setToken(token);
                this.currentUser = await this.api.getCurrentUser();

                // Store token securely
                localStorage.setItem('github_token', token);
                localStorage.removeItem('oauth_state');

                Progress.update({
                    percentage: 100,
                    message: 'Authentication completed!'
                });

                // Update UI
                this.updateUI(true);

                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);

                setTimeout(() => {
                    Progress.hide();
                    Toast.success('Connected!', `Successfully signed in as ${this.currentUser.login}`);
                }, 1500);

            } catch (error) {
                Progress.hide();
                
                const handledError = await GitHubErrorHandler.handleError(error, {
                    operation: 'oauth_token_exchange'
                });
                
                ErrorModal.showError(handledError);
                
                // Clean up
                localStorage.removeItem('oauth_state');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code) {
        // Note: In a production app, this should be done on your backend
        // This is a simplified example for a frontend-only app
        
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: 'your-client-secret', // Should be on backend
                code: code
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error_description || data.error);
        }

        return data.access_token;
    }

    /**
     * Sign out user
     */
    async signOut() {
        try {
            Progress.show({
                title: 'Signing Out',
                message: 'Removing authentication...',
                percentage: 50
            });

            // Clear stored data
            localStorage.removeItem('github_token');
            this.api.setToken(null);
            this.currentUser = null;

            Progress.update({
                percentage: 100,
                message: 'Signed out successfully!'
            });

            // Update UI
            this.updateUI(false);

            setTimeout(() => {
                Progress.hide();
                Toast.info('Signed Out', 'You have been signed out of GitHub');
            }, 1000);

        } catch (error) {
            Progress.hide();
            Toast.error('Sign Out Error', 'Failed to sign out properly');
        }
    }

    /**
     * Update UI based on authentication state
     */
    updateUI(isAuthenticated) {
        const authBtn = document.getElementById('github-auth-btn');
        const userInfo = document.getElementById('user-info');
        const username = document.getElementById('username');
        const logoutBtn = document.getElementById('logout-btn');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        if (isAuthenticated && this.currentUser) {
            authBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            username.textContent = this.currentUser.login;
            
            // Enable chat interface
            chatInput.disabled = false;
            chatInput.placeholder = 'Tell me about the website you want to create...';
            sendBtn.disabled = false;

            // Set up logout handler
            logoutBtn.onclick = () => this.signOut();

        } else {
            authBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
            
            // Disable chat interface
            chatInput.disabled = true;
            chatInput.placeholder = 'Please connect GitHub to start creating...';
            sendBtn.disabled = true;

            // Set up auth handler
            authBtn.onclick = () => this.startOAuth();
        }
    }

    /**
     * Generate secure random state for OAuth
     */
    generateState() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get GitHub API instance
     */
    getAPI() {
        return this.api;
    }

    /**
     * Test authentication and permissions
     */
    async testAuthentication() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            Progress.show({
                title: 'Testing Connection',
                message: 'Verifying GitHub access...'
            });

            // Test basic API access
            await this.api.getCurrentUser();
            Progress.update({ percentage: 33, message: 'User access verified...' });

            // Test repository listing
            await this.api.getUserRepositories({ per_page: 1 });
            Progress.update({ percentage: 66, message: 'Repository access verified...' });

            // Test rate limit status
            await this.api.getRateLimitStatus();
            Progress.update({ percentage: 100, message: 'All tests passed!' });

            setTimeout(() => {
                Progress.hide();
                Toast.success('Connection Test', 'All GitHub permissions verified');
            }, 1500);

            return true;

        } catch (error) {
            Progress.hide();
            
            const handledError = await GitHubErrorHandler.handleError(error, {
                operation: 'authentication_test'
            });
            
            ErrorModal.showError(handledError);
            return false;
        }
    }
}

// Make available globally
window.GitHubAuth = GitHubAuth;
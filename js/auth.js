/**
 * Authentication module
 * Handles GitHub OAuth flow and secure token management
 */
class AuthManager {
    constructor() {
        this.tokenManager = new TokenManager();
        this.githubClientId = 'your-github-client-id'; // This should be configured
        this.redirectUri = window.location.origin;
        this.scopes = 'repo user';
        
        this.setupEventListeners();
        this.setupTokenManagerCallbacks();
    }

    /**
     * Setup event listeners for authentication UI
     */
    setupEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Handle OAuth callback
        this.handleOAuthCallback();
    }

    /**
     * Setup callbacks for token manager events
     */
    setupTokenManagerCallbacks() {
        this.tokenManager.onTokenExpire(() => {
            this.handleTokenExpire();
        });

        this.tokenManager.onTokenRefresh(() => {
            console.log('Token refreshed successfully');
        });
    }

    /**
     * Initiate GitHub OAuth login
     */
    login() {
        try {
            // In a real implementation, this would redirect to GitHub OAuth
            // For now, we'll simulate a successful OAuth flow
            console.log('Initiating GitHub OAuth...');
            
            // Simulate OAuth redirect
            const state = this.generateState();
            sessionStorage.setItem('oauth_state', state);
            
            // In a real app, this would be:
            // const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.githubClientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(this.scopes)}&state=${state}`;
            // window.location.href = authUrl;
            
            // For demo purposes, simulate successful authentication
            this.simulateSuccessfulAuth();
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    /**
     * Simulate successful authentication (for demo purposes)
     */
    async simulateSuccessfulAuth() {
        try {
            // Simulate receiving an OAuth token
            const mockToken = 'ghp_' + this.generateMockToken();
            const mockUserData = {
                login: 'demo-user',
                name: 'Demo User',
                avatar_url: 'https://github.com/identicons/demo-user.png'
            };

            await this.handleSuccessfulAuth(mockToken, mockUserData);
        } catch (error) {
            console.error('Simulated auth failed:', error);
        }
    }

    /**
     * Handle OAuth callback from GitHub
     */
    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            this.showError('Authentication failed: ' + error);
            return;
        }

        if (code && state) {
            // Verify state parameter
            const savedState = sessionStorage.getItem('oauth_state');
            if (state !== savedState) {
                console.error('State mismatch in OAuth callback');
                this.showError('Authentication failed: Invalid state');
                return;
            }

            try {
                // In a real app, you would exchange the code for a token
                // This requires a backend service or GitHub App
                console.log('OAuth code received:', code);
                
                // Clear the URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // For now, simulate successful token exchange
                await this.simulateSuccessfulAuth();
            } catch (error) {
                console.error('Token exchange failed:', error);
                this.showError('Authentication failed. Please try again.');
            }
        }
    }

    /**
     * Handle successful authentication
     * @param {string} token - OAuth access token
     * @param {Object} userData - User information from GitHub
     */
    async handleSuccessfulAuth(token, userData) {
        try {
            // Store token securely
            await this.tokenManager.storeToken(token, {
                type: 'github_oauth',
                user: userData,
                scopes: this.scopes
            });

            // Update UI
            this.updateAuthUI(true, userData);
            
            console.log('Authentication successful');
        } catch (error) {
            console.error('Failed to handle successful auth:', error);
            this.showError('Failed to complete authentication');
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            this.tokenManager.clearToken();
            this.updateAuthUI(false);
            
            // Clear any OAuth state
            sessionStorage.removeItem('oauth_state');
            
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    /**
     * Handle token expiration
     */
    handleTokenExpire() {
        console.log('Token expired');
        this.updateAuthUI(false);
        this.showError('Your session has expired. Please log in again.');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    async isAuthenticated() {
        return await this.tokenManager.hasValidToken();
    }

    /**
     * Get current access token
     * @returns {string|null} - Access token or null
     */
    async getAccessToken() {
        const tokenData = await this.tokenManager.getToken();
        return tokenData ? tokenData.token : null;
    }

    /**
     * Get current user information
     * @returns {Object|null} - User data or null
     */
    async getCurrentUser() {
        const tokenData = await this.tokenManager.getToken();
        return tokenData && tokenData.metadata ? tokenData.metadata.user : null;
    }

    /**
     * Update authentication UI
     * @param {boolean} isAuthenticated - Whether user is authenticated
     * @param {Object} userData - User data (optional)
     */
    updateAuthUI(isAuthenticated, userData = null) {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');
        const welcomeSection = document.getElementById('welcome-section');
        const appSection = document.getElementById('app-section');

        if (isAuthenticated) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (welcomeSection) welcomeSection.style.display = 'none';
            if (appSection) appSection.style.display = 'block';
            
            if (userInfo && userData) {
                userInfo.style.display = 'inline-block';
                userInfo.textContent = `Welcome, ${userData.name || userData.login}!`;
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (welcomeSection) welcomeSection.style.display = 'block';
            if (appSection) appSection.style.display = 'none';
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Simple error display - in a real app, you'd want a proper notification system
        alert(message);
    }

    /**
     * Generate secure state parameter for OAuth
     * @returns {string} - Random state string
     */
    generateState() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate mock token for demo purposes
     * @returns {string} - Mock token
     */
    generateMockToken() {
        const array = new Uint8Array(20);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Initialize authentication state
     */
    async initialize() {
        try {
            const isAuth = await this.isAuthenticated();
            if (isAuth) {
                const userData = await this.getCurrentUser();
                this.updateAuthUI(true, userData);
            } else {
                this.updateAuthUI(false);
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            this.updateAuthUI(false);
        }
    }
}

// Export for use in other modules
window.AuthManager = AuthManager;
/**
 * Secure Token Manager
 * Implements secure token storage with encryption, automatic cleanup, and session management
 * Uses SessionStorage as the balanced approach between security and UX
 */
class TokenManager {
    constructor() {
        this.crypto = new CryptoUtils();
        this.storageKey = 'aisitegen_token';
        this.sessionKey = 'aisitegen_session';
        this.encryptionKey = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.cleanupInterval = null;
        this.sessionTimer = null;
        this.callbacks = {
            onExpire: [],
            onRefresh: []
        };

        this.initializeEncryption();
        this.startCleanupRoutine();
        this.startSessionMonitoring();
    }

    /**
     * Initialize encryption key for the session
     */
    async initializeEncryption() {
        // Generate a session-specific encryption key
        this.encryptionKey = this.crypto.generateSecurePassword(32);
    }

    /**
     * Store token securely
     * @param {string} token - OAuth token to store
     * @param {Object} metadata - Additional token metadata (expiry, type, etc.)
     */
    async storeToken(token, metadata = {}) {
        try {
            if (!token) {
                throw new Error('Token is required');
            }

            const tokenData = {
                token: token,
                timestamp: Date.now(),
                expires: Date.now() + this.sessionTimeout,
                metadata: {
                    ...metadata,
                    userAgent: navigator.userAgent,
                    origin: window.location.origin
                }
            };

            // Encrypt the token data
            const encryptedData = await this.crypto.encrypt(
                JSON.stringify(tokenData),
                this.encryptionKey
            );

            // Store in sessionStorage (tab-scoped, cleared on tab close)
            sessionStorage.setItem(this.storageKey, encryptedData);

            // Store session metadata separately (unencrypted, for quick access)
            const sessionData = {
                expires: tokenData.expires,
                lastActivity: Date.now(),
                isActive: true
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));

            console.log('Token stored securely');
            this.updateSessionTimer();
        } catch (error) {
            console.error('Failed to store token:', error);
            throw new Error('Token storage failed');
        }
    }

    /**
     * Retrieve and decrypt token
     * @returns {Object|null} - Decrypted token data or null if not found/expired
     */
    async getToken() {
        try {
            const encryptedData = sessionStorage.getItem(this.storageKey);
            const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');

            if (!encryptedData || !sessionData.isActive) {
                return null;
            }

            // Check if session has expired
            if (Date.now() > sessionData.expires) {
                this.clearToken();
                this.triggerExpireCallbacks();
                return null;
            }

            // Decrypt token data
            const decryptedData = await this.crypto.decrypt(encryptedData, this.encryptionKey);
            const tokenData = JSON.parse(decryptedData);

            // Validate token integrity
            if (!this.validateTokenIntegrity(tokenData)) {
                this.clearToken();
                throw new Error('Token integrity validation failed');
            }

            // Update last activity
            this.updateActivity();

            return tokenData;
        } catch (error) {
            console.error('Failed to retrieve token:', error);
            this.clearToken();
            return null;
        }
    }

    /**
     * Check if a valid token exists
     * @returns {boolean} - True if valid token exists
     */
    async hasValidToken() {
        const token = await this.getToken();
        return token !== null;
    }

    /**
     * Clear stored token and session data
     */
    clearToken() {
        sessionStorage.removeItem(this.storageKey);
        sessionStorage.removeItem(this.sessionKey);
        console.log('Token cleared');
    }

    /**
     * Refresh token (extend session)
     * @param {string} newToken - New token if available
     */
    async refreshToken(newToken = null) {
        try {
            const currentToken = await this.getToken();
            if (!currentToken) {
                throw new Error('No token to refresh');
            }

            const tokenToStore = newToken || currentToken.token;
            await this.storeToken(tokenToStore, currentToken.metadata);
            
            this.triggerRefreshCallbacks();
            console.log('Token refreshed');
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }

    /**
     * Validate token integrity
     * @param {Object} tokenData - Token data to validate
     * @returns {boolean} - True if valid
     */
    validateTokenIntegrity(tokenData) {
        if (!tokenData || !tokenData.token || !tokenData.timestamp || !tokenData.metadata) {
            return false;
        }

        // Check if token is from the same origin
        if (tokenData.metadata.origin !== window.location.origin) {
            return false;
        }

        // Check if token is not too old (basic staleness check)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - tokenData.timestamp > maxAge) {
            return false;
        }

        return true;
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
        sessionData.lastActivity = Date.now();
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }

    /**
     * Start automatic cleanup routine
     */
    startCleanupRoutine() {
        // Clean up every minute
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 60000);
    }

    /**
     * Start session monitoring and timer updates
     */
    startSessionMonitoring() {
        // Update session timer every second
        this.sessionTimer = setInterval(() => {
            this.updateSessionTimer();
        }, 1000);
    }

    /**
     * Update session timer display
     */
    updateSessionTimer() {
        const timerElement = document.getElementById('session-timer');
        if (!timerElement) return;

        const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
        if (!sessionData.expires) {
            timerElement.textContent = 'No active session';
            return;
        }

        const remaining = sessionData.expires - Date.now();
        if (remaining <= 0) {
            timerElement.textContent = 'Session expired';
            this.clearToken();
            this.triggerExpireCallbacks();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Perform cleanup of expired or invalid tokens
     */
    async performCleanup() {
        try {
            const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
            
            if (sessionData.expires && Date.now() > sessionData.expires) {
                this.clearToken();
                this.triggerExpireCallbacks();
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
            // If cleanup fails, clear everything to be safe
            this.clearToken();
        }
    }

    /**
     * Register callback for token expiration
     * @param {Function} callback - Callback function
     */
    onTokenExpire(callback) {
        this.callbacks.onExpire.push(callback);
    }

    /**
     * Register callback for token refresh
     * @param {Function} callback - Callback function
     */
    onTokenRefresh(callback) {
        this.callbacks.onRefresh.push(callback);
    }

    /**
     * Trigger expire callbacks
     */
    triggerExpireCallbacks() {
        this.callbacks.onExpire.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Expire callback failed:', error);
            }
        });
    }

    /**
     * Trigger refresh callbacks
     */
    triggerRefreshCallbacks() {
        this.callbacks.onRefresh.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Refresh callback failed:', error);
            }
        });
    }

    /**
     * Destroy token manager and clean up resources
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        this.clearToken();
    }

    /**
     * Get session information
     * @returns {Object} - Session information
     */
    getSessionInfo() {
        const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
        return {
            isActive: sessionData.isActive || false,
            expires: sessionData.expires || null,
            lastActivity: sessionData.lastActivity || null,
            remainingTime: sessionData.expires ? Math.max(0, sessionData.expires - Date.now()) : 0
        };
    }
}

// Export for use in other modules
window.TokenManager = TokenManager;
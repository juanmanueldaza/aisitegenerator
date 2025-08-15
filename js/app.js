/**
 * Main application entry point
 * Initializes the secure authentication system and application
 */
class App {
    constructor() {
        this.authManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('Initializing AI Site Generator...');
            
            // Initialize authentication manager
            this.authManager = new AuthManager();
            await this.authManager.initialize();
            
            // Setup security measures
            this.setupSecurityMeasures();
            
            // Setup page visibility handling
            this.setupPageVisibilityHandling();
            
            // Setup beforeunload handler
            this.setupBeforeUnloadHandler();
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showInitializationError();
        }
    }

    /**
     * Setup additional security measures
     */
    setupSecurityMeasures() {
        // Disable right-click context menu in production
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }

        // Disable F12 and other developer tools shortcuts in production
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                    (e.ctrlKey && e.key === 'U')) {
                    e.preventDefault();
                }
            });
        }

        // Clear sensitive data on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanupSensitiveData();
        });

        // Monitor for potential XSS attempts
        this.setupXSSProtection();
    }

    /**
     * Setup XSS protection monitoring
     */
    setupXSSProtection() {
        // Monitor for potential script injection
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for script tags
                            if (node.tagName === 'SCRIPT' && !this.isAllowedScript(node)) {
                                console.warn('Potential XSS attempt detected:', node);
                                node.remove();
                            }
                            
                            // Check for inline event handlers
                            if (node.hasAttributes && node.hasAttributes()) {
                                Array.from(node.attributes).forEach((attr) => {
                                    if (attr.name.startsWith('on')) {
                                        console.warn('Potential XSS attempt detected - inline event handler:', attr);
                                        node.removeAttribute(attr.name);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    /**
     * Check if a script is allowed (from our application)
     * @param {HTMLScriptElement} script - Script element to check
     * @returns {boolean} - True if allowed
     */
    isAllowedScript(script) {
        const allowedSources = [
            '/js/crypto-utils.js',
            '/js/token-manager.js',
            '/js/auth.js',
            '/js/app.js'
        ];

        return allowedSources.includes(script.src) || script.src === '';
    }

    /**
     * Setup page visibility handling for security
     */
    setupPageVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden - user switched tabs or minimized
                console.log('Page hidden - maintaining session security');
            } else {
                // Page is visible again - check session validity
                this.validateSessionOnFocus();
            }
        });
    }

    /**
     * Validate session when page comes back into focus
     */
    async validateSessionOnFocus() {
        if (this.authManager) {
            try {
                const isValid = await this.authManager.isAuthenticated();
                if (!isValid) {
                    console.log('Session invalid on focus - redirecting to login');
                    this.authManager.updateAuthUI(false);
                }
            } catch (error) {
                console.error('Session validation on focus failed:', error);
            }
        }
    }

    /**
     * Setup beforeunload handler for clean shutdown
     */
    setupBeforeUnloadHandler() {
        window.addEventListener('beforeunload', (e) => {
            // Clean up resources
            this.cleanupSensitiveData();
            
            // Note: Most browsers ignore custom messages now for security reasons
            // but we still return a message for older browsers
            const message = 'Are you sure you want to leave? Your session will be terminated.';
            e.returnValue = message;
            return message;
        });
    }

    /**
     * Clean up sensitive data before page unload
     */
    cleanupSensitiveData() {
        try {
            // Clear any temporary variables that might contain sensitive data
            if (this.authManager && this.authManager.tokenManager) {
                // Note: We don't clear the token here as it should persist in sessionStorage
                // for the duration of the browser session
                console.log('Cleaning up sensitive runtime data');
            }
            
            // Clear any form inputs that might contain sensitive data
            const sensitiveInputs = document.querySelectorAll('input[type="password"], input[data-sensitive="true"]');
            sensitiveInputs.forEach(input => {
                input.value = '';
            });
            
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    /**
     * Show initialization error
     */
    showInitializationError() {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>Application Failed to Initialize</h2>
                    <p>Sorry, there was a problem starting the application. Please refresh the page and try again.</p>
                    <button onclick="window.location.reload()">Refresh Page</button>
                </div>
            `;
        }
    }

    /**
     * Get current authentication status
     * @returns {boolean} - True if authenticated
     */
    async isAuthenticated() {
        return this.authManager ? await this.authManager.isAuthenticated() : false;
    }

    /**
     * Get current user
     * @returns {Object|null} - Current user or null
     */
    async getCurrentUser() {
        return this.authManager ? await this.authManager.getCurrentUser() : null;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create global app instance
        window.app = new App();
        await window.app.initialize();
        
        // Additional security: Freeze important objects to prevent tampering
        if (Object.freeze) {
            Object.freeze(window.CryptoUtils.prototype);
            Object.freeze(window.TokenManager.prototype);
            Object.freeze(window.AuthManager.prototype);
        }
        
    } catch (error) {
        console.error('Failed to start application:', error);
    }
});

// Additional security: Clear console in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    setInterval(() => {
        console.clear();
    }, 10000); // Clear console every 10 seconds
}
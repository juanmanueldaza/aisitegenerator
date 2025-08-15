// Main Application Controller
class App {
    constructor() {
        this.state = {
            authenticated: false,
            filesUploaded: false,
            pagesEnabled: false
        };
    }

    // Initialize the application
    init() {
        this.attachEventListeners();
        this.checkInitialState();
    }

    // Attach global event listeners
    attachEventListeners() {
        // Authentication events
        window.addEventListener('userAuthenticated', (e) => {
            this.state.authenticated = true;
            this.onUserAuthenticated(e.detail);
        });

        window.addEventListener('userLoggedOut', () => {
            this.state.authenticated = false;
            this.state.filesUploaded = false;
            this.state.pagesEnabled = false;
            this.onUserLoggedOut();
        });

        // File upload events
        window.addEventListener('filesUploaded', (e) => {
            this.state.filesUploaded = true;
            this.onFilesUploaded(e.detail);
        });

        // Error handling
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleGlobalError(e.reason);
        });
    }

    // Check initial application state
    checkInitialState() {
        // This will be handled by individual modules
        console.log('AI Site Generator initialized');
    }

    // Handle user authentication
    onUserAuthenticated(detail) {
        console.log('User authenticated:', detail.user.login);
        this.showWelcomeMessage(detail.user);
    }

    // Handle user logout
    onUserLoggedOut() {
        console.log('User logged out');
        this.clearApplicationState();
    }

    // Handle files uploaded
    onFilesUploaded(detail) {
        console.log('Files uploaded to repository:', detail.repository.name);
        this.showUploadSuccess(detail);
    }

    // Show welcome message
    showWelcomeMessage(user) {
        // You could add a toast notification here
        console.log(`Welcome ${user.login}! You can now upload your site files.`);
    }

    // Show upload success
    showUploadSuccess(detail) {
        const message = `Files uploaded successfully to ${detail.repository.name}. GitHub Pages deployment has been initiated automatically.`;
        this.showNotification(message, 'success');
    }

    // Clear application state
    clearApplicationState() {
        this.state = {
            authenticated: false,
            filesUploaded: false,
            pagesEnabled: false
        };
    }

    // Handle global errors
    handleGlobalError(error) {
        console.error('Global error:', error);
        
        // Don't show notification for authentication errors as they're handled elsewhere
        if (error.message && error.message.includes('Authentication')) {
            return;
        }

        this.showNotification(
            `An error occurred: ${error.message || 'Unknown error'}`,
            'error'
        );
    }

    // Show notification (basic implementation)
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 6px;
                    color: white;
                    z-index: 1000;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideIn 0.3s ease-out;
                }
                
                .notification-info {
                    background-color: #3498db;
                }
                
                .notification-success {
                    background-color: #27ae60;
                }
                
                .notification-error {
                    background-color: #e74c3c;
                }
                
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    padding: 0;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Get application state
    getState() {
        return { ...this.state };
    }

    // Utility method to check if feature is supported
    checkBrowserSupport() {
        const features = {
            fetch: typeof fetch !== 'undefined',
            localStorage: typeof localStorage !== 'undefined',
            fileReader: typeof FileReader !== 'undefined',
            dragAndDrop: 'draggable' in document.createElement('span')
        };

        const unsupported = Object.entries(features)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupported.length > 0) {
            this.showNotification(
                `Your browser doesn't support some features: ${unsupported.join(', ')}. Please use a modern browser.`,
                'error'
            );
            return false;
        }

        return true;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Check browser support before initializing
    if (window.app.checkBrowserSupport()) {
        window.app.init();
    }
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
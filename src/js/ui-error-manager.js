/**
 * UI Manager for error handling and user communication
 * Provides clear error messages, progress indicators, and recovery options
 */

import { GeminiError } from './gemini-error-handler.js';

export class UIErrorManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentError = null;
        this.retryCallbacks = new Map();
    }

    initializeElements() {
        this.errorModal = document.getElementById('errorModal');
        this.errorTitle = document.getElementById('errorTitle');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorActions = document.getElementById('errorActions');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.cancelRequest = document.getElementById('cancelRequest');
        
        this.apiStatus = document.getElementById('apiStatus');
        this.statusText = this.apiStatus?.querySelector('.status-text');
    }

    setupEventListeners() {
        this.closeErrorModal?.addEventListener('click', () => {
            this.hideError();
        });

        this.errorModal?.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideError();
            }
        });

        this.cancelRequest?.addEventListener('click', () => {
            this.cancelCurrentRequest();
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideError();
                this.hideLoading();
            }
        });
    }

    // Error display methods
    showError(error, context = {}) {
        this.currentError = error;
        const userMessage = error.toUserMessage();
        
        this.errorTitle.textContent = userMessage.title;
        this.errorMessage.textContent = userMessage.message;
        
        // Clear previous actions
        this.errorActions.innerHTML = '';
        
        // Add action buttons
        userMessage.actions.forEach((action, index) => {
            const button = document.createElement('button');
            button.className = index === 0 ? 'btn-primary' : 'btn-secondary';
            button.textContent = action;
            
            button.addEventListener('click', () => {
                this.handleErrorAction(action, error, context);
            });
            
            this.errorActions.appendChild(button);
        });

        // Add retry button for retryable errors
        if (error.retryable && context.retryCallback) {
            const retryButton = document.createElement('button');
            retryButton.className = 'btn-primary retry-button';
            retryButton.textContent = error.retryAfter 
                ? `Retry in ${error.retryAfter}s` 
                : 'Retry Now';
            
            if (error.retryAfter) {
                retryButton.disabled = true;
                this.startRetryCountdown(retryButton, error.retryAfter, () => {
                    this.handleRetry(context.retryCallback);
                });
            } else {
                retryButton.addEventListener('click', () => {
                    this.handleRetry(context.retryCallback);
                });
            }
            
            this.errorActions.appendChild(retryButton);
        }

        this.errorModal.classList.remove('hidden');
        this.updateApiStatus('error', error.type);
    }

    hideError() {
        this.errorModal.classList.add('hidden');
        this.currentError = null;
    }

    // Loading state management
    showLoading(message = 'Processing your request...', cancellable = true) {
        this.loadingMessage.textContent = message;
        this.cancelRequest.style.display = cancellable ? 'block' : 'none';
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    updateLoadingMessage(message) {
        this.loadingMessage.textContent = message;
    }

    // Progress and retry indicators
    showRetryProgress(attempt, maxAttempts, delay, error) {
        const message = `Attempt ${attempt}/${maxAttempts} failed. Retrying in ${Math.ceil(delay / 1000)}s...`;
        this.updateLoadingMessage(message);
        
        // Show detailed error information
        const errorInfo = document.createElement('div');
        errorInfo.className = 'retry-error-info';
        errorInfo.innerHTML = `
            <small>Error: ${error.message}</small>
        `;
        
        const loadingContent = this.loadingOverlay.querySelector('.loading-content');
        const existingErrorInfo = loadingContent.querySelector('.retry-error-info');
        if (existingErrorInfo) {
            existingErrorInfo.remove();
        }
        loadingContent.appendChild(errorInfo);
    }

    startRetryCountdown(button, seconds, callback) {
        let remaining = seconds;
        
        const updateButton = () => {
            button.textContent = `Retry in ${remaining}s`;
            remaining--;
            
            if (remaining < 0) {
                button.textContent = 'Retry Now';
                button.disabled = false;
                button.addEventListener('click', callback);
            } else {
                setTimeout(updateButton, 1000);
            }
        };
        
        updateButton();
    }

    // Status indicator management
    updateApiStatus(status, details = '') {
        if (!this.statusText) return;
        
        const statusConfig = {
            ready: { text: 'API Ready', class: 'status-ready' },
            loading: { text: 'Processing...', class: 'status-loading' },
            error: { text: 'API Error', class: 'status-error' },
            rateLimit: { text: 'Rate Limited', class: 'status-warning' },
            offline: { text: 'Offline Mode', class: 'status-offline' },
            degraded: { text: 'Limited Service', class: 'status-warning' }
        };
        
        const config = statusConfig[status] || statusConfig.ready;
        
        // Remove all status classes
        this.apiStatus.className = 'status-indicator';
        this.apiStatus.classList.add(config.class);
        this.statusText.textContent = config.text;
        
        // Add tooltip with details
        if (details) {
            this.apiStatus.title = details;
        }
    }

    // Rate limiting UI
    showRateLimitWarning(waitTime) {
        const message = `Rate limit reached. Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`;
        
        this.showNotification(message, 'warning', {
            duration: waitTime,
            progress: true
        });
        
        this.updateApiStatus('rateLimit', message);
    }

    // Quota warnings
    showQuotaWarning(quotaInfo) {
        const { type, usage, limit, percentage } = quotaInfo;
        
        let message;
        if (type === 'daily_requests') {
            message = `You've used ${usage}/${limit} requests today (${Math.round(percentage)}%). Consider upgrading for higher limits.`;
        } else {
            message = `Quota warning: ${Math.round(percentage)}% of ${type} limit reached.`;
        }
        
        this.showNotification(message, 'warning', {
            duration: 10000,
            actions: [
                { text: 'View Usage', action: () => this.showUsageDetails(quotaInfo) },
                { text: 'Upgrade Plan', action: () => this.showUpgradeOptions() }
            ]
        });
    }

    // Fallback mode indicators
    showFallbackMode(type, _context) {
        const messages = {
            offline_mode_enabled: 'Switched to offline mode. Limited functionality available.',
            cache_hit: 'Using cached response from previous request.',
            cache_fallback: 'Service unavailable. Using cached response.',
            offline_fallback: 'Service unavailable. Using basic templates.'
        };
        
        const message = messages[type] || 'Using fallback mode due to service issues.';
        
        this.showNotification(message, 'info', {
            duration: 5000,
            icon: 'offline'
        });
        
        this.updateApiStatus('offline', message);
    }

    // Action handlers
    handleErrorAction(action, error, context) {
        switch (action) {
        case 'Check API key configuration':
            this.showApiKeyConfiguration();
            break;
                
        case 'Contact support if the issue persists':
            this.showSupportContact();
            break;
                
        case 'Wait a few seconds and retry':
            this.hideError();
            setTimeout(() => {
                if (context.retryCallback) {
                    this.handleRetry(context.retryCallback);
                }
            }, 3000);
            break;
                
        case 'Consider upgrading your plan for higher limits':
        case 'Upgrade your plan for higher limits':
            this.showUpgradeOptions();
            break;
                
        case 'Wait for quota reset':
            this.showQuotaResetInfo();
            break;
                
        case 'Use offline mode for basic functionality':
            this.enableOfflineMode();
            break;
                
        case 'Review and modify your content':
            this.showContentGuidelines();
            break;
                
        case 'Check our content guidelines':
            this.showContentPolicyInfo();
            break;
                
        case 'Try again in a few minutes':
            this.hideError();
            this.scheduleRetry(context.retryCallback, 60000); // 1 minute
            break;
                
        case 'Use cached suggestions if available':
            this.showCachedSuggestions();
            break;
                
        case 'Continue with manual editing':
            this.enableManualMode();
            break;
                
        case 'Check your internet connection':
            this.showConnectivityCheck();
            break;
                
        case 'Reduce content length':
            this.showContentLengthGuidance();
            break;
                
        default:
            console.log('Unhandled error action:', action);
        }
    }

    handleRetry(retryCallback) {
        this.hideError();
        this.showLoading('Retrying request...');
        
        if (retryCallback) {
            retryCallback();
        }
    }

    // Notification system
    showNotification(message, type = 'info', options = {}) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                ${options.actions ? this.createNotificationActions(options.actions) : ''}
                <button class="notification-close">&times;</button>
            </div>
            ${options.progress ? '<div class="notification-progress"></div>' : ''}
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        const duration = options.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
            
            // Update progress bar
            if (options.progress) {
                const progressBar = notification.querySelector('.notification-progress');
                progressBar.style.animation = `progress ${duration}ms linear`;
            }
        }
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        return notification;
    }

    createNotificationActions(actions) {
        return `
            <div class="notification-actions">
                ${actions.map(action => 
        `<button class="notification-action" data-action="${action.text}">${action.text}</button>`
    ).join('')}
            </div>
        `;
    }

    removeNotification(notification) {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Specialized UI methods
    showApiKeyConfiguration() {
        // Implementation would show API key configuration dialog
        console.log('Show API key configuration');
    }

    showSupportContact() {
        // Implementation would show support contact information
        console.log('Show support contact');
    }

    showUpgradeOptions() {
        // Implementation would show plan upgrade options
        console.log('Show upgrade options');
    }

    showQuotaResetInfo() {
        // Implementation would show quota reset information
        console.log('Show quota reset info');
    }

    enableOfflineMode() {
        // Implementation would enable offline mode
        console.log('Enable offline mode');
        this.updateApiStatus('offline', 'Offline mode enabled');
    }

    showContentGuidelines() {
        // Implementation would show content guidelines
        console.log('Show content guidelines');
    }

    showContentPolicyInfo() {
        // Implementation would show content policy information
        console.log('Show content policy info');
    }

    scheduleRetry(retryCallback, delay) {
        if (retryCallback) {
            this.showNotification(`Retrying in ${Math.ceil(delay / 1000)} seconds...`, 'info', {
                duration: delay,
                progress: true
            });
            
            setTimeout(() => {
                this.handleRetry(retryCallback);
            }, delay);
        }
    }

    showCachedSuggestions() {
        // Implementation would show cached suggestions
        console.log('Show cached suggestions');
    }

    enableManualMode() {
        // Implementation would enable manual editing mode
        console.log('Enable manual mode');
    }

    showConnectivityCheck() {
        // Implementation would show connectivity check
        console.log('Show connectivity check');
    }

    showContentLengthGuidance() {
        // Implementation would show content length guidance
        console.log('Show content length guidance');
    }

    showUsageDetails(quotaInfo) {
        // Implementation would show detailed usage information
        console.log('Show usage details:', quotaInfo);
    }

    cancelCurrentRequest() {
        // Implementation would cancel the current request
        console.log('Cancel current request');
        this.hideLoading();
    }

    // Public API for external components
    setRetryCallback(requestId, callback) {
        this.retryCallbacks.set(requestId, callback);
    }

    removeRetryCallback(requestId) {
        this.retryCallbacks.delete(requestId);
    }

    getRetryCallback(requestId) {
        return this.retryCallbacks.get(requestId);
    }
}

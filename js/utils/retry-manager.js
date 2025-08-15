/**
 * Retry Manager
 * Handles retry logic with exponential backoff for GitHub API operations
 */

class RetryManager {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000;
        this.maxDelay = options.maxDelay || 30000;
        this.retryJitter = options.retryJitter !== false;
        this.onRetryAttempt = options.onRetryAttempt || null;
        this.onRetrySuccess = options.onRetrySuccess || null;
        this.onRetryFailed = options.onRetryFailed || null;
    }

    /**
     * Execute operation with retry logic
     */
    async execute(operation, context = {}) {
        let lastError = null;
        let attempt = 0;

        while (attempt <= this.maxRetries) {
            attempt++;

            try {
                // Execute the operation
                const result = await operation();
                
                // If we had previous failures but this succeeded, notify
                if (attempt > 1 && this.onRetrySuccess) {
                    this.onRetrySuccess(attempt - 1, context);
                }

                return result;
            } catch (error) {
                lastError = error;

                // Handle the error using GitHubErrorHandler
                const handledError = await GitHubErrorHandler.handleError(error, {
                    ...context,
                    attempt,
                    retryFunction: () => this.execute(operation, context)
                });

                // Check if we should retry
                if (attempt <= this.maxRetries && GitHubErrorHandler.shouldRetry(handledError)) {
                    // Calculate delay for this attempt
                    const delay = this.calculateDelay(handledError, attempt);
                    
                    // Notify about retry attempt
                    if (this.onRetryAttempt) {
                        this.onRetryAttempt(attempt, this.maxRetries, delay, handledError, context);
                    }

                    // Show retry notification to user
                    this.showRetryNotification(attempt, this.maxRetries, delay, handledError);

                    // Wait before retrying
                    await this.wait(delay);
                } else {
                    // No more retries or non-retryable error
                    if (this.onRetryFailed) {
                        this.onRetryFailed(attempt - 1, handledError, context);
                    }
                    
                    throw handledError;
                }
            }
        }

        // All retries exhausted
        if (this.onRetryFailed) {
            this.onRetryFailed(this.maxRetries, lastError, context);
        }
        
        throw lastError;
    }

    /**
     * Calculate delay for retry attempt
     */
    calculateDelay(error, attempt) {
        // Use error handler's delay calculation
        let delay = GitHubErrorHandler.getRetryDelay(error, attempt);

        // If no specific delay from error handler, use exponential backoff
        if (!delay) {
            delay = Math.min(
                this.baseDelay * Math.pow(2, attempt - 1),
                this.maxDelay
            );
        }

        // Add jitter to prevent thundering herd
        if (this.retryJitter) {
            delay += Math.random() * 1000;
        }

        return Math.round(delay);
    }

    /**
     * Wait for specified delay
     */
    wait(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Show retry notification to user
     */
    showRetryNotification(attempt, maxRetries, delay, error) {
        const remainingRetries = maxRetries - attempt;
        const delaySeconds = Math.round(delay / 1000);

        let message;
        if (error.type === GitHubErrorHandler.ERROR_TYPES.RATE_LIMIT) {
            message = `Rate limit exceeded. Retrying in ${delaySeconds} seconds...`;
        } else if (error.type === GitHubErrorHandler.ERROR_TYPES.NETWORK) {
            message = `Connection failed. Retrying in ${delaySeconds} seconds... (${remainingRetries} attempts left)`;
        } else {
            message = `Operation failed. Retrying in ${delaySeconds} seconds... (${remainingRetries} attempts left)`;
        }

        // Show toast notification
        if (window.Toast) {
            window.Toast.show({
                type: 'warning',
                title: 'Retrying Operation',
                message,
                duration: Math.min(delay, 5000)
            });
        }

        // Show retry banner if available
        this.showRetryBanner(attempt, maxRetries, delay, error);
    }

    /**
     * Show retry banner with countdown
     */
    showRetryBanner(attempt, maxRetries, delay, error) {
        const bannerId = 'retry-banner';
        let banner = document.getElementById(bannerId);

        if (!banner) {
            banner = document.createElement('div');
            banner.id = bannerId;
            banner.className = 'retry-banner';
            
            const content = document.createElement('div');
            content.className = 'retry-banner-content';
            
            const text = document.createElement('span');
            text.className = 'retry-banner-text';
            
            const countdown = document.createElement('span');
            countdown.className = 'retry-countdown';
            
            content.appendChild(text);
            content.appendChild(countdown);
            banner.appendChild(content);
            
            // Insert banner at the top of main content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
        }

        const textElement = banner.querySelector('.retry-banner-text');
        const countdownElement = banner.querySelector('.retry-countdown');

        const remainingRetries = maxRetries - attempt;
        let remainingTime = Math.round(delay / 1000);

        textElement.textContent = `Operation failed. Retrying... (${remainingRetries} attempts left)`;
        
        // Update countdown every second
        const countdownInterval = setInterval(() => {
            if (remainingTime > 0) {
                countdownElement.textContent = `${remainingTime}s`;
                remainingTime--;
            } else {
                countdownElement.textContent = 'Retrying now...';
                clearInterval(countdownInterval);
                
                // Remove banner after retry starts
                setTimeout(() => {
                    if (banner.parentNode) {
                        banner.parentNode.removeChild(banner);
                    }
                }, 1000);
            }
        }, 1000);

        // Initial countdown display
        countdownElement.textContent = `${remainingTime}s`;
    }

    /**
     * Create a retry manager for specific GitHub operations
     */
    static forGitHubOperation(operationType, options = {}) {
        const defaultOptions = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 30000
        };

        // Customize options based on operation type
        switch (operationType) {
            case 'authentication':
                return new RetryManager({
                    ...defaultOptions,
                    maxRetries: 1, // Don't retry auth failures
                    ...options
                });

            case 'repository_creation':
                return new RetryManager({
                    ...defaultOptions,
                    maxRetries: 2, // Limited retries for creation
                    ...options
                });

            case 'file_upload':
                return new RetryManager({
                    ...defaultOptions,
                    maxRetries: 5, // More retries for file operations
                    maxDelay: 60000, // Longer max delay
                    ...options
                });

            case 'deployment':
                return new RetryManager({
                    ...defaultOptions,
                    maxRetries: 3,
                    maxDelay: 45000,
                    ...options
                });

            default:
                return new RetryManager({
                    ...defaultOptions,
                    ...options
                });
        }
    }

    /**
     * Wrap an async function with retry logic
     */
    static wrapWithRetry(asyncFunction, operationType, options = {}) {
        const retryManager = this.forGitHubOperation(operationType, options);
        
        return async function(...args) {
            return retryManager.execute(async () => {
                return asyncFunction.apply(this, args);
            }, { 
                operation: operationType,
                arguments: args 
            });
        };
    }
}

// Make available globally
window.RetryManager = RetryManager;
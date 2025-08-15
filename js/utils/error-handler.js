/**
 * GitHub API Error Handler
 * Comprehensive error handling for all GitHub API operations
 */

class GitHubAPIError extends Error {
    constructor(message, type, statusCode, originalError, response) {
        super(message);
        this.name = 'GitHubAPIError';
        this.type = type;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.response = response;
        this.timestamp = new Date().toISOString();
    }
}

class GitHubErrorHandler {
    static ERROR_TYPES = {
        AUTHENTICATION: 'authentication',
        AUTHORIZATION: 'authorization',
        REPOSITORY: 'repository',
        RATE_LIMIT: 'rate_limit',
        NETWORK: 'network',
        VALIDATION: 'validation',
        SERVER: 'server',
        UNKNOWN: 'unknown'
    };

    static SEVERITY_LEVELS = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    };

    /**
     * Categorize and handle GitHub API errors
     */
    static async handleError(error, context = {}) {
        const errorInfo = this.categorizeError(error);
        const handledError = this.createHandledError(errorInfo, context);
        
        // Log error for debugging
        console.error('GitHub API Error:', handledError);
        
        // Trigger appropriate user feedback
        await this.showUserFeedback(handledError);
        
        return handledError;
    }

    /**
     * Categorize error based on status code and response
     */
    static categorizeError(error) {
        const statusCode = error.status || error.statusCode || 0;
        const response = error.response || {};
        const responseData = response.data || {};

        // Network/Connection errors
        if (!statusCode || error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
            return {
                type: this.ERROR_TYPES.NETWORK,
                severity: this.SEVERITY_LEVELS.HIGH,
                retryable: true,
                statusCode: 0
            };
        }

        // Rate limiting
        if (statusCode === 403 && (responseData.message?.includes('rate limit') || 
            responseData.message?.includes('API rate limit'))) {
            return {
                type: this.ERROR_TYPES.RATE_LIMIT,
                severity: this.SEVERITY_LEVELS.MEDIUM,
                retryable: true,
                statusCode,
                resetTime: response.headers?.['x-ratelimit-reset']
            };
        }

        // Authentication errors
        if (statusCode === 401) {
            return {
                type: this.ERROR_TYPES.AUTHENTICATION,
                severity: this.SEVERITY_LEVELS.HIGH,
                retryable: false,
                statusCode
            };
        }

        // Authorization/Permission errors
        if (statusCode === 403) {
            return {
                type: this.ERROR_TYPES.AUTHORIZATION,
                severity: this.SEVERITY_LEVELS.HIGH,
                retryable: false,
                statusCode
            };
        }

        // Repository errors
        if (statusCode === 404) {
            return {
                type: this.ERROR_TYPES.REPOSITORY,
                severity: this.SEVERITY_LEVELS.MEDIUM,
                retryable: false,
                statusCode
            };
        }

        // Validation errors
        if (statusCode === 422) {
            return {
                type: this.ERROR_TYPES.VALIDATION,
                severity: this.SEVERITY_LEVELS.MEDIUM,
                retryable: false,
                statusCode
            };
        }

        // Server errors
        if (statusCode >= 500) {
            return {
                type: this.ERROR_TYPES.SERVER,
                severity: this.SEVERITY_LEVELS.HIGH,
                retryable: true,
                statusCode
            };
        }

        // Unknown errors
        return {
            type: this.ERROR_TYPES.UNKNOWN,
            severity: this.SEVERITY_LEVELS.MEDIUM,
            retryable: false,
            statusCode
        };
    }

    /**
     * Create a detailed error object with user-friendly messaging
     */
    static createHandledError(errorInfo, context) {
        const { type, severity, retryable, statusCode, resetTime } = errorInfo;
        const messages = this.getErrorMessages(type, statusCode, context);

        return new GitHubAPIError(
            messages.user,
            type,
            statusCode,
            context.originalError,
            context.response
        ).extend({
            severity,
            retryable,
            resetTime,
            technicalMessage: messages.technical,
            solution: messages.solution,
            helpUrl: messages.helpUrl,
            context
        });
    }

    /**
     * Get user-friendly error messages based on error type
     */
    static getErrorMessages(type, statusCode, context) {
        const operation = context.operation || 'GitHub operation';

        switch (type) {
            case this.ERROR_TYPES.AUTHENTICATION:
                return {
                    user: 'GitHub authentication failed. Please log in again.',
                    technical: `Authentication error (${statusCode})`,
                    solution: [
                        'Click "Connect GitHub" to re-authenticate',
                        'Make sure you have a valid GitHub account',
                        'Check if your token has expired'
                    ],
                    helpUrl: 'https://docs.github.com/en/authentication'
                };

            case this.ERROR_TYPES.AUTHORIZATION:
                return {
                    user: 'Insufficient permissions for this GitHub operation.',
                    technical: `Authorization error (${statusCode})`,
                    solution: [
                        'Ensure you have the required permissions for this repository',
                        'Contact the repository owner for access',
                        'Check if your GitHub token has the necessary scopes'
                    ],
                    helpUrl: 'https://docs.github.com/en/rest/overview/permissions-required-for-github-apps'
                };

            case this.ERROR_TYPES.RATE_LIMIT:
                return {
                    user: 'GitHub API rate limit exceeded. Please wait before trying again.',
                    technical: `Rate limit exceeded (${statusCode})`,
                    solution: [
                        'Wait for the rate limit to reset',
                        'Reduce the frequency of operations',
                        'Consider upgrading your GitHub plan for higher limits'
                    ],
                    helpUrl: 'https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting'
                };

            case this.ERROR_TYPES.REPOSITORY:
                return {
                    user: 'Repository not found or not accessible.',
                    technical: `Repository error (${statusCode})`,
                    solution: [
                        'Check if the repository name is correct',
                        'Ensure the repository exists and is accessible',
                        'Verify you have the required permissions'
                    ],
                    helpUrl: 'https://docs.github.com/en/repositories'
                };

            case this.ERROR_TYPES.NETWORK:
                return {
                    user: 'Connection to GitHub failed. Please check your internet connection.',
                    technical: 'Network connectivity error',
                    solution: [
                        'Check your internet connection',
                        'Try again in a few moments',
                        'Verify GitHub is accessible from your network'
                    ],
                    helpUrl: 'https://www.githubstatus.com/'
                };

            case this.ERROR_TYPES.VALIDATION:
                return {
                    user: 'Invalid data provided for GitHub operation.',
                    technical: `Validation error (${statusCode})`,
                    solution: [
                        'Check the format of the data you\'re submitting',
                        'Ensure all required fields are provided',
                        'Verify field constraints are met'
                    ],
                    helpUrl: 'https://docs.github.com/en/rest'
                };

            case this.ERROR_TYPES.SERVER:
                return {
                    user: 'GitHub is experiencing technical difficulties. Please try again later.',
                    technical: `Server error (${statusCode})`,
                    solution: [
                        'Wait a few minutes and try again',
                        'Check GitHub status page for known issues',
                        'Contact support if the problem persists'
                    ],
                    helpUrl: 'https://www.githubstatus.com/'
                };

            default:
                return {
                    user: `An unexpected error occurred during ${operation}.`,
                    technical: `Unknown error (${statusCode})`,
                    solution: [
                        'Try the operation again',
                        'Refresh the page if the problem persists',
                        'Contact support if you continue to experience issues'
                    ],
                    helpUrl: 'https://support.github.com/'
                };
        }
    }

    /**
     * Show appropriate user feedback based on error severity
     */
    static async showUserFeedback(error) {
        const { type, severity, retryable } = error;

        // For critical errors, show error modal
        if (severity === this.SEVERITY_LEVELS.CRITICAL || severity === this.SEVERITY_LEVELS.HIGH) {
            if (window.ErrorModal) {
                window.ErrorModal.show({
                    title: this.getErrorTitle(type),
                    message: error.message,
                    details: error.technicalMessage,
                    solution: error.solution,
                    helpUrl: error.helpUrl,
                    retryable,
                    onRetry: error.context?.retryFunction
                });
            }
        } 
        // For medium/low severity, show toast notification
        else {
            if (window.Toast) {
                window.Toast.show({
                    type: 'error',
                    title: this.getErrorTitle(type),
                    message: error.message,
                    duration: 5000
                });
            }
        }
    }

    /**
     * Get appropriate error title for display
     */
    static getErrorTitle(type) {
        switch (type) {
            case this.ERROR_TYPES.AUTHENTICATION:
                return 'Authentication Required';
            case this.ERROR_TYPES.AUTHORIZATION:
                return 'Permission Denied';
            case this.ERROR_TYPES.RATE_LIMIT:
                return 'Rate Limit Exceeded';
            case this.ERROR_TYPES.REPOSITORY:
                return 'Repository Error';
            case this.ERROR_TYPES.NETWORK:
                return 'Connection Error';
            case this.ERROR_TYPES.VALIDATION:
                return 'Invalid Data';
            case this.ERROR_TYPES.SERVER:
                return 'Server Error';
            default:
                return 'Error';
        }
    }

    /**
     * Check if error should trigger a retry
     */
    static shouldRetry(error) {
        return error.retryable && 
               (error.type === this.ERROR_TYPES.NETWORK || 
                error.type === this.ERROR_TYPES.SERVER ||
                error.type === this.ERROR_TYPES.RATE_LIMIT);
    }

    /**
     * Get retry delay based on error type
     */
    static getRetryDelay(error, attemptNumber) {
        if (error.type === this.ERROR_TYPES.RATE_LIMIT && error.resetTime) {
            // Wait until rate limit resets
            const resetTime = new Date(error.resetTime * 1000);
            const now = new Date();
            return Math.max(0, resetTime.getTime() - now.getTime());
        }

        // Exponential backoff for other retryable errors
        const baseDelay = 1000; // 1 second
        const maxDelay = 30000; // 30 seconds
        const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
        
        // Add jitter to prevent thundering herd
        return delay + Math.random() * 1000;
    }
}

// Extend Error prototype for additional properties
Error.prototype.extend = function(properties) {
    Object.assign(this, properties);
    return this;
};

// Make available globally
window.GitHubErrorHandler = GitHubErrorHandler;
window.GitHubAPIError = GitHubAPIError;
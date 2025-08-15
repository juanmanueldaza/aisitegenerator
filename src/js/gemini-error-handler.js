/**
 * Comprehensive error handling for Gemini API
 * Implements retry logic, rate limiting, quota management, and fallback strategies
 */

// Error types and codes
export const GeminiErrorTypes = {
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    CONTENT_POLICY_VIOLATION: 'CONTENT_POLICY_VIOLATION',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_REQUEST: 'INVALID_REQUEST',
    CONTENT_TOO_LARGE: 'CONTENT_TOO_LARGE',
    UNSUPPORTED_CONTENT: 'UNSUPPORTED_CONTENT',
    REGION_RESTRICTED: 'REGION_RESTRICTED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Error configurations
export const ErrorConfig = {
    maxRetries: 3,
    baseRetryDelay: 1000, // 1 second
    maxRetryDelay: 30000, // 30 seconds
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000, // 1 minute
    rateLimitResetTime: 60000, // 1 minute
    quotaWarningThreshold: 0.8 // 80% of quota
};

export class GeminiError extends Error {
    constructor(type, message, originalError = null, retryable = false, retryAfter = null) {
        super(message);
        this.name = 'GeminiError';
        this.type = type;
        this.originalError = originalError;
        this.retryable = retryable;
        this.retryAfter = retryAfter;
        this.timestamp = new Date();
    }

    toUserMessage() {
        const userMessages = {
            [GeminiErrorTypes.AUTHENTICATION_ERROR]: {
                title: 'Authentication Error',
                message: 'There\'s an issue with your API credentials. Please check your API key and try again.',
                actions: ['Check API key configuration', 'Contact support if the issue persists']
            },
            [GeminiErrorTypes.RATE_LIMIT_EXCEEDED]: {
                title: 'Rate Limit Exceeded',
                message: 'You\'ve sent too many requests too quickly. Please wait a moment before trying again.',
                actions: ['Wait a few seconds and retry', 'Consider upgrading your plan for higher limits']
            },
            [GeminiErrorTypes.QUOTA_EXCEEDED]: {
                title: 'Quota Exceeded',
                message: 'You\'ve reached your monthly usage limit. Your quota will reset next month.',
                actions: ['Wait for quota reset', 'Upgrade your plan for higher limits', 'Use offline mode for basic functionality']
            },
            [GeminiErrorTypes.CONTENT_POLICY_VIOLATION]: {
                title: 'Content Policy Violation',
                message: 'Your request contains content that violates our content policy. Please modify your request.',
                actions: ['Review and modify your content', 'Check our content guidelines', 'Try a different approach']
            },
            [GeminiErrorTypes.SERVICE_UNAVAILABLE]: {
                title: 'Service Temporarily Unavailable',
                message: 'The AI service is temporarily unavailable. We\'re working to restore it.',
                actions: ['Try again in a few minutes', 'Use cached suggestions if available', 'Continue with manual editing']
            },
            [GeminiErrorTypes.NETWORK_ERROR]: {
                title: 'Connection Error',
                message: 'Unable to connect to the AI service. Please check your internet connection.',
                actions: ['Check your internet connection', 'Retry the request', 'Use offline mode if available']
            },
            [GeminiErrorTypes.CONTENT_TOO_LARGE]: {
                title: 'Content Too Large',
                message: 'Your request is too large. Please try with shorter content or break it into smaller parts.',
                actions: ['Reduce content length', 'Split into multiple requests', 'Use a more concise description']
            },
            [GeminiErrorTypes.INVALID_REQUEST]: {
                title: 'Invalid Request',
                message: 'There\'s an issue with your request format. Please try again with different input.',
                actions: ['Modify your request', 'Try a different approach', 'Contact support if the issue persists']
            }
        };

        return userMessages[this.type] || {
            title: 'Unexpected Error',
            message: 'An unexpected error occurred. Please try again.',
            actions: ['Retry your request', 'Contact support if the issue persists']
        };
    }
}

export class CircuitBreaker {
    constructor(threshold = ErrorConfig.circuitBreakerThreshold, timeout = ErrorConfig.circuitBreakerTimeout) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    canExecute() {
        if (this.state === 'CLOSED') {
            return true;
        }

        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.timeout) {
                this.state = 'HALF_OPEN';
                return true;
            }
            return false;
        }

        // HALF_OPEN state
        return true;
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
        }
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            timeUntilRetry: this.state === 'OPEN' 
                ? Math.max(0, this.timeout - (Date.now() - this.lastFailureTime))
                : 0
        };
    }
}

export class RateLimiter {
    constructor() {
        this.requests = [];
        this.quotaUsage = {
            requestsToday: 0,
            tokensToday: 0,
            lastReset: new Date().toDateString()
        };
    }

    canMakeRequest() {
        this.cleanOldRequests();
        
        // Check rate limits (requests per minute)
        const recentRequests = this.requests.filter(
            time => Date.now() - time < 60000
        );

        return recentRequests.length < 60; // 60 requests per minute limit
    }

    recordRequest(tokenCount = 0) {
        const now = Date.now();
        this.requests.push(now);
        
        // Update daily quota
        const today = new Date().toDateString();
        if (this.quotaUsage.lastReset !== today) {
            this.quotaUsage.requestsToday = 0;
            this.quotaUsage.tokensToday = 0;
            this.quotaUsage.lastReset = today;
        }
        
        this.quotaUsage.requestsToday++;
        this.quotaUsage.tokensToday += tokenCount;
    }

    getWaitTime() {
        if (this.canMakeRequest()) {
            return 0;
        }

        const oldestRecentRequest = Math.min(...this.requests.filter(
            time => Date.now() - time < 60000
        ));
        
        return Math.max(0, 60000 - (Date.now() - oldestRecentRequest));
    }

    cleanOldRequests() {
        const cutoff = Date.now() - 60000;
        this.requests = this.requests.filter(time => time > cutoff);
    }

    getUsageStats() {
        return {
            ...this.quotaUsage,
            recentRequestsPerMinute: this.requests.filter(
                time => Date.now() - time < 60000
            ).length
        };
    }
}

export class RetryManager {
    constructor(maxRetries = ErrorConfig.maxRetries) {
        this.maxRetries = maxRetries;
    }

    async executeWithRetry(operation, context = {}) {
        let lastError;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await operation();
                return result;
            } catch (error) {
                lastError = error;
                
                if (!error.retryable || attempt === this.maxRetries) {
                    throw error;
                }

                const delay = this.calculateBackoffDelay(attempt, error.retryAfter);
                
                // Notify about retry attempt
                if (context.onRetry) {
                    context.onRetry(attempt + 1, delay, error);
                }

                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    calculateBackoffDelay(attempt, retryAfter = null) {
        if (retryAfter) {
            return retryAfter * 1000; // Convert to milliseconds
        }

        // Exponential backoff with jitter
        const baseDelay = ErrorConfig.baseRetryDelay;
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
        
        return Math.min(exponentialDelay + jitter, ErrorConfig.maxRetryDelay);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export function parseGeminiError(error) {
    // Handle different types of errors from Gemini API
    if (!error.response && !error.status) {
        // Network error
        return new GeminiError(
            GeminiErrorTypes.NETWORK_ERROR,
            'Network connection failed',
            error,
            true
        );
    }

    const status = error.status || error.response?.status;
    const data = error.response?.data || error.data || {};
    const message = data.message || error.message || 'Unknown error';

    switch (status) {
    case 401:
    case 403:
        return new GeminiError(
            GeminiErrorTypes.AUTHENTICATION_ERROR,
            'Authentication failed: ' + message,
            error,
            false
        );

    case 429: {
        const retryAfter = error.response?.headers?.['retry-after'];
        return new GeminiError(
            GeminiErrorTypes.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded: ' + message,
            error,
            true,
            retryAfter ? parseInt(retryAfter) : null
        );
    }

    case 413:
        return new GeminiError(
            GeminiErrorTypes.CONTENT_TOO_LARGE,
            'Content too large: ' + message,
            error,
            false
        );

    case 400:
        if (message.toLowerCase().includes('content policy')) {
            return new GeminiError(
                GeminiErrorTypes.CONTENT_POLICY_VIOLATION,
                'Content policy violation: ' + message,
                error,
                false
            );
        }
        return new GeminiError(
            GeminiErrorTypes.INVALID_REQUEST,
            'Invalid request: ' + message,
            error,
            false
        );

    case 500:
    case 502:
    case 503:
    case 504:
        return new GeminiError(
            GeminiErrorTypes.SERVICE_UNAVAILABLE,
            'Service temporarily unavailable: ' + message,
            error,
            true
        );

    default:
        return new GeminiError(
            GeminiErrorTypes.UNKNOWN_ERROR,
            'Unknown error: ' + message,
            error,
            status >= 500 // Retry server errors
        );
    }
}

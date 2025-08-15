/**
 * Comprehensive tests for Gemini API error handling
 */

import { 
    GeminiError, 
    GeminiErrorTypes, 
    CircuitBreaker, 
    RateLimiter, 
    RetryManager, 
    parseGeminiError 
} from '../src/js/gemini-error-handler.js';

describe('GeminiError', () => {
    test('should create error with correct properties', () => {
        const error = new GeminiError(
            GeminiErrorTypes.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded',
            null,
            true,
            60
        );

        expect(error.type).toBe(GeminiErrorTypes.RATE_LIMIT_EXCEEDED);
        expect(error.message).toBe('Rate limit exceeded');
        expect(error.retryable).toBe(true);
        expect(error.retryAfter).toBe(60);
        expect(error.timestamp).toBeInstanceOf(Date);
    });

    test('should generate correct user message for authentication error', () => {
        const error = new GeminiError(
            GeminiErrorTypes.AUTHENTICATION_ERROR,
            'Invalid API key'
        );

        const userMessage = error.toUserMessage();
        expect(userMessage.title).toBe('Authentication Error');
        expect(userMessage.message).toContain('API credentials');
        expect(userMessage.actions).toContain('Check API key configuration');
    });

    test('should generate correct user message for rate limit error', () => {
        const error = new GeminiError(
            GeminiErrorTypes.RATE_LIMIT_EXCEEDED,
            'Too many requests'
        );

        const userMessage = error.toUserMessage();
        expect(userMessage.title).toBe('Rate Limit Exceeded');
        expect(userMessage.message).toContain('too many requests');
        expect(userMessage.actions).toContain('Wait a few seconds and retry');
    });

    test('should generate correct user message for quota exceeded', () => {
        const error = new GeminiError(
            GeminiErrorTypes.QUOTA_EXCEEDED,
            'Monthly limit reached'
        );

        const userMessage = error.toUserMessage();
        expect(userMessage.title).toBe('Quota Exceeded');
        expect(userMessage.message).toContain('monthly usage limit');
        expect(userMessage.actions).toContain('Upgrade your plan for higher limits');
    });

    test('should generate fallback message for unknown error type', () => {
        const error = new GeminiError('UNKNOWN_TYPE', 'Unknown error');
        const userMessage = error.toUserMessage();
        
        expect(userMessage.title).toBe('Unexpected Error');
        expect(userMessage.message).toContain('unexpected error');
    });
});

describe('CircuitBreaker', () => {
    let circuitBreaker;

    beforeEach(() => {
        circuitBreaker = new CircuitBreaker(3, 5000); // 3 failures, 5s timeout
    });

    test('should start in CLOSED state', () => {
        expect(circuitBreaker.canExecute()).toBe(true);
        expect(circuitBreaker.getState().state).toBe('CLOSED');
    });

    test('should remain CLOSED after success', () => {
        circuitBreaker.onSuccess();
        expect(circuitBreaker.getState().state).toBe('CLOSED');
        expect(circuitBreaker.getState().failureCount).toBe(0);
    });

    test('should increment failure count on failure', () => {
        circuitBreaker.onFailure();
        expect(circuitBreaker.getState().failureCount).toBe(1);
        expect(circuitBreaker.getState().state).toBe('CLOSED');
    });

    test('should open circuit after threshold failures', () => {
        // Trigger failures up to threshold
        for (let i = 0; i < 3; i++) {
            circuitBreaker.onFailure();
        }
        
        expect(circuitBreaker.getState().state).toBe('OPEN');
        expect(circuitBreaker.canExecute()).toBe(false);
    });

    test('should transition to HALF_OPEN after timeout', (done) => {
        // Open the circuit
        for (let i = 0; i < 3; i++) {
            circuitBreaker.onFailure();
        }
        
        expect(circuitBreaker.getState().state).toBe('OPEN');
        
        // Wait for timeout (using shorter timeout for test)
        circuitBreaker = new CircuitBreaker(3, 100);
        for (let i = 0; i < 3; i++) {
            circuitBreaker.onFailure();
        }
        
        setTimeout(() => {
            expect(circuitBreaker.canExecute()).toBe(true);
            // State would transition to HALF_OPEN on canExecute call
            done();
        }, 150);
    });

    test('should reset on success in HALF_OPEN state', () => {
        // Open circuit
        for (let i = 0; i < 3; i++) {
            circuitBreaker.onFailure();
        }
        
        // Manually set to HALF_OPEN
        circuitBreaker.state = 'HALF_OPEN';
        
        // Success should reset
        circuitBreaker.onSuccess();
        expect(circuitBreaker.getState().state).toBe('CLOSED');
        expect(circuitBreaker.getState().failureCount).toBe(0);
    });
});

describe('RateLimiter', () => {
    let rateLimiter;

    beforeEach(() => {
        rateLimiter = new RateLimiter();
    });

    test('should allow requests initially', () => {
        expect(rateLimiter.canMakeRequest()).toBe(true);
        expect(rateLimiter.getWaitTime()).toBe(0);
    });

    test('should record requests', () => {
        rateLimiter.recordRequest(100);
        const stats = rateLimiter.getUsageStats();
        
        expect(stats.requestsToday).toBe(1);
        expect(stats.tokensToday).toBe(100);
    });

    test('should enforce rate limits', () => {
        // Make maximum allowed requests per minute
        for (let i = 0; i < 60; i++) {
            rateLimiter.recordRequest();
        }
        
        expect(rateLimiter.canMakeRequest()).toBe(false);
        expect(rateLimiter.getWaitTime()).toBeGreaterThan(0);
    });

    test('should clean old requests', () => {
        // Add old request (simulate by manipulating internal state)
        rateLimiter.requests.push(Date.now() - 120000); // 2 minutes ago
        rateLimiter.recordRequest();
        
        expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    test('should reset daily quota', () => {
        rateLimiter.recordRequest(100);
        
        // Simulate new day
        rateLimiter.quotaUsage.lastReset = '2023-01-01';
        rateLimiter.recordRequest(50);
        
        const stats = rateLimiter.getUsageStats();
        expect(stats.requestsToday).toBe(1);
        expect(stats.tokensToday).toBe(50);
    });
});

describe('RetryManager', () => {
    let retryManager;

    beforeEach(() => {
        retryManager = new RetryManager(3);
    });

    test('should execute operation successfully on first try', async () => {
        const operation = jest.fn().mockResolvedValue('success');
        
        const result = await retryManager.executeWithRetry(operation);
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on retryable errors', async () => {
        const error = new GeminiError(
            GeminiErrorTypes.SERVICE_UNAVAILABLE,
            'Service unavailable',
            null,
            true
        );
        
        const operation = jest.fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValue('success');
        
        const result = await retryManager.executeWithRetry(operation);
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
    });

    test('should not retry on non-retryable errors', async () => {
        const error = new GeminiError(
            GeminiErrorTypes.AUTHENTICATION_ERROR,
            'Invalid API key',
            null,
            false
        );
        
        const operation = jest.fn().mockRejectedValue(error);
        
        await expect(retryManager.executeWithRetry(operation))
            .rejects.toThrow('Invalid API key');
        
        expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should exhaust retries and throw last error', async () => {
        const error = new GeminiError(
            GeminiErrorTypes.SERVICE_UNAVAILABLE,
            'Service unavailable',
            null,
            true
        );
        
        const operation = jest.fn().mockRejectedValue(error);
        
        await expect(retryManager.executeWithRetry(operation))
            .rejects.toThrow('Service unavailable');
        
        expect(operation).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    test('should call onRetry callback', async () => {
        const error = new GeminiError(
            GeminiErrorTypes.SERVICE_UNAVAILABLE,
            'Service unavailable',
            null,
            true
        );
        
        const operation = jest.fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValue('success');
        
        const onRetry = jest.fn();
        
        await retryManager.executeWithRetry(operation, { onRetry });
        
        expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number), error);
    });

    test('should calculate correct backoff delays', () => {
        expect(retryManager.calculateBackoffDelay(0)).toBeGreaterThanOrEqual(1000);
        expect(retryManager.calculateBackoffDelay(1)).toBeGreaterThanOrEqual(2000);
        expect(retryManager.calculateBackoffDelay(2)).toBeGreaterThanOrEqual(4000);
        
        // Should respect retryAfter
        expect(retryManager.calculateBackoffDelay(0, 5)).toBe(5000);
    });

    test('should respect maximum delay', () => {
        const delay = retryManager.calculateBackoffDelay(10); // Large attempt number
        expect(delay).toBeLessThanOrEqual(30000); // Max delay
    });
});

describe('parseGeminiError', () => {
    test('should parse network errors', () => {
        const networkError = new Error('Network failed');
        const geminiError = parseGeminiError(networkError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.NETWORK_ERROR);
        expect(geminiError.retryable).toBe(true);
    });

    test('should parse authentication errors (401)', () => {
        const authError = {
            response: { status: 401, data: { message: 'Unauthorized' } }
        };
        
        const geminiError = parseGeminiError(authError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.AUTHENTICATION_ERROR);
        expect(geminiError.retryable).toBe(false);
    });

    test('should parse rate limit errors (429)', () => {
        const rateLimitError = {
            response: { 
                status: 429, 
                data: { message: 'Too Many Requests' },
                headers: { 'retry-after': '60' }
            }
        };
        
        const geminiError = parseGeminiError(rateLimitError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.RATE_LIMIT_EXCEEDED);
        expect(geminiError.retryable).toBe(true);
        expect(geminiError.retryAfter).toBe(60);
    });

    test('should parse content too large errors (413)', () => {
        const contentError = {
            response: { status: 413, data: { message: 'Payload Too Large' } }
        };
        
        const geminiError = parseGeminiError(contentError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.CONTENT_TOO_LARGE);
        expect(geminiError.retryable).toBe(false);
    });

    test('should parse content policy violations', () => {
        const policyError = {
            response: { 
                status: 400, 
                data: { message: 'Content policy violation detected' } 
            }
        };
        
        const geminiError = parseGeminiError(policyError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.CONTENT_POLICY_VIOLATION);
        expect(geminiError.retryable).toBe(false);
    });

    test('should parse server errors as service unavailable', () => {
        const serverError = {
            response: { status: 503, data: { message: 'Service Unavailable' } }
        };
        
        const geminiError = parseGeminiError(serverError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.SERVICE_UNAVAILABLE);
        expect(geminiError.retryable).toBe(true);
    });

    test('should handle unknown errors', () => {
        const unknownError = {
            response: { status: 418, data: { message: 'I\'m a teapot' } }
        };
        
        const geminiError = parseGeminiError(unknownError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.UNKNOWN_ERROR);
        expect(geminiError.retryable).toBe(false); // 418 is not a server error
    });

    test('should handle errors without response data', () => {
        const simpleError = { status: 500 };
        const geminiError = parseGeminiError(simpleError);
        
        expect(geminiError.type).toBe(GeminiErrorTypes.SERVICE_UNAVAILABLE);
        expect(geminiError.message).toContain('Unknown error');
    });
});

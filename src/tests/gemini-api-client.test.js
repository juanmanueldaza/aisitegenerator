/**
 * Tests for Gemini API Client with error handling
 */

import { GeminiApiClient } from '../src/js/gemini-api-client.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('GeminiApiClient', () => {
    let client;
    let mockEventHandlers;

    beforeEach(() => {
        client = new GeminiApiClient({
            apiKey: 'test-api-key',
            fallbackEnabled: true
        });
        
        mockEventHandlers = {
            error: jest.fn(),
            retry: jest.fn(),
            rateLimit: jest.fn(),
            quotaWarning: jest.fn(),
            fallback: jest.fn()
        };

        // Set up event handlers
        Object.keys(mockEventHandlers).forEach(event => {
            client.on(event, mockEventHandlers[event]);
        });

        // Reset fetch mock
        fetch.mockClear();
    });

    describe('Configuration', () => {
        test('should initialize with default configuration', () => {
            const defaultClient = new GeminiApiClient();
            expect(defaultClient.apiKey).toBeNull();
            expect(defaultClient.model).toBe('gemini-pro');
            expect(defaultClient.fallbackEnabled).toBe(true);
        });

        test('should set API key', () => {
            client.setApiKey('new-api-key');
            expect(client.apiKey).toBe('new-api-key');
        });

        test('should enable/disable offline mode', () => {
            client.enableOfflineMode();
            expect(client.offlineMode).toBe(true);
            
            client.disableOfflineMode();
            expect(client.offlineMode).toBe(false);
        });
    });

    describe('Event Handling', () => {
        test('should register and emit events', () => {
            const handler = jest.fn();
            client.on('error', handler);
            
            const errorData = { error: new Error('test'), context: {} };
            client.emit('error', errorData);
            
            expect(handler).toHaveBeenCalledWith(errorData);
        });
    });

    describe('Content Generation', () => {
        test('should generate content successfully', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Generated content' }]
                        }
                    }]
                })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            const result = await client.generateContent('Test prompt');
            
            expect(result.text).toBe('Generated content');
            expect(result.metadata.model).toBe('gemini-pro');
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('generativelanguage.googleapis.com'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'x-goog-api-key': 'test-api-key'
                    })
                })
            );
        });

        test('should throw authentication error when API key is missing', async () => {
            client.setApiKey(null);
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
        });

        test('should handle HTTP error responses', async () => {
            const mockResponse = {
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                json: () => Promise.resolve({ message: 'Rate limit exceeded' })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
        });

        test('should handle network errors', async () => {
            fetch.mockRejectedValue(new Error('Network error'));
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
        });

        test('should handle invalid response format', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
        });
    });

    describe('Specialized Generation Methods', () => {
        beforeEach(() => {
            // Mock successful response
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Generated content' }]
                        }
                    }]
                })
            };
            fetch.mockResolvedValue(mockResponse);
        });

        test('should generate website structure', async () => {
            const result = await client.generateWebsiteStructure('E-commerce site');
            
            expect(result.text).toBe('Generated content');
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('E-commerce site')
                })
            );
        });

        test('should generate page content', async () => {
            const result = await client.generatePageContent('homepage', 'Modern design');
            
            expect(result.text).toBe('Generated content');
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('homepage')
                })
            );
        });

        test('should optimize content', async () => {
            const result = await client.optimizeContent('Original content', 'SEO');
            
            expect(result.text).toBe('Generated content');
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('Original content')
                })
            );
        });
    });

    describe('Circuit Breaker Integration', () => {
        test('should prevent requests when circuit breaker is open', async () => {
            // Force circuit breaker to open state
            for (let i = 0; i < 5; i++) {
                client.circuitBreaker.onFailure();
            }
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
            
            expect(fetch).not.toHaveBeenCalled();
            expect(mockEventHandlers.error).toHaveBeenCalled();
        });

        test('should reset circuit breaker on success', async () => {
            // Simulate some failures
            client.circuitBreaker.onFailure();
            client.circuitBreaker.onFailure();
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Success' }]
                        }
                    }]
                })
            };
            fetch.mockResolvedValue(mockResponse);
            
            await client.generateContent('Test');
            
            expect(client.circuitBreaker.getState().failureCount).toBe(0);
            expect(client.circuitBreaker.getState().state).toBe('CLOSED');
        });
    });

    describe('Rate Limiting', () => {
        test('should enforce rate limits', async () => {
            // Simulate hitting rate limit
            for (let i = 0; i < 60; i++) {
                client.rateLimiter.recordRequest();
            }
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Success' }]
                        }
                    }]
                })
            };
            fetch.mockResolvedValue(mockResponse);
            
            // This should still work but with delay
            const result = await client.generateContent('Test');
            expect(result.text).toBe('Success');
        });

        test('should emit rate limit events', async () => {
            // Simulate hitting rate limit
            for (let i = 0; i < 60; i++) {
                client.rateLimiter.recordRequest();
            }
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Success' }]
                        }
                    }]
                })
            };
            fetch.mockResolvedValue(mockResponse);
            
            await client.generateContent('Test');
            
            expect(mockEventHandlers.rateLimit).toHaveBeenCalled();
        });
    });

    describe('Retry Logic', () => {
        test('should retry on retryable errors', async () => {
            fetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValue({
                    ok: true,
                    json: () => Promise.resolve({
                        candidates: [{
                            content: {
                                parts: [{ text: 'Success after retry' }]
                            }
                        }]
                    })
                });
            
            const result = await client.generateContent('Test');
            
            expect(result.text).toBe('Success after retry');
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(mockEventHandlers.retry).toHaveBeenCalled();
        });

        test('should not retry on non-retryable errors', async () => {
            const mockResponse = {
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ message: 'Invalid API key' })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
            
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('Caching', () => {
        test('should cache successful responses', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Cached content' }]
                        }
                    }]
                })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            // First request
            await client.generateContent('Test prompt', { cache: true });
            
            // Second request should use cache if fallback is triggered
            // Simulate service unavailable to trigger fallback
            fetch.mockRejectedValue(new Error('Service unavailable'));
            
            const result = await client.generateContent('Test prompt', { cache: true });
            
            expect(result.text).toBe('Cached content');
            expect(mockEventHandlers.fallback).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'cache_fallback' })
            );
        });

        test('should clear cache', () => {
            client.cache.set('test', 'value');
            expect(client.cache.size).toBe(1);
            
            client.clearCache();
            expect(client.cache.size).toBe(0);
        });
    });

    describe('Offline Mode', () => {
        test('should return offline fallback when in offline mode', async () => {
            client.enableOfflineMode();
            
            const result = await client.generateContent('Test prompt');
            
            expect(result.text).toContain('offline mode');
            expect(result.metadata.source).toBe('offline_template');
            expect(fetch).not.toHaveBeenCalled();
        });

        test('should generate appropriate fallback based on type', async () => {
            client.enableOfflineMode();
            
            const structureResult = await client.generateWebsiteStructure('Test');
            expect(structureResult.text).toContain('website structure');
            
            const contentResult = await client.generatePageContent('home', 'Test');
            expect(contentResult.text).toContain('content outline');
        });
    });

    describe('Fallback Strategies', () => {
        test('should use fallback on service unavailable error', async () => {
            const mockResponse = {
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
                json: () => Promise.resolve({ message: 'Service down' })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            const result = await client.generateContent('Test prompt');
            
            expect(result.text).toContain('offline mode');
            expect(mockEventHandlers.fallback).toHaveBeenCalled();
        });

        test('should not use fallback for non-fallback errors', async () => {
            const mockResponse = {
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ message: 'Invalid API key' })
            };
            
            fetch.mockResolvedValue(mockResponse);
            
            await expect(client.generateContent('Test'))
                .rejects.toThrow(GeminiError);
            
            expect(mockEventHandlers.fallback).not.toHaveBeenCalled();
        });
    });

    describe('Status and Monitoring', () => {
        test('should return correct status information', () => {
            const status = client.getStatus();
            
            expect(status).toHaveProperty('circuitBreaker');
            expect(status).toHaveProperty('rateLimiter');
            expect(status).toHaveProperty('offlineMode');
            expect(status).toHaveProperty('cacheSize');
            expect(status).toHaveProperty('apiKeyConfigured');
            
            expect(status.apiKeyConfigured).toBe(true);
            expect(status.offlineMode).toBe(false);
        });

        test('should emit quota warnings', async () => {
            // Simulate high usage
            for (let i = 0; i < 850; i++) {
                client.rateLimiter.recordRequest();
            }
            
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Success' }]
                        }
                    }]
                })
            };
            fetch.mockResolvedValue(mockResponse);
            
            await client.generateContent('Test');
            
            expect(mockEventHandlers.quotaWarning).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'daily_requests',
                    percentage: expect.any(Number)
                })
            );
        });
    });

    describe('Prompt Building', () => {
        test('should build website structure prompt correctly', () => {
            const prompt = client.buildWebsiteStructurePrompt('E-commerce site', {
                style: 'modern',
                audience: 'millennials',
                industry: 'fashion'
            });
            
            expect(prompt).toContain('E-commerce site');
            expect(prompt).toContain('modern');
            expect(prompt).toContain('millennials');
            expect(prompt).toContain('fashion');
        });

        test('should build page content prompt correctly', () => {
            const prompt = client.buildPageContentPrompt('homepage', 'Clean design', {
                tone: 'friendly',
                length: 'long'
            });
            
            expect(prompt).toContain('homepage');
            expect(prompt).toContain('Clean design');
            expect(prompt).toContain('friendly');
            expect(prompt).toContain('long');
        });

        test('should build optimization prompt correctly', () => {
            const prompt = client.buildOptimizationPrompt('Original content', 'SEO', {
                target: 'search engines'
            });
            
            expect(prompt).toContain('Original content');
            expect(prompt).toContain('SEO');
            expect(prompt).toContain('search engines');
        });
    });

    describe('Utility Methods', () => {
        test('should generate unique request IDs', () => {
            const id1 = client.generateRequestId();
            const id2 = client.generateRequestId();
            
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });

        test('should estimate token count', () => {
            const count = client.estimateTokenCount('Hello world');
            expect(count).toBeGreaterThan(0);
            expect(typeof count).toBe('number');
        });

        test('should reset circuit breaker', () => {
            client.circuitBreaker.onFailure();
            client.resetCircuitBreaker();
            
            expect(client.circuitBreaker.getState().failureCount).toBe(0);
            expect(client.circuitBreaker.getState().state).toBe('CLOSED');
        });
    });
});

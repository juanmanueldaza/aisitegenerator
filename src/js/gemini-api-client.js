/**
 * Gemini API Client with comprehensive error handling, rate limiting, and fallback strategies
 */

import { 
    GeminiError, 
    GeminiErrorTypes, 
    CircuitBreaker, 
    RateLimiter, 
    RetryManager, 
    parseGeminiError 
} from './gemini-error-handler.js';

export class GeminiApiClient {
    constructor(config = {}) {
        this.apiKey = config.apiKey || null;
        this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
        this.model = config.model || 'gemini-pro';
        
        // Error handling components
        this.circuitBreaker = new CircuitBreaker();
        this.rateLimiter = new RateLimiter();
        this.retryManager = new RetryManager();
        
        // Fallback and caching
        this.cache = new Map();
        this.fallbackEnabled = config.fallbackEnabled !== false;
        this.offlineMode = false;
        
        // Event handlers
        this.eventHandlers = {
            error: [],
            retry: [],
            rateLimit: [],
            quotaWarning: [],
            fallback: []
        };

        // Request queue for rate limiting
        this.requestQueue = [];
        this.processingQueue = false;
    }

    // Configuration methods
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    enableOfflineMode() {
        this.offlineMode = true;
        this.emit('fallback', { type: 'offline_mode_enabled' });
    }

    disableOfflineMode() {
        this.offlineMode = false;
    }

    // Event handling
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }

    // Main API methods
    async generateContent(prompt, options = {}) {
        if (this.offlineMode) {
            return this.handleOfflineRequest(prompt, options);
        }

        const requestData = {
            prompt,
            options,
            timestamp: Date.now(),
            id: this.generateRequestId()
        };

        return this.executeWithErrorHandling(
            () => this.makeGenerateRequest(requestData),
            requestData
        );
    }

    async generateWebsiteStructure(description, options = {}) {
        const prompt = this.buildWebsiteStructurePrompt(description, options);
        return this.generateContent(prompt, { ...options, type: 'website_structure' });
    }

    async generatePageContent(pageType, requirements, options = {}) {
        const prompt = this.buildPageContentPrompt(pageType, requirements, options);
        return this.generateContent(prompt, { ...options, type: 'page_content' });
    }

    async optimizeContent(content, optimization, options = {}) {
        const prompt = this.buildOptimizationPrompt(content, optimization, options);
        return this.generateContent(prompt, { ...options, type: 'content_optimization' });
    }

    // Core request execution with error handling
    async executeWithErrorHandling(operation, context) {
        // Check circuit breaker
        if (!this.circuitBreaker.canExecute()) {
            const state = this.circuitBreaker.getState();
            const error = new GeminiError(
                GeminiErrorTypes.SERVICE_UNAVAILABLE,
                `Service circuit breaker is open. Retry in ${Math.ceil(state.timeUntilRetry / 1000)} seconds.`,
                null,
                true,
                Math.ceil(state.timeUntilRetry / 1000)
            );
            
            this.emit('error', { error, context });
            
            if (this.fallbackEnabled) {
                return this.handleFallback(context);
            }
            
            throw error;
        }

        // Check rate limiting
        if (!this.rateLimiter.canMakeRequest()) {
            const waitTime = this.rateLimiter.getWaitTime();
            
            this.emit('rateLimit', { waitTime, context });
            
            if (waitTime > 0) {
                await this.sleep(waitTime);
            }
        }

        try {
            const result = await this.retryManager.executeWithRetry(
                operation,
                {
                    onRetry: (attempt, delay, error) => {
                        this.emit('retry', { attempt, delay, error, context });
                    }
                }
            );

            this.circuitBreaker.onSuccess();
            this.rateLimiter.recordRequest(this.estimateTokenCount(context.prompt));
            
            // Cache successful responses
            if (context.options?.cache !== false) {
                this.cacheResponse(context, result);
            }

            // Check quota warnings
            this.checkQuotaWarnings();

            return result;

        } catch (error) {
            this.circuitBreaker.onFailure();
            
            const geminiError = error instanceof GeminiError ? error : parseGeminiError(error);
            this.emit('error', { error: geminiError, context });

            // Try fallback if available and appropriate
            if (this.fallbackEnabled && this.shouldUseFallback(geminiError)) {
                return this.handleFallback(context);
            }

            throw geminiError;
        }
    }

    // Core request implementation
    async makeGenerateRequest(requestData) {
        if (!this.apiKey) {
            throw new GeminiError(
                GeminiErrorTypes.AUTHENTICATION_ERROR,
                'API key is required',
                null,
                false
            );
        }

        const url = `${this.baseUrl}/models/${this.model}:generateContent`;
        
        const payload = {
            contents: [{
                parts: [{
                    text: requestData.prompt
                }]
            }],
            generationConfig: {
                temperature: requestData.options.temperature || 0.7,
                topP: requestData.options.topP || 0.8,
                topK: requestData.options.topK || 40,
                maxOutputTokens: requestData.options.maxTokens || 2048,
                ...requestData.options.generationConfig
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.response = { status: response.status, data: errorData };
                throw error;
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new GeminiError(
                    GeminiErrorTypes.INVALID_REQUEST,
                    'Invalid response format from API',
                    null,
                    false
                );
            }

            return {
                text: data.candidates[0].content.parts[0].text,
                metadata: {
                    requestId: requestData.id,
                    timestamp: requestData.timestamp,
                    model: this.model,
                    tokensUsed: this.estimateTokenCount(data.candidates[0].content.parts[0].text)
                }
            };

        } catch (error) {
            throw parseGeminiError(error);
        }
    }

    // Fallback and caching methods
    handleOfflineRequest(prompt, options) {
        const cached = this.getCachedResponse(prompt, options);
        if (cached) {
            this.emit('fallback', { type: 'cache_hit', prompt, options });
            return cached;
        }

        // Return offline fallback content
        const fallbackResponse = this.generateOfflineFallback(prompt, options);
        this.emit('fallback', { type: 'offline_fallback', prompt, options });
        return fallbackResponse;
    }

    async handleFallback(context) {
        // Try cached response first
        const cached = this.getCachedResponse(context.prompt, context.options);
        if (cached) {
            this.emit('fallback', { type: 'cache_fallback', context });
            return cached;
        }

        // Try offline mode
        if (this.fallbackEnabled) {
            this.emit('fallback', { type: 'offline_fallback', context });
            return this.generateOfflineFallback(context.prompt, context.options);
        }

        throw new GeminiError(
            GeminiErrorTypes.SERVICE_UNAVAILABLE,
            'Service unavailable and no fallback options available',
            null,
            true
        );
    }

    shouldUseFallback(error) {
        const fallbackErrorTypes = [
            GeminiErrorTypes.SERVICE_UNAVAILABLE,
            GeminiErrorTypes.NETWORK_ERROR,
            GeminiErrorTypes.RATE_LIMIT_EXCEEDED,
            GeminiErrorTypes.QUOTA_EXCEEDED
        ];
        
        return fallbackErrorTypes.includes(error.type);
    }

    generateOfflineFallback(prompt, options) {
        const type = options.type || 'general';
        
        const fallbackTemplates = {
            website_structure: {
                text: `Based on your description, here's a basic website structure:

1. Header with navigation
2. Hero section with main message
3. About section
4. Services/Products section
5. Contact section
6. Footer

This is a basic template. Once the AI service is available again, I can provide more detailed and customized suggestions.`,
                metadata: {
                    source: 'offline_template',
                    type: 'website_structure'
                }
            },
            page_content: {
                text: `Here's a basic content outline:

- Compelling headline
- Brief introduction
- Main content sections
- Call-to-action

For more detailed and personalized content, please try again when the AI service is available.`,
                metadata: {
                    source: 'offline_template',
                    type: 'page_content'
                }
            },
            general: {
                text: `I'm currently in offline mode and can't generate custom content. Here are some general suggestions:

- Focus on clear, concise messaging
- Use compelling headlines
- Include clear calls-to-action
- Ensure mobile-friendly design

Please try again when the AI service is available for personalized assistance.`,
                metadata: {
                    source: 'offline_template',
                    type: 'general'
                }
            }
        };

        return fallbackTemplates[type] || fallbackTemplates.general;
    }

    // Caching methods
    cacheResponse(context, response) {
        const key = this.generateCacheKey(context.prompt, context.options);
        this.cache.set(key, {
            response,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });
    }

    getCachedResponse(prompt, options) {
        const key = this.generateCacheKey(prompt, options);
        const cached = this.cache.get(key);
        
        if (cached && cached.expiresAt > Date.now()) {
            return cached.response;
        }
        
        if (cached) {
            this.cache.delete(key);
        }
        
        return null;
    }

    generateCacheKey(prompt, options) {
        const relevantOptions = {
            temperature: options.temperature,
            type: options.type
        };
        return btoa(JSON.stringify({ prompt: prompt.substring(0, 100), options: relevantOptions }));
    }

    // Utility methods
    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    estimateTokenCount(text) {
        // Rough estimation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    checkQuotaWarnings() {
        const usage = this.rateLimiter.getUsageStats();
        const dailyLimit = 1000; // Example daily limit
        
        if (usage.requestsToday / dailyLimit > 0.8) {
            this.emit('quotaWarning', {
                type: 'daily_requests',
                usage: usage.requestsToday,
                limit: dailyLimit,
                percentage: (usage.requestsToday / dailyLimit) * 100
            });
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Prompt building methods
    buildWebsiteStructurePrompt(description, options) {
        return `Create a detailed website structure for: ${description}

Please provide:
1. Recommended page hierarchy
2. Navigation structure
3. Key sections for each page
4. Content suggestions
5. Design considerations

Style: ${options.style || 'modern'}
Target audience: ${options.audience || 'general'}
Industry: ${options.industry || 'not specified'}`;
    }

    buildPageContentPrompt(pageType, requirements, options) {
        return `Generate content for a ${pageType} page with these requirements: ${requirements}

Please include:
1. Compelling headline
2. Engaging introduction
3. Main content sections
4. Call-to-action
5. SEO considerations

Tone: ${options.tone || 'professional'}
Length: ${options.length || 'medium'}`;
    }

    buildOptimizationPrompt(content, optimization, options) {
        return `Optimize this content for ${optimization}:

Original content:
${content}

Please provide:
1. Optimized version
2. Key improvements made
3. Additional suggestions
4. Best practices applied

Target: ${options.target || 'general audience'}`;
    }

    // Status and monitoring methods
    getStatus() {
        return {
            circuitBreaker: this.circuitBreaker.getState(),
            rateLimiter: this.rateLimiter.getUsageStats(),
            offlineMode: this.offlineMode,
            cacheSize: this.cache.size,
            apiKeyConfigured: !!this.apiKey
        };
    }

    clearCache() {
        this.cache.clear();
    }

    resetCircuitBreaker() {
        this.circuitBreaker.onSuccess();
    }
}

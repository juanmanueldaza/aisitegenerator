import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiConfig } from '../config/gemini';
import { GeminiRateLimiter } from '../utils/rateLimiter';
import { 
  GeminiConfig, 
  GeminiRequest, 
  GeminiResponse, 
  GeminiError,
  RateLimitInfo,
  UsageStats 
} from '../types/gemini';

/**
 * Gemini API Service with built-in rate limiting, error handling, and usage tracking
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;
  private rateLimiter: GeminiRateLimiter;
  private responseCache: Map<string, { response: GeminiResponse; expiry: number }>;

  constructor() {
    this.config = getGeminiConfig();
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.rateLimiter = new GeminiRateLimiter(this.config.maxRequestsPerMinute);
    this.responseCache = new Map();
  }

  /**
   * Generates text using the Gemini API with comprehensive error handling
   */
  async generateText(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      // Validate input
      this.validateRequest(request);

      // Check rate limits
      if (!this.rateLimiter.canMakeRequest()) {
        const timeUntilReset = this.rateLimiter.getTimeUntilReset();
        throw this.createError(
          'RATE_LIMITED',
          `Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`,
          { timeUntilReset }
        );
      }

      // Check cache for repeated requests
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }

      // Record the request
      this.rateLimiter.recordRequest();

      // Sanitize the prompt
      const sanitizedPrompt = this.sanitizePrompt(request.prompt);

      // Make the API call
      const model = this.genAI.getGenerativeModel({ model: this.config.model });
      const result = await model.generateContent(sanitizedPrompt);
      const response = await result.response;
      const text = response.text();

      // Estimate tokens used (rough approximation)
      const tokensUsed = this.estimateTokens(sanitizedPrompt + text);

      // Record token usage
      this.rateLimiter.recordTokenUsage(tokensUsed);

      const geminiResponse: GeminiResponse = {
        text: this.sanitizeResponse(text),
        tokensUsed,
        timestamp: Date.now(),
      };

      // Cache the response
      this.cacheResponse(cacheKey, geminiResponse);

      return geminiResponse;

    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: GeminiRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw this.createError('INVALID_REQUEST', 'Prompt cannot be empty');
    }

    if (request.prompt.length > this.config.maxTokensPerRequest * 4) { // Rough estimate
      throw this.createError(
        'PROMPT_TOO_LONG',
        `Prompt is too long. Maximum estimated tokens: ${this.config.maxTokensPerRequest}`
      );
    }
  }

  /**
   * Sanitizes the input prompt to remove potential security risks
   */
  private sanitizePrompt(prompt: string): string {
    // Remove potential injection attempts and clean the input
    return prompt
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .trim();
  }

  /**
   * Sanitizes the API response
   */
  private sanitizeResponse(response: string): string {
    // Basic sanitization of the response
    return response
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .trim();
  }

  /**
   * Generates a cache key for the request
   */
  private generateCacheKey(request: GeminiRequest): string {
    const key = JSON.stringify({
      prompt: request.prompt,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      model: this.config.model,
    });
    return btoa(key); // Base64 encode for storage
  }

  /**
   * Gets a cached response if available and not expired
   */
  private getCachedResponse(cacheKey: string): GeminiResponse | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.response;
    }
    
    if (cached) {
      this.responseCache.delete(cacheKey); // Remove expired cache
    }
    
    return null;
  }

  /**
   * Caches a response for 5 minutes
   */
  private cacheResponse(cacheKey: string, response: GeminiResponse): void {
    const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes
    this.responseCache.set(cacheKey, { response, expiry });

    // Clean up old cache entries periodically
    if (this.responseCache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Removes expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now >= value.expiry) {
        this.responseCache.delete(key);
      }
    }
  }

  /**
   * Estimates token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Very rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Handles API errors and converts them to GeminiError
   */
  private handleApiError(error: any): GeminiError {
    if (error.code) {
      // Already a GeminiError
      return error;
    }

    // Handle different types of errors
    if (error.message?.includes('API key')) {
      return this.createError(
        'INVALID_API_KEY',
        'Invalid API key. Please check your VITE_GEMINI_API_KEY configuration.',
        error
      );
    }

    if (error.message?.includes('quota')) {
      return this.createError(
        'QUOTA_EXCEEDED',
        'API quota exceeded. Please check your billing and usage limits.',
        error
      );
    }

    if (error.message?.includes('rate limit')) {
      return this.createError(
        'RATE_LIMITED',
        'Rate limit exceeded. Please wait before making more requests.',
        error
      );
    }

    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return this.createError(
        'NETWORK_ERROR',
        'Network error. Please check your internet connection.',
        error
      );
    }

    // Generic error
    return this.createError(
      'UNKNOWN_ERROR',
      error.message || 'An unknown error occurred while calling the Gemini API.',
      error
    );
  }

  /**
   * Creates a standardized error object
   */
  private createError(code: string, message: string, details?: any): GeminiError {
    return { code, message, details };
  }

  /**
   * Gets current rate limit information
   */
  getRateLimitInfo(): RateLimitInfo {
    return this.rateLimiter.getRateLimitInfo();
  }

  /**
   * Gets usage statistics
   */
  getUsageStats(): UsageStats {
    return this.rateLimiter.getUsageStats();
  }

  /**
   * Checks if the service is properly configured
   */
  isConfigured(): boolean {
    try {
      return !!this.config.apiKey;
    } catch {
      return false;
    }
  }

  /**
   * Gets the current configuration (without sensitive data)
   */
  getConfig(): Omit<GeminiConfig, 'apiKey'> {
    return {
      model: this.config.model,
      maxRequestsPerMinute: this.config.maxRequestsPerMinute,
      maxTokensPerRequest: this.config.maxTokensPerRequest,
      environment: this.config.environment,
    };
  }
}
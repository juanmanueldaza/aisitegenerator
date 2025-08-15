import { RateLimitInfo, UsageStats } from '../types/gemini';

/**
 * Storage keys for rate limiting and usage tracking
 */
const STORAGE_KEYS = {
  RATE_LIMIT: 'gemini_rate_limit',
  USAGE_STATS: 'gemini_usage_stats',
} as const;

/**
 * Rate limiter for Gemini API requests
 */
export class GeminiRateLimiter {
  private maxRequestsPerMinute: number;

  constructor(maxRequestsPerMinute: number) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
  }

  /**
   * Checks if a request can be made based on rate limits
   */
  canMakeRequest(): boolean {
    const rateLimitInfo = this.getRateLimitInfo();
    return rateLimitInfo.requestsRemaining > 0;
  }

  /**
   * Records a request and updates rate limit info
   */
  recordRequest(): void {
    const now = Date.now();
    const rateLimitInfo = this.getRateLimitInfo();
    
    rateLimitInfo.totalRequests += 1;
    rateLimitInfo.requestsRemaining = Math.max(0, rateLimitInfo.requestsRemaining - 1);
    
    this.saveRateLimitInfo(rateLimitInfo);
    this.updateUsageStats();
  }

  /**
   * Gets current rate limit information
   */
  getRateLimitInfo(): RateLimitInfo {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
      if (stored) {
        const info: RateLimitInfo = JSON.parse(stored);
        
        // Check if the reset time has passed
        if (Date.now() >= info.resetTime) {
          return this.resetRateLimit();
        }
        
        return info;
      }
    } catch (error) {
      console.warn('Error reading rate limit info:', error);
    }
    
    return this.resetRateLimit();
  }

  /**
   * Resets the rate limit for a new time window
   */
  private resetRateLimit(): RateLimitInfo {
    const now = Date.now();
    const resetTime = now + (60 * 1000); // 1 minute from now
    
    const info: RateLimitInfo = {
      requestsRemaining: this.maxRequestsPerMinute,
      resetTime,
      totalRequests: 0,
    };
    
    this.saveRateLimitInfo(info);
    return info;
  }

  /**
   * Saves rate limit info to localStorage
   */
  private saveRateLimitInfo(info: RateLimitInfo): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(info));
    } catch (error) {
      console.warn('Error saving rate limit info:', error);
    }
  }

  /**
   * Updates usage statistics
   */
  private updateUsageStats(): void {
    try {
      const stats = this.getUsageStats();
      const now = Date.now();
      const today = new Date().toDateString();
      const currentHour = new Date().getHours();
      
      // Reset daily stats if it's a new day
      const lastRequestDate = new Date(stats.lastRequestTime).toDateString();
      if (lastRequestDate !== today) {
        stats.requestsToday = 0;
        stats.tokensUsedToday = 0;
      }
      
      // Reset hourly stats if it's a new hour
      const lastRequestHour = new Date(stats.lastRequestTime).getHours();
      if (lastRequestHour !== currentHour) {
        stats.requestsThisHour = 0;
      }
      
      stats.requestsToday += 1;
      stats.requestsThisHour += 1;
      stats.lastRequestTime = now;
      
      localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.warn('Error updating usage stats:', error);
    }
  }

  /**
   * Gets current usage statistics
   */
  getUsageStats(): UsageStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error reading usage stats:', error);
    }
    
    return {
      requestsToday: 0,
      tokensUsedToday: 0,
      requestsThisHour: 0,
      lastRequestTime: 0,
    };
  }

  /**
   * Records token usage
   */
  recordTokenUsage(tokens: number): void {
    try {
      const stats = this.getUsageStats();
      stats.tokensUsedToday += tokens;
      localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.warn('Error recording token usage:', error);
    }
  }

  /**
   * Gets time until rate limit reset
   */
  getTimeUntilReset(): number {
    const rateLimitInfo = this.getRateLimitInfo();
    return Math.max(0, rateLimitInfo.resetTime - Date.now());
  }
}
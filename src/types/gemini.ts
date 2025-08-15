export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxRequestsPerMinute: number;
  maxTokensPerRequest: number;
  environment: 'development' | 'production';
}

export interface GeminiRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed: number;
  timestamp: number;
}

export interface GeminiError {
  code: string;
  message: string;
  details?: any;
}

export interface RateLimitInfo {
  requestsRemaining: number;
  resetTime: number;
  totalRequests: number;
}

export interface UsageStats {
  requestsToday: number;
  tokensUsedToday: number;
  requestsThisHour: number;
  lastRequestTime: number;
}
/**
 * AI provider types following SOLID principles
 * Comprehensive type definitions for AI integration
 */

// Core AI message types following Single Responsibility
export type AIRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  readonly role: AIRole;
  readonly content: string;
  readonly name?: string; // For multi-participant conversations
  readonly metadata?: Record<string, unknown>;
}

// Provider options following Interface Segregation
export interface ProviderOptions {
  readonly model?: string;
  readonly systemInstruction?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly thinkingBudgetTokens?: number;
  readonly frequencyPenalty?: number;
  readonly presencePenalty?: number;
  readonly stopSequences?: readonly string[];
  readonly signal?: AbortSignal;
  readonly onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
  readonly provider?: string; // Provider hint for routing
}

// Generation result following Single Responsibility
export interface GenerateResult {
  readonly text: string;
  readonly finishReason?:
    | 'stop'
    | 'length'
    | 'content-filter'
    | 'function-call'
    | 'tool-calls'
    | 'other'
    | 'unknown'
    | 'error';
  readonly usage?: {
    readonly promptTokens?: number;
    readonly completionTokens?: number;
    readonly totalTokens?: number;
  };
  readonly model?: string;
  readonly provider?: string;
}

// Streaming chunk following Single Responsibility
export interface StreamChunk {
  readonly text: string;
  readonly done?: boolean;
  readonly finishReason?: 'stop' | 'length' | 'content-filter';
  readonly usage?: {
    readonly promptTokens?: number;
    readonly completionTokens?: number;
    readonly totalTokens?: number;
  };
}

// Enhanced error interface following Interface Segregation
export interface AIError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly type?: 'authentication' | 'rate-limit' | 'quota' | 'network' | 'validation' | 'server';
  readonly retryable?: boolean;
  readonly retryAfter?: number; // seconds
  readonly provider?: string;
}

/**
 * Unified AI Provider Interface following Interface Segregation Principle
 * Single interface consolidating all AI provider interactions
 * Each method has a single, well-defined responsibility
 */
export interface IAIProvider {
  // Provider identification
  readonly name: string;
  readonly displayName: string;
  readonly supportedModels: readonly string[];

  // Core functionality
  readonly isAvailable: () => boolean;
  readonly generate: (
    messages: readonly AIMessage[],
    options?: ProviderOptions
  ) => Promise<GenerateResult>;
  readonly generateStream: (
    messages: readonly AIMessage[],
    options?: ProviderOptions
  ) => AsyncGenerator<StreamChunk, void, unknown>;

  // Provider management
  readonly getProviderType: () => string;
  readonly validateApiKey?: (apiKey: string) => Promise<boolean>;
  readonly estimateCost?: (
    messages: readonly AIMessage[],
    options?: ProviderOptions
  ) => Promise<number>;
}

// Provider configuration following Single Responsibility
export interface AIProviderConfig {
  readonly name: string;
  readonly displayName: string;
  readonly apiKeyEnv: string;
  readonly baseUrl?: string;
  readonly models: readonly string[];
  readonly defaultModel: string;
  readonly description: string;
  readonly website?: string;
  readonly maxTokens?: number;
  readonly supportsStreaming: boolean;
  readonly supportsFunctionCalling: boolean;
  readonly pricing?: {
    readonly inputTokensPerDollar: number;
    readonly outputTokensPerDollar: number;
  };
}

// Provider factory interface following Dependency Inversion
export interface AIProviderFactory {
  readonly createProvider: (config: AIProviderConfig, apiKey: string) => IAIProvider;
  readonly getSupportedProviders: () => readonly AIProviderConfig[];
  readonly validateProviderConfig: (config: AIProviderConfig) => boolean;
}

// Token usage tracking
export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly model: string;
  readonly provider: string;
  readonly timestamp: Date;
}

// Conversation context for maintaining state
export interface ConversationContext {
  readonly messages: readonly AIMessage[];
  readonly systemPrompt?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly metadata?: Record<string, unknown>;
}

// Rate limiting interface
export interface RateLimiter {
  readonly checkLimit: (identifier: string) => Promise<boolean>;
  readonly recordUsage: (identifier: string, tokens: number) => Promise<void>;
  readonly getRemainingRequests: (identifier: string) => Promise<number>;
  readonly getResetTime: (identifier: string) => Promise<Date>;
}

// AI provider shared types

export type AIRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface ProviderOptions {
  model?: string; // e.g., 'gemini-2.5-flash'
  systemInstruction?: string;
  temperature?: number;
  thinkingBudgetTokens?: number; // optional thinking budget when supported
  // Optional provider hint for proxy/AI SDK backed requests
  // Examples: 'google' | 'openai' | 'anthropic' | 'cohere'
  provider?: string;
  // Optional external AbortSignal to support cancellation
  signal?: AbortSignal;
  // Optional callback invoked when a retry is scheduled by the provider
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
}

export interface GenerateResult {
  text: string;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface StreamChunk {
  text: string;
  done?: boolean;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIError extends Error {
  status?: number;
  code?: string;
}

/**
 * Unified AI Provider Interface
 * Single interface for all AI provider interactions
 * Following Interface Segregation Principle
 * Consolidates IAIProvider and IAIProviderStrategy into one unified interface
 */
export interface IAIProvider {
  /**
   * Provider name identifier
   */
  readonly name: string;

  /**
   * Check if this provider is available and properly configured
   */
  isAvailable(): boolean;

  /**
   * Generate a complete response for the given messages
   */
  generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult>;

  /**
   * Generate a streaming response for the given messages
   */
  generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;
}

import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';

/**
 * Strategy interface for AI provider implementations
 * Following the Strategy Pattern to enable clean provider switching
 */
export interface IAIProviderStrategy {
  /**
   * Name identifier for the strategy
   */
  readonly name: string;

  /**
   * Check if this strategy is available and properly configured
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

/**
 * Configuration for AI provider strategies
 */
export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  getHeaders?: () => Record<string, string> | undefined;
}

/**
 * Provider selection strategy
 */
export type ProviderSelectionStrategy = 'priority' | 'health' | 'manual';

/**
 * Health status of a provider
 */
export interface ProviderHealth {
  isHealthy: boolean;
  lastChecked: Date;
  responseTime?: number;
  errorCount: number;
  lastError?: Error;
}

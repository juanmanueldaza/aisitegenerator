import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk, IAIProvider } from '@/types/ai';

/**
 * Strategy interface for AI provider implementations
 * Now uses the unified IAIProvider interface for consistency
 */
export type IAIProviderStrategy = IAIProvider;

/**
 * Configuration for AI provider strategies
 */
export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  getHeaders?: () => Record<string, string> | undefined;
}

/**
 * Strategy selection context
 * Simplified implementation with straightforward provider selection
 */
export class AIProviderStrategyContext {
  private strategies: Map<string, IAIProviderStrategy> = new Map();

  /**
   * Register a provider strategy
   */
  registerStrategy(strategy: IAIProviderStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.entries())
      .filter(([, strategy]) => strategy.isAvailable())
      .map(([name]) => name);
  }

  /**
   * Select the best strategy based on simple priority (no health monitoring)
   */
  private selectStrategy(): IAIProviderStrategy | null {
    const availableStrategies = Array.from(this.strategies.entries())
      .filter(([, strategy]) => strategy.isAvailable())
      .map(([name, strategy]) => ({ name, strategy }));

    if (availableStrategies.length === 0) {
      return null;
    }

    // Simple priority order: AI SDK providers first, then proxy, then legacy
    const priorityOrder = [
      'google-sdk', 'openai-sdk', 'anthropic-sdk', 'cohere-sdk',
      'proxy', 'gemini'
    ];

    for (const strategyName of priorityOrder) {
      const found = availableStrategies.find(s => s.name === strategyName);
      if (found) return found.strategy;
    }

    // Return first available if none in priority order
    return availableStrategies[0]?.strategy || null;
  }

  /**
   * Execute generate with simple error handling (no fallback)
   */
  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    const strategy = this.selectStrategy();
    if (!strategy) {
      throw new Error('No AI provider strategy available. Please check your configuration and ensure at least one provider is properly set up.');
    }

    try {
      return await strategy.generate(messages, options);
    } catch (error) {
      // Provide clear, actionable error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`AI provider '${strategy.name}' failed: ${errorMessage}. Please check your API keys and network connection.`);
    }
  }

  /**
   * Execute generateStream with simple error handling (no fallback)
   */
  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const strategy = this.selectStrategy();
    if (!strategy) {
      throw new Error('No AI provider strategy available. Please check your configuration and ensure at least one provider is properly set up.');
    }

    try {
      yield* strategy.generateStream(messages, options);
    } catch (error) {
      // Provide clear, actionable error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`AI provider '${strategy.name}' failed: ${errorMessage}. Please check your API keys and network connection.`);
    }
  }

  /**
   * Get current status (simplified, no health monitoring)
   */
  getStatus() {
    return {
      availableStrategies: this.getAvailableStrategies(),
    };
  }
}

import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import type { IAIProviderStrategy, AIProviderConfig } from './strategies';
import { GeminiStrategy, AISDKProxyStrategy } from './concrete-strategies';
import { AI_CONFIG } from '@/constants/config';
import { alog, makeRequestId } from '@/utils/debug';

/**
 * Provider Manager implementing the Strategy Pattern
 * Manages multiple AI provider strategies and handles selection logic
 */
export class AIProviderManager {
  private strategies: Map<string, IAIProviderStrategy> = new Map();
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.initializeStrategies();
  }

  /**
   * Initialize available strategies based on configuration
   */
  private initializeStrategies(): void {
    // Only add Gemini strategy if API key is available
    const apiKey = this.getApiKey();
    if (apiKey) {
      const geminiConfig: AIProviderConfig = {
        apiKey,
      };
      this.strategies.set('gemini', new GeminiStrategy(geminiConfig));
    }

    // Add proxy strategy if configured (simplified to single proxy)
    if (AI_CONFIG.PROXY_BASE_URL) {
      const proxyConfig: AIProviderConfig = {
        baseUrl: AI_CONFIG.PROXY_BASE_URL,
        getHeaders: () => {
          const apiKey = this.getApiKey();
          return apiKey ? { 'X-GOOGLE-API-KEY': apiKey } : undefined;
        },
      };
      this.strategies.set('proxy', new AISDKProxyStrategy(proxyConfig));
    }

    alog('provider-manager.init', {
      availableStrategies: Array.from(this.strategies.keys()),
    });
  }

  /**
   * Get API key from injected value or localStorage (client-side)
   */
  private getApiKey(): string | undefined {
    // First try the injected API key
    if (this.apiKey) {
      return this.apiKey;
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('GEMINI_API_KEY') || undefined;
    }
    return undefined;
  }

  /**
   * Select the best available strategy based on simple priority
   */
  private selectStrategy(): IAIProviderStrategy | null {
    const availableStrategies = Array.from(this.strategies.entries())
      .filter(([, strategy]) => strategy.isAvailable())
      .map(([name, strategy]) => ({ name, strategy }));

    if (availableStrategies.length === 0) {
      return null;
    }

    // Simple priority order: proxy > gemini
    const priorityOrder = ['proxy', 'gemini'];
    for (const strategyName of priorityOrder) {
      const found = availableStrategies.find((s) => s.name === strategyName);
      if (found) return found.strategy;
    }

    // Fallback to first available strategy
    return availableStrategies[0].strategy;
  }

  /**
   * Execute generate with simple fallback logic
   */
  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    const strategy = this.selectStrategy();
    if (!strategy) {
      throw new Error('No AI provider available');
    }

    const reqId = makeRequestId('ai');
    alog('provider-manager.generate', {
      reqId,
      strategy: strategy.name,
      provider: options?.provider || '(default)',
      model: options?.model || '(server-default)',
    });

    try {
      const result = await strategy.generate(messages, options);
      alog('provider-manager.generate_success', { reqId, strategy: strategy.name });
      return result;
    } catch (error) {
      alog('provider-manager.generate_error', {
        reqId,
        strategy: strategy.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Try fallback to next available strategy
      const fallbackStrategy = this.selectFallbackStrategy(strategy.name);
      if (fallbackStrategy) {
        alog('provider-manager.generate_fallback', {
          reqId,
          fallbackStrategy: fallbackStrategy.name,
        });
        try {
          const result = await fallbackStrategy.generate(messages, options);
          alog('provider-manager.generate_fallback_success', {
            reqId,
            fallbackStrategy: fallbackStrategy.name,
          });
          return result;
        } catch (fallbackError) {
          alog('provider-manager.generate_fallback_error', {
            reqId,
            fallbackStrategy: fallbackStrategy.name,
            error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
          });
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Execute generateStream with fallback logic
   */
  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const strategy = this.selectStrategy();
    if (!strategy) {
      throw new Error('No AI provider available');
    }

    const reqId = makeRequestId('ai');
    alog('provider-manager.stream', {
      reqId,
      strategy: strategy.name,
      provider: options?.provider || '(default)',
      model: options?.model || '(server-default)',
    });

    let hasEmitted = false;
    try {
      const generator = strategy.generateStream(messages, options);
      for await (const chunk of generator) {
        hasEmitted = true;
        yield chunk;
      }
      alog('provider-manager.stream_success', { reqId, strategy: strategy.name });
    } catch (error) {
      alog('provider-manager.stream_error', {
        reqId,
        strategy: strategy.name,
        hasEmitted,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Only try fallback if we haven't emitted any chunks yet
      if (!hasEmitted) {
        const fallbackStrategy = this.selectFallbackStrategy(strategy.name);
        if (fallbackStrategy) {
          alog('provider-manager.stream_fallback', {
            reqId,
            fallbackStrategy: fallbackStrategy.name,
          });
          try {
            const result = await fallbackStrategy.generate(messages, options);
            if (result?.text) {
              yield { text: result.text } as StreamChunk;
            }
            alog('provider-manager.stream_fallback_success', {
              reqId,
              fallbackStrategy: fallbackStrategy.name,
            });
            return;
          } catch (fallbackError) {
            alog('provider-manager.stream_fallback_error', {
              reqId,
              fallbackStrategy: fallbackStrategy.name,
              error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
            });
            throw fallbackError;
          }
        }
      }

      throw error;
    }
  }

  /**
   * Select fallback strategy (different from current strategy)
   */
  private selectFallbackStrategy(currentStrategyName: string): IAIProviderStrategy | null {
    const availableStrategies = Array.from(this.strategies.entries())
      .filter(
        ([strategyName, strategy]) => strategyName !== currentStrategyName && strategy.isAvailable()
      )
      .map(([, strategy]) => strategy);

    return availableStrategies.length > 0 ? availableStrategies[0] : null;
  }

  /**
   * Get current status and available strategies
   */
  getStatus() {
    return {
      availableStrategies: Array.from(this.strategies.entries())
        .filter(([, strategy]) => strategy.isAvailable())
        .map(([name]) => name),
    };
  }
}

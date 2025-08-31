/**
 * Simplified AI Provider Service
 * Clean, straightforward implementation without complex strategy patterns
 */

import { generateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { cohere } from '@ai-sdk/cohere';
import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import type { IStreamingGenerator, IProviderStatus, ITextGenerator } from '@/services/interfaces';
import { readEnv } from '@/constants/config';
import { ProviderHealthManager } from './provider-health';

export type AIProviderType = 'google' | 'openai' | 'anthropic' | 'cohere' | 'gemini' | 'proxy';

/**
 * Simple AI Provider class with direct implementation
 * Implements segregated interfaces following Interface Segregation Principle
 */
export class SimpleAIProvider implements IStreamingGenerator, IProviderStatus, ITextGenerator {
  private provider: AIProviderType;
  private model!:
    | ReturnType<typeof google>
    | ReturnType<typeof openai>
    | ReturnType<typeof anthropic>
    | ReturnType<typeof cohere>;
  private _isAvailable: boolean = false;

  constructor(provider: AIProviderType = 'google', modelName?: string) {
    this.provider = provider;
    this.initializeModel(modelName);
  }

  private initializeModel(modelName?: string) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      // Don't throw error, just mark as unavailable
      this._isAvailable = false;
      return;
    }

    try {
      switch (this.provider) {
        case 'google':
        case 'gemini':
          this.model = google(modelName || 'gemini-2.0-flash');
          break;
        case 'openai':
          this.model = openai(modelName || 'gpt-4o');
          break;
        case 'anthropic':
          this.model = anthropic(modelName || 'claude-3-5-sonnet-20241022');
          break;
        case 'cohere':
          this.model = cohere(modelName || 'command-r-plus');
          break;
        case 'proxy':
          // Proxy provider doesn't use AI SDK directly
          this.model = google(modelName || 'gemini-2.0-flash'); // Fallback
          break;
        default:
          this._isAvailable = false;
          return;
      }
      this._isAvailable = true;
    } catch {
      // If model initialization fails, mark as unavailable
      this._isAvailable = false;
    }
  }

  private getApiKey(): string | undefined {
    switch (this.provider) {
      case 'google':
      case 'gemini':
        return readEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY', 'GEMINI_API_KEY');
      case 'openai':
        return readEnv('OPENAI_API_KEY');
      case 'anthropic':
        return readEnv('ANTHROPIC_API_KEY');
      case 'cohere':
        return readEnv('COHERE_API_KEY');
      case 'proxy':
        // Proxy might use different environment variables
        return readEnv('PROXY_API_KEY', 'GOOGLE_API_KEY', 'GEMINI_API_KEY');
      default:
        return undefined;
    }
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this._isAvailable) {
      throw new Error(`Provider ${this.provider} is not available: API key not configured`);
    }

    try {
      const result = await generateText({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        system: options?.systemInstruction,
      });

      return {
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason === 'error' ? 'stop' : result.finishReason,
      };
    } catch (error) {
      throw new Error(
        `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this._isAvailable) {
      throw new Error(`Provider ${this.provider} is not available: API key not configured`);
    }

    try {
      const result = await streamText({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        system: options?.systemInstruction,
      });

      for await (const chunk of result.textStream) {
        yield {
          text: chunk,
          done: false,
        };
      }

      const usage = await result.usage;
      yield {
        text: '',
        done: true,
        usage,
      };
    } catch (error) {
      throw new Error(
        `AI streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if this provider is available (has API key configured)
   */
  isAvailable(): boolean {
    return this._isAvailable;
  }

  /**
   * Get the provider type
   */
  getProviderType(): string {
    return this.provider;
  }
}

/**
 * Simple AI Provider Manager
 * Manages provider instances and provides easy access
 */
export class SimpleAIProviderManager {
  private providers = new Map<AIProviderType, SimpleAIProvider>();
  private defaultProvider: AIProviderType = 'google';
  private healthManager: ProviderHealthManager;

  constructor(defaultProvider: AIProviderType = 'google') {
    this.defaultProvider = defaultProvider;
    this.healthManager = new ProviderHealthManager(true);
  }

  getProvider(provider?: AIProviderType): SimpleAIProvider {
    const providerType = provider || this.defaultProvider;

    if (!this.providers.has(providerType)) {
      try {
        const newProvider = new SimpleAIProvider(providerType);
        this.providers.set(providerType, newProvider);
        // Add to health monitoring
        this.healthManager.addProvider(newProvider);
      } catch (error) {
        throw new Error(
          `Failed to initialize ${providerType} provider: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return this.providers.get(providerType)!;
  }

  getAvailableProviders(): AIProviderType[] {
    const available: AIProviderType[] = [];

    for (const provider of [
      'google',
      'openai',
      'anthropic',
      'cohere',
      'gemini',
      'proxy',
    ] as AIProviderType[]) {
      try {
        new SimpleAIProvider(provider);
        available.push(provider);
      } catch {
        // Provider not available, skip
      }
    }

    return available;
  }

  async generate(
    messages: AIMessage[],
    options?: ProviderOptions & { provider?: AIProviderType }
  ): Promise<GenerateResult> {
    const provider = this.getProvider(options?.provider);
    return provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions & { provider?: AIProviderType }
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const provider = this.getProvider(options?.provider);
    yield* provider.generateStream(messages, options);
  }

  /**
   * Get health status for all providers
   */
  getProviderHealthStatuses() {
    return this.healthManager.getAllProviderHealth();
  }

  /**
   * Get the healthiest available provider
   */
  getHealthiestProvider(): AIProviderType | null {
    return this.healthManager.getHealthiestProvider();
  }

  /**
   * Generate with automatic failover to healthiest provider
   */
  async generateWithFailover(
    messages: AIMessage[],
    options?: ProviderOptions
  ): Promise<GenerateResult> {
    const healthiestProvider = this.getHealthiestProvider();

    if (healthiestProvider) {
      const provider = this.getProvider(healthiestProvider);
      return provider.generate(messages, options);
    }

    // Fallback to default provider
    const provider = this.getProvider();
    return provider.generate(messages, options);
  }

  /**
   * Generate stream with automatic failover to healthiest provider
   */
  async *generateStreamWithFailover(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const healthiestProvider = this.getHealthiestProvider();

    if (healthiestProvider) {
      const provider = this.getProvider(healthiestProvider);
      yield* provider.generateStream(messages, options);
    } else {
      // Fallback to default provider
      const provider = this.getProvider();
      yield* provider.generateStream(messages, options);
    }
  }
}

// Global instance
export const simpleAIProviderManager = new SimpleAIProviderManager();

/**
 * Simple React hook for AI provider
 */
export function useSimpleAIProvider(provider?: AIProviderType) {
  const providerInstance = simpleAIProviderManager.getProvider(provider);

  return {
    generate: (messages: AIMessage[], options?: ProviderOptions) =>
      providerInstance.generate(messages, options),
    generateStream: (messages: AIMessage[], options?: ProviderOptions) =>
      providerInstance.generateStream(messages, options),
    generateWithFailover: (messages: AIMessage[], options?: ProviderOptions) =>
      simpleAIProviderManager.generateWithFailover(messages, options),
    generateStreamWithFailover: (messages: AIMessage[], options?: ProviderOptions) =>
      simpleAIProviderManager.generateStreamWithFailover(messages, options),
    ready: providerInstance.isAvailable(),
    getHealthStatuses: () => simpleAIProviderManager.getProviderHealthStatuses(),
    getHealthiestProvider: () => simpleAIProviderManager.getHealthiestProvider(),
  };
}

/**
 * Simple function for non-React usage
 */
export function getSimpleAIProvider(provider?: AIProviderType) {
  const providerInstance = simpleAIProviderManager.getProvider(provider);

  return {
    generate: (messages: AIMessage[], options?: ProviderOptions) =>
      providerInstance.generate(messages, options),
    generateStream: (messages: AIMessage[], options?: ProviderOptions) =>
      providerInstance.generateStream(messages, options),
    ready: providerInstance.isAvailable(),
  };
}

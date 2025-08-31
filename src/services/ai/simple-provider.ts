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

  constructor(provider: AIProviderType = 'google', modelName?: string) {
    this.provider = provider;
    this.initializeModel(modelName);
  }

  private initializeModel(modelName?: string) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new Error(`${this.provider} API key not configured`);
    }

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
        throw new Error(`Unsupported provider: ${this.provider}`);
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
        finishReason: result.finishReason,
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
    return Boolean(this.getApiKey());
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

  constructor(defaultProvider: AIProviderType = 'google') {
    this.defaultProvider = defaultProvider;
  }

  getProvider(provider?: AIProviderType): SimpleAIProvider {
    const providerType = provider || this.defaultProvider;

    if (!this.providers.has(providerType)) {
      try {
        this.providers.set(providerType, new SimpleAIProvider(providerType));
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
    ready: providerInstance.isAvailable(),
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

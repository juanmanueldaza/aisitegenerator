import type {
  AIMessage,
  ProviderOptions,
  GenerateResult,
  StreamChunk,
  IAIProvider,
} from '@/types/ai';
import { generateText, streamText } from 'ai';
import type { LanguageModel } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { cohere } from '@ai-sdk/cohere';
import GeminiProvider from './gemini';
import ProxyAIProviderV2 from './proxyV2';

/**
 * Unified AI Provider Adapters
 * Adapter classes that implement the unified IAIProvider interface
 * Supporting both legacy providers and new AI SDK providers
 */

/**
 * Base AI SDK Provider Adapter
 * Abstract base class for AI SDK-based providers
 */
abstract class AISDKProviderAdapter implements IAIProvider {
  abstract readonly name: string;
  protected model: string;

  constructor(model: string = 'gemini-2.0-flash') {
    this.model = model;
  }

  abstract getSDKModel(): LanguageModel;

  isAvailable(): boolean {
    return true; // AI SDK providers are available if properly configured
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    try {
      const result = await generateText({
        model: this.getSDKModel(),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        ...options,
      });

      return {
        text: result.text,
        finishReason: result.finishReason,
        usage: result.usage,
      };
    } catch (error) {
      throw new Error(
        `AI SDK generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const result = await streamText({
        model: this.getSDKModel(),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        ...options,
      });

      for await (const delta of result.textStream) {
        yield {
          text: delta,
          done: false,
        };
      }

      // Final chunk with usage info
      const usage = await result.usage;
      yield {
        text: '',
        done: true,
        usage,
      };
    } catch (error) {
      throw new Error(
        `AI SDK streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Google AI SDK Provider Adapter
 */
export class GoogleAISDKProviderAdapter extends AISDKProviderAdapter {
  readonly name = 'google-sdk';
  private apiKey: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash') {
    super(model);
    if (!apiKey) {
      throw new Error('Google AI API key is required');
    }
    this.apiKey = apiKey;
  }

  getSDKModel(): LanguageModel {
    // For Vercel AI SDK, API keys should be set via environment variables
    // The provider will automatically pick up the API key from env vars
    return google(this.model);
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }
}

/**
 * OpenAI SDK Provider Adapter
 */
export class OpenAISDKProviderAdapter extends AISDKProviderAdapter {
  readonly name = 'openai-sdk';
  private apiKey: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    super(model);
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  getSDKModel(): LanguageModel {
    return openai(this.model);
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }
}

/**
 * Anthropic SDK Provider Adapter
 */
export class AnthropicAISDKProviderAdapter extends AISDKProviderAdapter {
  readonly name = 'anthropic-sdk';
  private apiKey: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    super(model);
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.apiKey = apiKey;
  }

  getSDKModel(): LanguageModel {
    return anthropic(this.model);
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }
}

/**
 * Cohere SDK Provider Adapter
 */
export class CohereAISDKProviderAdapter extends AISDKProviderAdapter {
  readonly name = 'cohere-sdk';
  private apiKey: string;

  constructor(apiKey: string, model: string = 'command-r-plus') {
    super(model);
    if (!apiKey) {
      throw new Error('Cohere API key is required');
    }
    this.apiKey = apiKey;
  }

  getSDKModel(): LanguageModel {
    return cohere(this.model);
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }
}

/**
 * Legacy Gemini Provider Adapter (for backward compatibility)
 * Adapts GeminiProvider to unified IAIProvider interface
 */
export class GeminiProviderAdapter implements IAIProvider {
  readonly name = 'gemini';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini provider is not available: API key not configured');
    }

    const provider = new GeminiProvider(this.apiKey);
    return provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Gemini provider is not available: API key not configured');
    }

    const provider = new GeminiProvider(this.apiKey);
    yield* provider.generateStream(messages, options);
  }
}

/**
 * Proxy Provider Adapter
 * Adapts ProxyAIProviderV2 to unified IAIProvider interface
 */
export class ProxyProviderAdapter implements IAIProvider {
  readonly name = 'proxy';
  private baseUrl: string;
  private getHeaders?: () => Record<string, string> | undefined;

  constructor(baseUrl: string, getHeaders?: () => Record<string, string> | undefined) {
    if (!baseUrl) {
      throw new Error('Proxy base URL is required');
    }
    this.baseUrl = baseUrl;
    this.getHeaders = getHeaders;
  }

  isAvailable(): boolean {
    return Boolean(this.baseUrl);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Proxy provider is not available: base URL not configured');
    }

    const provider = new ProxyAIProviderV2({
      baseUrl: this.baseUrl,
      getHeaders: this.getHeaders,
    });
    return provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Proxy provider is not available: base URL not configured');
    }

    const provider = new ProxyAIProviderV2({
      baseUrl: this.baseUrl,
      getHeaders: this.getHeaders,
    });
    yield* provider.generateStream(messages, options);
  }
}

/**
 * Provider Factory
 * Factory for creating unified provider instances
 */
export class AIProviderFactory {
  static createGemini(apiKey: string): IAIProvider {
    return new GeminiProviderAdapter(apiKey);
  }

  static createProxy(
    baseUrl: string,
    getHeaders?: () => Record<string, string> | undefined
  ): IAIProvider {
    return new ProxyProviderAdapter(baseUrl, getHeaders);
  }

  // AI SDK Providers
  static createGoogleSDK(apiKey: string, model: string = 'gemini-2.0-flash'): IAIProvider {
    // Set the API key in environment for AI SDK
    if (typeof window === 'undefined') {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    }
    return new GoogleAISDKProviderAdapter(apiKey, model);
  }

  static createOpenAISDK(apiKey: string, model: string = 'gpt-4o'): IAIProvider {
    if (typeof window === 'undefined') {
      process.env.OPENAI_API_KEY = apiKey;
    }
    return new OpenAISDKProviderAdapter(apiKey, model);
  }

  static createAnthropicSDK(
    apiKey: string,
    model: string = 'claude-3-5-sonnet-20241022'
  ): IAIProvider {
    if (typeof window === 'undefined') {
      process.env.ANTHROPIC_API_KEY = apiKey;
    }
    return new AnthropicAISDKProviderAdapter(apiKey, model);
  }

  static createCohereSDK(apiKey: string, model: string = 'command-r-plus'): IAIProvider {
    if (typeof window === 'undefined') {
      process.env.COHERE_API_KEY = apiKey;
    }
    return new CohereAISDKProviderAdapter(apiKey, model);
  }
}

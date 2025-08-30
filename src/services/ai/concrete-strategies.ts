import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import type { IAIProviderStrategy, AIProviderConfig } from './strategies';
import GeminiProvider from './gemini';
import ProxyAIProviderV2 from './proxyV2';

/**
 * Direct Gemini provider strategy
 */
export class GeminiStrategy implements IAIProviderStrategy {
  readonly name = 'gemini';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const provider = new GeminiProvider(this.config.apiKey!);
    return provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const provider = new GeminiProvider(this.config.apiKey!);
    yield* provider.generateStream(messages, options);
  }
}

/**
 * AI SDK proxy provider strategy
 */
export class AISDKProxyStrategy implements IAIProviderStrategy {
  readonly name = 'ai-sdk-proxy';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return Boolean(this.config.baseUrl);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('AI SDK proxy base URL not configured');
    }

    const provider = new ProxyAIProviderV2({
      baseUrl: this.config.baseUrl!,
      getHeaders: this.config.getHeaders,
    });
    return provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('AI SDK proxy base URL not configured');
    }

    const provider = new ProxyAIProviderV2({
      baseUrl: this.config.baseUrl!,
      getHeaders: this.config.getHeaders,
    });
    yield* provider.generateStream(messages, options);
  }
}

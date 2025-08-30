import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk, IAIProvider } from '@/types/ai';
import GeminiProvider from './gemini';
import ProxyAIProviderV2, { type ProxyV2Options } from './proxyV2';

/**
 * Adapter class to make GeminiProvider conform to the unified IAIProvider interface
 */
export class GeminiProviderAdapter implements IAIProvider {
  readonly name = 'gemini';
  private provider: GeminiProvider;

  constructor(apiKey: string) {
    this.provider = new GeminiProvider(apiKey);
  }

  isAvailable(): boolean {
    // GeminiProvider doesn't have an isAvailable method, so we check if it was created successfully
    return true; // If construction succeeded, it's available
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    return this.provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    yield* this.provider.generateStream(messages, options);
  }
}

/**
 * Adapter class to make ProxyAIProviderV2 conform to the unified IAIProvider interface
 */
export class ProxyProviderAdapter implements IAIProvider {
  readonly name = 'proxy';
  private provider: ProxyAIProviderV2;

  constructor(options: ProxyV2Options) {
    this.provider = new ProxyAIProviderV2(options);
  }

  isAvailable(): boolean {
    // ProxyAIProviderV2 doesn't have an isAvailable method, so we check if it was created successfully
    return true; // If construction succeeded, it's available
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    return this.provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    yield* this.provider.generateStream(messages, options);
  }
}

/**
 * Factory function to create unified provider instances
 */
export class UnifiedProviderFactory {
  /**
   * Create a Gemini provider using the unified interface
   */
  static createGemini(apiKey: string): IAIProvider {
    return new GeminiProviderAdapter(apiKey);
  }

  /**
   * Create a Proxy provider using the unified interface
   */
  static createProxy(options: ProxyV2Options): IAIProvider {
    return new ProxyProviderAdapter(options);
  }
}

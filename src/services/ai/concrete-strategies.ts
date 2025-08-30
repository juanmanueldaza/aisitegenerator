import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk, IAIProvider } from '@/types/ai';
import type { AIProviderConfig } from './strategies';
import { UnifiedProviderFactory } from './provider-adapters';
import { generateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { cohere } from '@ai-sdk/cohere';

/**
 * Direct Gemini provider strategy using unified interface
 */
export class GeminiStrategy implements IAIProvider {
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

    const provider = UnifiedProviderFactory.createGemini(this.config.apiKey!);
    return provider.generate(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const provider = UnifiedProviderFactory.createGemini(this.config.apiKey!);
    yield* provider.generateStream(messages, options);
  }
}

/**
 * AI SDK proxy provider strategy using unified interface
 */
export class AISDKProxyStrategy implements IAIProvider {
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

    const provider = UnifiedProviderFactory.createProxy({
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

    const provider = UnifiedProviderFactory.createProxy({
      baseUrl: this.config.baseUrl!,
      getHeaders: this.config.getHeaders,
    });
    yield* provider.generateStream(messages, options);
  }
}

/**
 * Google AI SDK provider strategy
 */
export class GoogleAISDKStrategy implements IAIProvider {
  readonly name = 'google-sdk';
  private config: AIProviderConfig;
  private model: string;

  constructor(config: AIProviderConfig, model: string = 'gemini-2.0-flash') {
    this.config = config;
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Google AI API key not configured');
    }

    try {
      const result = await generateText({
        model: google(this.model),
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
        `Google AI SDK generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Google AI API key not configured');
    }

    try {
      const result = await streamText({
        model: google(this.model),
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
        `Google AI SDK streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * OpenAI SDK provider strategy
 */
export class OpenAISDKStrategy implements IAIProvider {
  readonly name = 'openai-sdk';
  private config: AIProviderConfig;
  private model: string;

  constructor(config: AIProviderConfig, model: string = 'gpt-4o') {
    this.config = config;
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const result = await generateText({
        model: openai(this.model),
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
        `OpenAI SDK generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const result = await streamText({
        model: openai(this.model),
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
        `OpenAI SDK streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Anthropic SDK provider strategy
 */
export class AnthropicAISDKStrategy implements IAIProvider {
  readonly name = 'anthropic-sdk';
  private config: AIProviderConfig;
  private model: string;

  constructor(config: AIProviderConfig, model: string = 'claude-3-5-sonnet-20241022') {
    this.config = config;
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const result = await generateText({
        model: anthropic(this.model),
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
        `Anthropic SDK generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const result = await streamText({
        model: anthropic(this.model),
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
        `Anthropic SDK streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Cohere SDK provider strategy
 */
export class CohereAISDKStrategy implements IAIProvider {
  readonly name = 'cohere-sdk';
  private config: AIProviderConfig;
  private model: string;

  constructor(config: AIProviderConfig, model: string = 'command-r-plus') {
    this.config = config;
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Cohere API key not configured');
    }

    try {
      const result = await generateText({
        model: cohere(this.model),
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
        `Cohere SDK generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('Cohere API key not configured');
    }

    try {
      const result = await streamText({
        model: cohere(this.model),
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
        `Cohere SDK streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Proxy provider strategy
 */
export class ProxyStrategy implements IAIProvider {
  readonly name = 'proxy';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return Boolean(this.config.baseUrl);
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    if (!this.isAvailable()) {
      throw new Error('Proxy base URL not configured');
    }

    const provider = UnifiedProviderFactory.createProxy({
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
      throw new Error('Proxy base URL not configured');
    }

    const provider = UnifiedProviderFactory.createProxy({
      baseUrl: this.config.baseUrl!,
      getHeaders: this.config.getHeaders,
    });
    yield* provider.generateStream(messages, options);
  }
}

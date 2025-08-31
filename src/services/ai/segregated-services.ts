/**
 * Segregated AI Service Implementations
 * Following Interface Segregation Principle with focused, single-responsibility classes
 */

import type { ApiResponse } from '@types';
import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import type {
  IMessageSender,
  IContentGenerator,
  IStreamingGenerator,
  IProviderStatus,
  ITextGenerator,
} from '@/services/interfaces';
import { SimpleAIProvider } from './simple-provider';

/**
 * Message Sender Service - focused on conversational/chat functionality
 * Implements only IMessageSender interface
 */
export class MessageSenderService implements IMessageSender {
  private provider: SimpleAIProvider;

  constructor(provider: SimpleAIProvider) {
    this.provider = provider;
  }

  async sendMessage(
    message: string,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<string>> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: message,
        },
      ];

      const result = await this.provider.generate(messages, {
        temperature: 0.7,
        systemInstruction: context?.systemInstruction as string,
      });

      return {
        success: true,
        data: result.text,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Content Generator Service - focused on content generation functionality
 * Implements only IContentGenerator interface
 */
export class ContentGeneratorService implements IContentGenerator {
  private provider: SimpleAIProvider;

  constructor(provider: SimpleAIProvider) {
    this.provider = provider;
  }

  async generateSiteContent(prompt: string): Promise<ApiResponse<string>> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content:
            "You are a website content generator. Generate comprehensive website content based on the user's request.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const result = await this.provider.generate(messages, {
        temperature: 0.8,
        systemInstruction: 'Generate engaging, well-structured website content.',
      });

      return {
        success: true,
        data: result.text,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async generatePageContent(prompt: string, pageType: string): Promise<ApiResponse<string>> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are a ${pageType} page content generator. Generate content specifically for a ${pageType} page.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const result = await this.provider.generate(messages, {
        temperature: 0.7,
        systemInstruction: `Generate ${pageType} page content that is engaging and well-structured.`,
      });

      return {
        success: true,
        data: result.text,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Streaming Generator Service - focused on streaming functionality
 * Implements only IStreamingGenerator interface
 */
export class StreamingGeneratorService implements IStreamingGenerator {
  private provider: SimpleAIProvider;

  constructor(provider: SimpleAIProvider) {
    this.provider = provider;
  }

  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    yield* this.provider.generateStream(messages, options);
  }
}

/**
 * Provider Status Service - focused on provider status functionality
 * Implements only IProviderStatus interface
 */
export class ProviderStatusService implements IProviderStatus {
  private provider: SimpleAIProvider;

  constructor(provider: SimpleAIProvider) {
    this.provider = provider;
  }

  isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  getProviderType(): string {
    return this.provider.getProviderType();
  }
}

/**
 * Text Generator Service - focused on basic text generation
 * Implements only ITextGenerator interface
 */
export class TextGeneratorService implements ITextGenerator {
  private provider: SimpleAIProvider;

  constructor(provider: SimpleAIProvider) {
    this.provider = provider;
  }

  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    return this.provider.generate(messages, options);
  }
}

/**
 * Composite AI Service - combines multiple segregated services
 * Provides backward compatibility while demonstrating composition
 */
export class CompositeAIService
  implements IMessageSender, IContentGenerator, IStreamingGenerator, IProviderStatus, ITextGenerator
{
  private messageSender: MessageSenderService;
  private contentGenerator: ContentGeneratorService;
  private streamingGenerator: StreamingGeneratorService;
  private providerStatus: ProviderStatusService;
  private textGenerator: TextGeneratorService;

  constructor(provider: SimpleAIProvider) {
    this.messageSender = new MessageSenderService(provider);
    this.contentGenerator = new ContentGeneratorService(provider);
    this.streamingGenerator = new StreamingGeneratorService(provider);
    this.providerStatus = new ProviderStatusService(provider);
    this.textGenerator = new TextGeneratorService(provider);
  }

  // IMessageSender implementation
  async sendMessage(
    message: string,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<string>> {
    return this.messageSender.sendMessage(message, context);
  }

  // IContentGenerator implementation
  async generateSiteContent(prompt: string): Promise<ApiResponse<string>> {
    return this.contentGenerator.generateSiteContent(prompt);
  }

  async generatePageContent(prompt: string, pageType: string): Promise<ApiResponse<string>> {
    return this.contentGenerator.generatePageContent(prompt, pageType);
  }

  // IStreamingGenerator implementation
  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    yield* this.streamingGenerator.generateStream(messages, options);
  }

  // IProviderStatus implementation
  isAvailable(): boolean {
    return this.providerStatus.isAvailable();
  }

  getProviderType(): string {
    return this.providerStatus.getProviderType();
  }

  // ITextGenerator implementation
  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    return this.textGenerator.generate(messages, options);
  }
}

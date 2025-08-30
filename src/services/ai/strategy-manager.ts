import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { AIProviderStrategyContext, type AIProviderConfig } from './strategies';
import {
  GeminiStrategy,
  GoogleAISDKStrategy,
  OpenAISDKStrategy,
  AnthropicAISDKStrategy,
  CohereAISDKStrategy,
  ProxyStrategy,
} from './concrete-strategies';
import { AI_CONFIG, readEnv } from '@/constants/config';
import { alog, makeRequestId } from '@/utils/debug';

/**
 * AI Provider Strategy Manager
 * Simplified implementation with straightforward provider selection
 */
export class AIProviderStrategyManager {
  private context: AIProviderStrategyContext;
  private initialized = false;

  constructor() {
    this.context = new AIProviderStrategyContext();
  }

  /**
   * Initialize all available provider strategies
   */
  initialize(): void {
    if (this.initialized) return;

    alog('strategy-manager.init', { message: 'Initializing AI provider strategies' });

    // Initialize Gemini strategy (legacy)
    const geminiApiKey = readEnv('GOOGLE_API_KEY', 'GEMINI_API_KEY');
    if (geminiApiKey) {
      const geminiConfig: AIProviderConfig = { apiKey: geminiApiKey };
      this.context.registerStrategy(new GeminiStrategy(geminiConfig));
      alog('strategy-manager.init', { message: 'Registered Gemini strategy' });
    }

    // Initialize Google AI SDK strategy
    const googleApiKey = readEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY');
    if (googleApiKey) {
      const googleConfig: AIProviderConfig = { apiKey: googleApiKey };
      this.context.registerStrategy(new GoogleAISDKStrategy(googleConfig));
      alog('strategy-manager.init', { message: 'Registered Google AI SDK strategy' });
    }

    // Initialize OpenAI SDK strategy
    const openaiApiKey = readEnv('OPENAI_API_KEY');
    if (openaiApiKey) {
      const openaiConfig: AIProviderConfig = { apiKey: openaiApiKey };
      this.context.registerStrategy(new OpenAISDKStrategy(openaiConfig));
      alog('strategy-manager.init', { message: 'Registered OpenAI SDK strategy' });
    }

    // Initialize Anthropic SDK strategy
    const anthropicApiKey = readEnv('ANTHROPIC_API_KEY');
    if (anthropicApiKey) {
      const anthropicConfig: AIProviderConfig = { apiKey: anthropicApiKey };
      this.context.registerStrategy(new AnthropicAISDKStrategy(anthropicConfig));
      alog('strategy-manager.init', { message: 'Registered Anthropic SDK strategy' });
    }

    // Initialize Cohere SDK strategy
    const cohereApiKey = readEnv('COHERE_API_KEY');
    if (cohereApiKey) {
      const cohereConfig: AIProviderConfig = { apiKey: cohereApiKey };
      this.context.registerStrategy(new CohereAISDKStrategy(cohereConfig));
      alog('strategy-manager.init', { message: 'Registered Cohere SDK strategy' });
    }

    // Initialize Proxy strategy - simplified configuration
    if (AI_CONFIG.PROXY_BASE_URL && AI_CONFIG.PROXY_BASE_URL.trim()) {
      const proxyConfig: AIProviderConfig = {
        baseUrl: AI_CONFIG.PROXY_BASE_URL,
        getHeaders: () => ({
          'X-GOOGLE-API-KEY': readEnv('GOOGLE_API_KEY', 'GEMINI_API_KEY') || '',
          'X-OPENAI-API-KEY': readEnv('OPENAI_API_KEY') || '',
          'X-ANTHROPIC-API-KEY': readEnv('ANTHROPIC_API_KEY') || '',
          'X-COHERE-API-KEY': readEnv('COHERE_API_KEY') || '',
        }),
      };
      this.context.registerStrategy(new ProxyStrategy(proxyConfig));
      alog('strategy-manager.init', { message: 'Registered Proxy strategy' });
    }

    // Set default selection strategy to priority
    // Note: Simplified to always use priority-based selection

    this.initialized = true;
    alog('strategy-manager.init', {
      message: 'Strategy manager initialization complete',
      availableStrategies: this.context.getAvailableStrategies(),
    });
  }

  /**
   * Get available provider strategies
   */
  getAvailableProviders(): string[] {
    return this.context.getAvailableStrategies();
  }

  /**
   * Generate content using the selected strategy
   */
  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    this.ensureInitialized();

    const reqId = makeRequestId('ai-strategy');
    alog('strategy-manager.generate', {
      reqId,
      messageCount: messages.length,
      provider: options?.provider || '(auto)',
      model: options?.model || '(default)',
    });

    try {
      const result = await this.context.generate(messages, options);
      alog('strategy-manager.generate_success', { reqId });
      return result;
    } catch (error) {
      alog('strategy-manager.generate_error', {
        reqId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate streaming content using the selected strategy
   */
  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    this.ensureInitialized();

    const reqId = makeRequestId('ai-strategy-stream');
    alog('strategy-manager.stream', {
      reqId,
      messageCount: messages.length,
      provider: options?.provider || '(auto)',
      model: options?.model || '(default)',
    });

    try {
      yield* this.context.generateStream(messages, options);
      alog('strategy-manager.stream_success', { reqId });
    } catch (error) {
      alog('strategy-manager.stream_error', {
        reqId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get current status (simplified)
   */
  getStatus() {
    this.ensureInitialized();
    return this.context.getStatus();
  }

  /**
   * Ensure the manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
}

/**
 * Global strategy manager instance
 */
export const aiProviderStrategyManager = new AIProviderStrategyManager();

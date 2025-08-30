import type {
  AIMessage,
  ProviderOptions,
  GenerateResult,
  StreamChunk,
  IAIProvider,
} from '@/types/ai';
import { AIProviderFactory } from './providers';
import { AI_CONFIG, readEnv } from '@/constants/config';

/**
 * Unified AI Provider Manager
 * Manages all AI providers through the unified IAIProvider interface
 */
export class UnifiedAIProviderManager {
  private providers: Map<string, IAIProvider> = new Map();
  private defaultProvider: string | null = null;

  /**
   * Register a provider with the manager
   */
  registerProvider(name: string, provider: IAIProvider): void {
    this.providers.set(name, provider);
    if (!this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): IAIProvider | null {
    return this.providers.get(name) || null;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.isAvailable())
      .map(([name]) => name);
  }

  /**
   * Get the default provider
   */
  getDefaultProvider(): IAIProvider | null {
    if (!this.defaultProvider) return null;
    return this.getProvider(this.defaultProvider);
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' is not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * Generate content using a specific provider
   */
  async generate(
    messages: AIMessage[],
    options?: ProviderOptions & { provider?: string }
  ): Promise<GenerateResult> {
    const providerName = options?.provider || this.defaultProvider;
    if (!providerName) {
      throw new Error('No provider specified and no default provider set');
    }

    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider '${providerName}' is not available`);
    }

    return provider.generate(messages, options);
  }

  /**
   * Generate streaming content using a specific provider
   */
  async *generateStream(
    messages: AIMessage[],
    options?: ProviderOptions & { provider?: string }
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const providerName = options?.provider || this.defaultProvider;
    if (!providerName) {
      throw new Error('No provider specified and no default provider set');
    }

    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider '${providerName}' is not available`);
    }

    yield* provider.generateStream(messages, options);
  }
}

/**
 * Global provider manager instance
 */
export const unifiedProviderManager = new UnifiedAIProviderManager();

export function initializeProviders(): void {
  // Clear existing providers
  unifiedProviderManager['providers'].clear();
  unifiedProviderManager['defaultProvider'] = null;

  // Initialize Gemini provider if API key is available (legacy)
  const geminiApiKey = readEnv('GOOGLE_API_KEY', 'GEMINI_API_KEY');
  if (geminiApiKey) {
    const geminiProvider = AIProviderFactory.createGemini(geminiApiKey);
    unifiedProviderManager.registerProvider('gemini', geminiProvider);
  }

  // Initialize Google AI SDK provider if API key is available
  const googleApiKey = readEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY');
  if (googleApiKey) {
    const googleSDKProvider = AIProviderFactory.createGoogleSDK(googleApiKey);
    unifiedProviderManager.registerProvider('google-sdk', googleSDKProvider);
  }

  // Initialize OpenAI SDK provider if API key is available
  const openaiApiKey = readEnv('OPENAI_API_KEY');
  if (openaiApiKey) {
    const openaiSDKProvider = AIProviderFactory.createOpenAISDK(openaiApiKey);
    unifiedProviderManager.registerProvider('openai-sdk', openaiSDKProvider);
  }

  // Initialize Anthropic SDK provider if API key is available
  const anthropicApiKey = readEnv('ANTHROPIC_API_KEY');
  if (anthropicApiKey) {
    const anthropicSDKProvider = AIProviderFactory.createAnthropicSDK(anthropicApiKey);
    unifiedProviderManager.registerProvider('anthropic-sdk', anthropicSDKProvider);
  }

  // Initialize Cohere SDK provider if API key is available
  const cohereApiKey = readEnv('COHERE_API_KEY');
  if (cohereApiKey) {
    const cohereSDKProvider = AIProviderFactory.createCohereSDK(cohereApiKey);
    unifiedProviderManager.registerProvider('cohere-sdk', cohereSDKProvider);
  }

  // Initialize proxy provider if base URL is configured
  const proxyBaseUrl = readEnv('PROXY_BASE_URL') || AI_CONFIG.PROXY_BASE_URL;
  if (proxyBaseUrl && proxyBaseUrl !== 'http://localhost:5173') {
    const proxyProvider = AIProviderFactory.createProxy(proxyBaseUrl, () => ({
      'X-GOOGLE-API-KEY': readEnv('GOOGLE_API_KEY', 'GEMINI_API_KEY') || '',
      'X-OPENAI-API-KEY': readEnv('OPENAI_API_KEY') || '',
      'X-ANTHROPIC-API-KEY': readEnv('ANTHROPIC_API_KEY') || '',
      'X-COHERE-API-KEY': readEnv('COHERE_API_KEY') || '',
    }));
    unifiedProviderManager.registerProvider('proxy', proxyProvider);
  }

  // Set default provider (prefer AI SDK providers, fallback to legacy)
  const availableProviders = unifiedProviderManager.getAvailableProviders();
  if (availableProviders.includes('google-sdk')) {
    unifiedProviderManager.setDefaultProvider('google-sdk');
  } else if (availableProviders.includes('openai-sdk')) {
    unifiedProviderManager.setDefaultProvider('openai-sdk');
  } else if (availableProviders.includes('anthropic-sdk')) {
    unifiedProviderManager.setDefaultProvider('anthropic-sdk');
  } else if (availableProviders.includes('cohere-sdk')) {
    unifiedProviderManager.setDefaultProvider('cohere-sdk');
  } else if (availableProviders.includes('proxy')) {
    unifiedProviderManager.setDefaultProvider('proxy');
  } else if (availableProviders.includes('gemini')) {
    unifiedProviderManager.setDefaultProvider('gemini');
  }
}

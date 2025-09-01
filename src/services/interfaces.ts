// Service layer following Dependency Inversion Principle (SOLID)
// Abstract interfaces that higher-level modules depend on

import type { ApiResponse, ApiError } from '@/types/common';
import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';

/**
 * Abstract AI chat service interface - Interface Segregation Principle
 * Focused on conversational/chat functionality only
 */
export interface IMessageSender {
  sendMessage(
    message: string,
    context?: Record<string, unknown>
  ): Promise<ApiResponse<string, ApiError>>;
}

/**
 * Abstract content generation service interface - Interface Segregation Principle
 * Focused on generating various types of content
 */
export interface IContentGenerator {
  generateSiteContent(prompt: string): Promise<ApiResponse<string, ApiError>>;
  generatePageContent(prompt: string, pageType: string): Promise<ApiResponse<string, ApiError>>;
}

/**
 * Abstract streaming AI service interface - Interface Segregation Principle
 * Focused on streaming text generation
 */
export interface IStreamingGenerator {
  generateStream(
    messages: AIMessage[],
    options?: ProviderOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;
}

/**
 * Abstract provider status interface - Interface Segregation Principle
 * Focused on provider availability and status
 */
export interface IProviderStatus {
  isAvailable(): boolean;
  getProviderType(): string;
}

/**
 * Abstract provider health monitoring interface - Interface Segregation Principle
 * Focused on provider health checks and monitoring
 */
export interface IProviderHealth {
  /**
   * Perform a health check on the provider
   */
  checkHealth(): Promise<ProviderHealthStatus>;

  /**
   * Get the current health status
   */
  getHealthStatus(): ProviderHealthStatus;

  /**
   * Get health metrics and history
   */
  getHealthMetrics(): ProviderHealthMetrics;

  /**
   * Reset health status (useful for recovery)
   */
  resetHealth(): void;
}

/**
 * Provider health status enumeration
 */
export type ProviderHealthState = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Provider health status information
 */
export interface ProviderHealthStatus {
  state: ProviderHealthState;
  lastChecked: Date;
  responseTime?: number;
  errorMessage?: string;
  consecutiveFailures: number;
  isAvailable: boolean;
}

/**
 * Provider health metrics for monitoring
 */
export interface ProviderHealthMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  uptimePercentage: number;
  lastFailureTime?: Date;
  healthHistory: ProviderHealthStatus[];
}

/**
 * Abstract AI text generation interface - Interface Segregation Principle
 * Focused on basic text generation without streaming
 */
export interface ITextGenerator {
  generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult>;
}

/**
 * Abstract site store service interface - Interface Segregation Principle
 * Focused on site state management and persistence
 */
export interface ISiteStore {
  // State getters
  getContent(): string;
  getMessages(): ChatMessage[];
  getWizardStep(): 1 | 2 | 3 | 4;
  getProjectName(): string;
  getOnboardingCompleted(): boolean;

  // State setters
  setContent(content: string): void;
  setMessages(messages: ChatMessage[]): void;
  clearMessages(): void;
  appendMessage(message: ChatMessage): void;
  replaceLastAssistantMessage(content: string): void;
  upsertStreamingAssistant(content: string): void;

  // Undo/redo operations
  commit(): void;
  undo(): void;
  redo(): void;
  clear(): void;

  // Onboarding operations
  setWizardStep(step: 1 | 2 | 3 | 4): void;
  setProjectName(name: string): void;
  setOnboardingCompleted(completed: boolean): void;
}

/**
 * Chat message interface for the site store
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Abstract AI provider manager interface - Interface Segregation Principle
 * Focused on managing multiple AI providers and their availability
 */
export interface IAIProviderManager {
  getAvailableProviders(): AIProviderType[];
  getProvider(provider?: AIProviderType): IStreamingGenerator & IProviderStatus & ITextGenerator;
  getHealthiestProvider(): AIProviderType | null;
  getProviderHealthStatuses(): Map<AIProviderType, ProviderHealthStatus>;
}

/**
 * AI provider type enumeration
 */
export type AIProviderType = 'google' | 'openai' | 'anthropic' | 'cohere' | 'gemini' | 'proxy';

// Legacy interface for backward compatibility - DEPRECATED
// Use the segregated interfaces above instead
/**
 * @deprecated Use IMessageSender, IContentGenerator, IStreamingGenerator, and IProviderStatus instead
 * Abstract AI chat service interface
 */
export interface IAIService extends IMessageSender, IContentGenerator {
  // This interface is kept for backward compatibility but should not be used for new implementations
}

// Concrete implementations will be created in separate files
// This follows the Dependency Inversion Principle - high-level modules
// depend on abstractions, not on concrete implementations

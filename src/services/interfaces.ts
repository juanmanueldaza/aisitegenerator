// Service layer following Dependency Inversion Principle (SOLID)
// Abstract interfaces that higher-level modules depend on

import type { User, GitHubRepository, SiteConfiguration, ApiResponse } from '@types';
import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';

/**
 * Abstract authentication service interface
 * Following Interface Segregation Principle
 */
export interface IAuthService {
  login(): Promise<ApiResponse<User>>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  isAuthenticated(): boolean;
}

/**
 * Abstract GitHub integration service interface
 */
export interface IGitHubService {
  getRepositories(): Promise<ApiResponse<GitHubRepository[]>>;
  createRepository(name: string, description?: string): Promise<ApiResponse<GitHubRepository>>;
  deployToPages(repoName: string, content: string): Promise<ApiResponse<string>>;
}

/**
 * Abstract site generation service interface
 */
export interface ISiteService {
  createSite(config: Partial<SiteConfiguration>): Promise<ApiResponse<SiteConfiguration>>;
  updateSite(
    id: string,
    updates: Partial<SiteConfiguration>
  ): Promise<ApiResponse<SiteConfiguration>>;
  deleteSite(id: string): Promise<ApiResponse<void>>;
  getSite(id: string): Promise<ApiResponse<SiteConfiguration>>;
  listSites(): Promise<ApiResponse<SiteConfiguration[]>>;
}

/**
 * Abstract AI chat service interface - Interface Segregation Principle
 * Focused on conversational/chat functionality only
 */
export interface IMessageSender {
  sendMessage(message: string, context?: Record<string, unknown>): Promise<ApiResponse<string>>;
}

/**
 * Abstract content generation service interface - Interface Segregation Principle
 * Focused on generating various types of content
 */
export interface IContentGenerator {
  generateSiteContent(prompt: string): Promise<ApiResponse<string>>;
  generatePageContent(prompt: string, pageType: string): Promise<ApiResponse<string>>;
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
 * Abstract AI text generation interface - Interface Segregation Principle
 * Focused on basic text generation without streaming
 */
export interface ITextGenerator {
  generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult>;
}

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

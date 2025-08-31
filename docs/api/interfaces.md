# Service Interfaces Documentation

## Overview

This document details the service interfaces used throughout the AI Site Generator application. These interfaces follow the Interface Segregation Principle (ISP) from SOLID design patterns, ensuring focused and maintainable service contracts.

## Table of Contents

- [AI Service Interfaces](#ai-service-interfaces)
- [GitHub Service Interfaces](#github-service-interfaces)
- [Common Interfaces](#common-interfaces)

## AI Service Interfaces

### IStreamingGenerator

Interface for streaming text generation capabilities.

```typescript
interface IStreamingGenerator {
  /**
   * Generate text as an asynchronous stream
   * @param messages Array of AI messages
   * @param options Optional generation parameters
   * @returns AsyncIterable of StreamChunk objects
   */
  generateStream(messages: AIMessage[], options?: ProviderOptions): AsyncIterable<StreamChunk>;

  /**
   * Check if the streaming generator is available
   * @returns Promise<boolean> indicating availability
   */
  isAvailable(): Promise<boolean>;
}
```

**Usage Example:**

```typescript
class StreamingService implements IStreamingGenerator {
  async *generateStream(messages: AIMessage[], options?: ProviderOptions) {
    // Implementation for streaming text generation
    for await (const chunk of this.provider.stream(messages, options)) {
      yield {
        text: chunk.text,
        done: chunk.done,
        usage: chunk.usage,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.provider.isHealthy();
  }
}
```

### ITextGenerator

Interface for synchronous text generation.

```typescript
interface ITextGenerator {
  /**
   * Generate text synchronously
   * @param messages Array of AI messages
   * @param options Optional generation parameters
   * @returns Promise<GenerateResult> with generated text and metadata
   */
  generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult>;

  /**
   * Check if the text generator is available
   * @returns Promise<boolean> indicating availability
   */
  isAvailable(): Promise<boolean>;
}
```

**Usage Example:**

```typescript
class TextGenerationService implements ITextGenerator {
  async generate(messages: AIMessage[], options?: ProviderOptions): Promise<GenerateResult> {
    const response = await this.provider.generate(messages, options);
    return {
      text: response.text,
      usage: response.usage,
      finishReason: response.finishReason,
    };
  }

  async isAvailable(): Promise<boolean> {
    return this.provider.isHealthy();
  }
}
```

### IProviderStatus

Interface for provider status monitoring.

```typescript
interface IProviderStatus {
  /**
   * Get the current status of the provider
   * @returns Promise<ProviderStatus> with status information
   */
  getStatus(): Promise<ProviderStatus>;

  /**
   * Check if the provider is available for use
   * @returns Promise<boolean> indicating availability
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the type/name of the provider
   * @returns string provider type
   */
  getProviderType(): string;
}
```

**ProviderStatus Type:**

```typescript
interface ProviderStatus {
  state: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastChecked: Date;
  error?: string;
  latency?: number;
}
```

**Usage Example:**

```typescript
class ProviderMonitor implements IProviderStatus {
  async getStatus(): Promise<ProviderStatus> {
    const health = await this.checkProviderHealth();
    return {
      state: health.state,
      lastChecked: new Date(),
      error: health.error,
      latency: health.latency,
    };
  }

  async isAvailable(): Promise<boolean> {
    const status = await this.getStatus();
    return status.state === 'healthy';
  }

  getProviderType(): string {
    return this.provider.type;
  }
}
```

### IMessageSender

Interface for conversational message handling.

```typescript
interface IMessageSender {
  /**
   * Send a message and get a response
   * @param message The message content
   * @param context Optional context information
   * @returns Promise<MessageResponse> with response data
   */
  sendMessage(message: string, context?: MessageContext): Promise<MessageResponse>;

  /**
   * Send multiple messages in a conversation
   * @param messages Array of message objects
   * @param context Optional context information
   * @returns Promise<MessageResponse> with response data
   */
  sendMessages(messages: AIMessage[], context?: MessageContext): Promise<MessageResponse>;
}
```

**Supporting Types:**

```typescript
interface MessageContext {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  conversationId?: string;
}

interface MessageResponse {
  text: string;
  usage?: TokenUsage;
  finishReason?: string;
  conversationId?: string;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

**Usage Example:**

```typescript
class ChatService implements IMessageSender {
  async sendMessage(message: string, context?: MessageContext): Promise<MessageResponse> {
    const messages: AIMessage[] = [{ role: 'user', content: message }];

    const result = await this.provider.generate(messages, {
      temperature: context?.temperature || 0.7,
      maxTokens: context?.maxTokens || 1000,
    });

    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      conversationId: context?.conversationId,
    };
  }

  async sendMessages(messages: AIMessage[], context?: MessageContext): Promise<MessageResponse> {
    const result = await this.provider.generate(messages, context);
    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      conversationId: context?.conversationId,
    };
  }
}
```

### IContentGenerator

Interface for generating specific types of content.

```typescript
interface IContentGenerator {
  /**
   * Generate HTML content
   * @param prompt Description of the content to generate
   * @param options Optional generation options
   * @returns Promise<string> HTML content
   */
  generateHTML(prompt: string, options?: ContentOptions): Promise<string>;

  /**
   * Generate CSS styles
   * @param prompt Description of the styles to generate
   * @param options Optional generation options
   * @returns Promise<string> CSS content
   */
  generateCSS(prompt: string, options?: ContentOptions): Promise<string>;

  /**
   * Generate JavaScript code
   * @param prompt Description of the code to generate
   * @param options Optional generation options
   * @returns Promise<string> JavaScript content
   */
  generateJS(prompt: string, options?: ContentOptions): Promise<string>;

  /**
   * Generate complete site content
   * @param prompt Description of the site to generate
   * @param options Optional generation options
   * @returns Promise<SiteContent> Complete site structure
   */
  generateSiteContent(prompt: string, options?: ContentOptions): Promise<SiteContent>;
}
```

**Supporting Types:**

```typescript
interface ContentOptions {
  theme?: string;
  responsive?: boolean;
  accessibility?: boolean;
  framework?: 'vanilla' | 'react' | 'vue';
}

interface SiteContent {
  html: string;
  css: string;
  js: string;
  assets?: Asset[];
}

interface Asset {
  name: string;
  type: 'image' | 'font' | 'script' | 'style';
  url: string;
  content?: string;
}
```

**Usage Example:**

```typescript
class SiteGenerator implements IContentGenerator {
  async generateHTML(prompt: string, options?: ContentOptions): Promise<string> {
    const systemPrompt = `Generate HTML for: ${prompt}`;
    if (options?.responsive) {
      systemPrompt += ' Make it responsive.';
    }
    if (options?.accessibility) {
      systemPrompt += ' Ensure accessibility compliance.';
    }

    const result = await this.provider.generate([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);

    return result.text;
  }

  async generateSiteContent(prompt: string, options?: ContentOptions): Promise<SiteContent> {
    const [html, css, js] = await Promise.all([
      this.generateHTML(prompt, options),
      this.generateCSS(prompt, options),
      this.generateJS(prompt, options),
    ]);

    return { html, css, js };
  }
}
```

## GitHub Service Interfaces

### IGitHubAuth

Interface for GitHub authentication operations.

```typescript
interface IGitHubAuth {
  /**
   * Authenticate with GitHub using web flow
   * @returns Promise<GitHubUser> authenticated user
   */
  login(): Promise<GitHubUser>;

  /**
   * Start device authentication flow
   * @returns Promise<DeviceAuthResponse> with verification details
   */
  startDeviceAuth(): Promise<DeviceAuthResponse>;

  /**
   * Logout and clear authentication
   * @returns Promise<void>
   */
  logout(): Promise<void>;

  /**
   * Check if user is authenticated
   * @returns boolean authentication status
   */
  isAuthenticated(): boolean;

  /**
   * Get current authenticated user
   * @returns GitHubUser | null current user
   */
  getCurrentUser(): GitHubUser | null;

  /**
   * Get authentication scopes
   * @returns string[] array of granted scopes
   */
  getScopes(): string[];
}
```

**Supporting Types:**

```typescript
interface DeviceAuthResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
  poll: () => Promise<GitHubUser>;
}
```

### IGitHubRepository

Interface for GitHub repository operations.

```typescript
interface IGitHubRepository {
  /**
   * Get user's repositories
   * @param options Optional pagination and filtering options
   * @returns Promise<GitHubRepository[]> array of repositories
   */
  getRepositories(options?: RepositoryOptions): Promise<GitHubRepository[]>;

  /**
   * Create a new repository
   * @param params Repository creation parameters
   * @returns Promise<GitHubRepository> created repository
   */
  createRepository(params: CreateRepositoryParams): Promise<GitHubRepository>;

  /**
   * Get repository details
   * @param owner Repository owner
   * @param name Repository name
   * @returns Promise<GitHubRepository> repository details
   */
  getRepository(owner: string, name: string): Promise<GitHubRepository>;

  /**
   * Delete a repository
   * @param owner Repository owner
   * @param name Repository name
   * @returns Promise<void>
   */
  deleteRepository(owner: string, name: string): Promise<void>;
}
```

**Supporting Types:**

```typescript
interface RepositoryOptions {
  type?: 'all' | 'owner' | 'public' | 'private' | 'member';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

interface CreateRepositoryParams {
  name: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  has_downloads?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  allow_squash_merge?: boolean;
  allow_merge_commit?: boolean;
  allow_rebase_merge?: boolean;
}
```

### IGitHubPages

Interface for GitHub Pages deployment operations.

```typescript
interface IGitHubPages {
  /**
   * Deploy content to GitHub Pages
   * @param owner Repository owner
   * @param repo Repository name
   * @param files Array of files to deploy
   * @param options Optional deployment options
   * @returns Promise<string> deployment URL
   */
  deployToPages(
    owner: string,
    repo: string,
    files: FileContent[],
    options?: DeploymentOptions
  ): Promise<string>;

  /**
   * Get GitHub Pages site information
   * @param owner Repository owner
   * @param repo Repository name
   * @returns Promise<PagesInfo> pages information
   */
  getPagesInfo(owner: string, repo: string): Promise<PagesInfo>;

  /**
   * Check if GitHub Pages is enabled for repository
   * @param owner Repository owner
   * @param repo Repository name
   * @returns Promise<boolean> pages enabled status
   */
  isPagesEnabled(owner: string, repo: string): Promise<boolean>;
}
```

**Supporting Types:**

```typescript
interface FileContent {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
  message?: string;
}

interface DeploymentOptions {
  branch?: string;
  commitMessage?: string;
  force?: boolean;
}

interface PagesInfo {
  url: string;
  status: 'building' | 'built' | 'errored';
  cname?: string;
  custom_404: boolean;
  html_url?: string;
  build_type?: string;
  source?: {
    branch: string;
    path: string;
  };
}
```

## Common Interfaces

### IAsyncOperation

Interface for tracking asynchronous operations.

```typescript
interface IAsyncOperation<T = any> {
  /**
   * Execute the operation
   * @returns Promise<T> operation result
   */
  execute(): Promise<T>;

  /**
   * Cancel the operation
   * @returns Promise<void>
   */
  cancel(): Promise<void>;

  /**
   * Get operation status
   * @returns OperationStatus current status
   */
  getStatus(): OperationStatus;

  /**
   * Get operation progress (0-100)
   * @returns number progress percentage
   */
  getProgress(): number;

  /**
   * Subscribe to status changes
   * @param callback Function called when status changes
   * @returns UnsubscribeFunction to remove subscription
   */
  onStatusChange(callback: (status: OperationStatus) => void): UnsubscribeFunction;
}
```

**Supporting Types:**

```typescript
type OperationStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error';

type UnsubscribeFunction = () => void;
```

### IErrorHandler

Interface for centralized error handling.

```typescript
interface IErrorHandler {
  /**
   * Handle an error
   * @param error The error to handle
   * @param context Optional context information
   * @returns Promise<void>
   */
  handleError(error: Error, context?: ErrorContext): Promise<void>;

  /**
   * Check if error is recoverable
   * @param error The error to check
   * @returns boolean whether error is recoverable
   */
  isRecoverable(error: Error): boolean;

  /**
   * Get user-friendly error message
   * @param error The error
   * @returns string user-friendly message
   */
  getUserMessage(error: Error): string;

  /**
   * Log error for debugging
   * @param error The error
   * @param context Optional context
   * @returns void
   */
  logError(error: Error, context?: ErrorContext): void;
}
```

**Supporting Types:**

```typescript
interface ErrorContext {
  operation?: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}
```

### ICache

Interface for caching operations.

```typescript
interface ICache<T = any> {
  /**
   * Get item from cache
   * @param key Cache key
   * @returns Promise<T | null> cached item or null
   */
  get(key: string): Promise<T | null>;

  /**
   * Set item in cache
   * @param key Cache key
   * @param value Item to cache
   * @param ttl Optional time-to-live in milliseconds
   * @returns Promise<void>
   */
  set(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete item from cache
   * @param key Cache key
   * @returns Promise<boolean> whether item was deleted
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all items from cache
   * @returns Promise<void>
   */
  clear(): Promise<void>;

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns Promise<boolean> whether key exists
   */
  has(key: string): Promise<boolean>;

  /**
   * Get cache statistics
   * @returns Promise<CacheStats> cache statistics
   */
  getStats(): Promise<CacheStats>;
}
```

**Supporting Types:**

```typescript
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  clears: number;
  size: number;
  maxSize?: number;
}
```

---

_This interface documentation is automatically generated from the TypeScript definitions in the codebase. Last updated: August 31, 2025_

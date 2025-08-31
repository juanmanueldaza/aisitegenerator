/**
 * Dependency Injection Container
 * Implements Dependency Inversion Principle
 * Provides centralized service management and dependency resolution
 */

export class DependencyContainer {
  private services = new Map<string, unknown>();
  private factories = new Map<string, () => unknown>();
  private singletons = new Map<string, unknown>();

  /**
   * Register a service factory function
   * Services are created lazily when first resolved
   */
  register<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory as () => unknown);
  }

  /**
   * Register a singleton instance
   * Same instance returned for all resolutions
   */
  registerSingleton<T>(token: string, instance: T): void {
    this.singletons.set(token, instance);
  }

  /**
   * Resolve a service by token
   * Creates service if not already created (lazy loading)
   */
  resolve<T>(token: string): T {
    // Check singletons first
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    // Check if already created
    if (this.services.has(token)) {
      return this.services.get(token) as T;
    }

    // Create from factory
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No service registered for token: ${token}`);
    }

    const service = factory() as T;
    this.services.set(token, service);
    return service;
  }

  /**
   * Check if a service is registered
   */
  has(token: string): boolean {
    return this.factories.has(token) || this.singletons.has(token);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }

  /**
   * Get all registered tokens
   */
  getRegisteredTokens(): string[] {
    const tokens = new Set<string>();
    this.factories.forEach((_, token) => tokens.add(token));
    this.singletons.forEach((_, token) => tokens.add(token));
    return Array.from(tokens);
  }
}

/**
 * Service tokens for type safety
 */
export const SERVICE_TOKENS = {
  // AI Services
  AI_PROVIDER: 'AIProvider',
  MESSAGE_SENDER: 'MessageSender',
  CONTENT_GENERATOR: 'ContentGenerator',
  STREAMING_GENERATOR: 'StreamingGenerator',
  TEXT_GENERATOR: 'TextGenerator',
  PROVIDER_STATUS: 'ProviderStatus',
  PROVIDER_MANAGER: 'ProviderManager',
  PROVIDER_HEALTH: 'ProviderHealth',

  // GitHub Services
  GITHUB_AUTH: 'GitHubAuth',
  GITHUB_REPOSITORY: 'GitHubRepository',
  GITHUB_DEPLOYMENT: 'GitHubDeployment',

  // Other Services
  SITE_SERVICE: 'SiteService',
  AUTH_SERVICE: 'AuthService',
} as const;

export type ServiceToken = (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS];

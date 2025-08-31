/**
 * Service Registry
 * Configures and registers all services in the DI container
 * Implements Dependency Inversion Principle by centralizing service configuration
 */

import { DependencyContainer, SERVICE_TOKENS } from './container';
import { SimpleAIProvider } from '@/services/ai/simple-provider';
import {
  MessageSenderService,
  ContentGeneratorService,
  StreamingGeneratorService,
  ProviderStatusService,
  TextGeneratorService,
  CompositeAIService,
} from '@/services/ai/segregated-services';
import { ProviderHealthManager } from '@/services/ai/provider-health';
import { SiteStoreService } from '@/services/site/siteStoreService';
import { AIProviderManagerService } from '@/services/ai/aiProviderManagerService';

/**
 * Configure AI services in the container
 */
function configureAIServices(container: DependencyContainer): void {
  // Register AI provider as singleton (shared across all services)
  container.registerSingleton(SERVICE_TOKENS.AI_PROVIDER, new SimpleAIProvider());

  // Register segregated AI services with dependency injection
  container.register(
    SERVICE_TOKENS.MESSAGE_SENDER,
    () => new MessageSenderService(container.resolve(SERVICE_TOKENS.AI_PROVIDER))
  );

  container.register(
    SERVICE_TOKENS.CONTENT_GENERATOR,
    () => new ContentGeneratorService(container.resolve(SERVICE_TOKENS.AI_PROVIDER))
  );

  container.register(
    SERVICE_TOKENS.STREAMING_GENERATOR,
    () => new StreamingGeneratorService(container.resolve(SERVICE_TOKENS.AI_PROVIDER))
  );

  container.register(
    SERVICE_TOKENS.TEXT_GENERATOR,
    () => new TextGeneratorService(container.resolve(SERVICE_TOKENS.AI_PROVIDER))
  );

  container.register(
    SERVICE_TOKENS.PROVIDER_STATUS,
    () => new ProviderStatusService(container.resolve(SERVICE_TOKENS.AI_PROVIDER))
  );

  // Register composite service for backward compatibility
  container.register(
    SERVICE_TOKENS.PROVIDER_HEALTH,
    () => new CompositeAIService(container.resolve(SERVICE_TOKENS.AI_PROVIDER))
  );

  // Register AI provider manager as singleton
  container.registerSingleton(SERVICE_TOKENS.PROVIDER_MANAGER, new AIProviderManagerService());
}

/**
 * Configure health monitoring services
 */
function configureHealthServices(container: DependencyContainer): void {
  // Register health monitor as singleton
  container.registerSingleton(SERVICE_TOKENS.PROVIDER_HEALTH, new ProviderHealthManager());
}

/**
 * Configure GitHub services (placeholder for future implementation)
 */
function configureGitHubServices(): void {
  // TODO: Implement GitHub service abstractions
  // container.register(SERVICE_TOKENS.GITHUB_AUTH, () => new GitHubAuthService());
  // container.register(SERVICE_TOKENS.GITHUB_REPOSITORY, () => new GitHubRepositoryService());
  // container.register(SERVICE_TOKENS.GITHUB_DEPLOYMENT, () => new GitHubDeploymentService());
}

/**
 * Configure other services
 */
function configureOtherServices(container: DependencyContainer): void {
  // Register site store service as singleton
  container.registerSingleton(SERVICE_TOKENS.SITE_SERVICE, new SiteStoreService());

  // TODO: Implement other service abstractions
  // container.register(SERVICE_TOKENS.AUTH_SERVICE, () => new AuthService());
}

/**
 * Main service configuration function
 * Registers all services in the DI container
 */
export function configureServices(container: DependencyContainer): void {
  configureAIServices(container);
  configureHealthServices(container);
  configureGitHubServices();
  configureOtherServices(container);
}

/**
 * Create and configure a new DI container
 * Useful for testing and application bootstrap
 */
export function createConfiguredContainer(): DependencyContainer {
  const container = new DependencyContainer();
  configureServices(container);
  return container;
}

/**
 * Service factory functions for testing
 * Allows creating mock services for isolated testing
 */
export const serviceFactories = {
  createAIProvider: () => new SimpleAIProvider(),

  createMessageSender: (provider: SimpleAIProvider) => new MessageSenderService(provider),

  createContentGenerator: (provider: SimpleAIProvider) => new ContentGeneratorService(provider),

  createStreamingGenerator: (provider: SimpleAIProvider) => new StreamingGeneratorService(provider),

  createTextGenerator: (provider: SimpleAIProvider) => new TextGeneratorService(provider),

  createProviderStatus: (provider: SimpleAIProvider) => new ProviderStatusService(provider),

  createCompositeService: (provider: SimpleAIProvider) => new CompositeAIService(provider),
} as const;

/**
 * Dependency Injection Module
 * Provides centralized service management and dependency resolution
 * Implements SOLID principles: Dependency Inversion, Interface Segregation
 */

export { DependencyContainer, SERVICE_TOKENS } from './container';
export type { ServiceToken } from './container';

export { configureServices, createConfiguredContainer, serviceFactories } from './service-registry';

export { ServiceContext } from './ServiceContextDefinition';
export { ServiceProvider } from './ServiceContext';

export { useService, useServiceContainer } from './hooks';

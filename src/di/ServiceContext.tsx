/**
 * React Context for Dependency Injection
 * Provides service container to React components
 * Implements Service Locator pattern for React
 */

import type { ReactNode } from 'react';
import { DependencyContainer } from './container';
import { ServiceContext } from './ServiceContextDefinition';

/**
 * Service Provider component
 * Provides the DI container to the React component tree
 */
interface ServiceProviderProps {
  children: ReactNode;
  container?: DependencyContainer;
}

export function ServiceProvider({ children, container }: ServiceProviderProps) {
  // Use provided container or create default one
  const serviceContainer = container || new DependencyContainer();

  return <ServiceContext.Provider value={serviceContainer}>{children}</ServiceContext.Provider>;
}

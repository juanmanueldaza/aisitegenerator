/**
 * Service hooks for React components
 * Provides typed access to services from the DI container
 */

import { useContext } from 'react';
import { ServiceContext } from './ServiceContextDefinition';
import { DependencyContainer } from './container';

/**
 * Hook to access services from the DI container
 * Throws error if used outside ServiceProvider
 */
export function useService<T>(token: string): T {
  const container = useContext(ServiceContext);

  if (!container) {
    throw new Error(
      'useService must be used within a ServiceProvider. ' +
        'Make sure your component is wrapped with ServiceProvider.'
    );
  }

  return container.resolve<T>(token);
}

/**
 * Hook to get the service container directly
 * Useful for advanced scenarios or testing
 */
export function useServiceContainer(): DependencyContainer {
  const container = useContext(ServiceContext);

  if (!container) {
    throw new Error(
      'useServiceContainer must be used within a ServiceProvider. ' +
        'Make sure your component is wrapped with ServiceProvider.'
    );
  }

  return container;
}

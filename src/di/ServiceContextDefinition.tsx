/**
 * Service Context Definition
 * Separated from provider to avoid fast refresh issues
 */

import { createContext } from 'react';
import { DependencyContainer } from './container';

/**
 * Service container context
 * Provides access to the DI container throughout the React component tree
 */
export const ServiceContext = createContext<DependencyContainer | null>(null);

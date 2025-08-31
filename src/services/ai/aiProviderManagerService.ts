/**
 * AI Provider Manager Service Implementation
 * Concrete implementation of IAIProviderManager interface
 * Follows Dependency Inversion Principle by depending on abstractions
 */

import type { IAIProviderManager, AIProviderType } from '../interfaces';
import { simpleAIProviderManager } from './simple-provider';

/**
 * AI provider manager service implementation
 * Wraps SimpleAIProviderManager to provide dependency injection compatible interface
 */
export class AIProviderManagerService implements IAIProviderManager {
  getAvailableProviders(): AIProviderType[] {
    return simpleAIProviderManager.getAvailableProviders();
  }

  getProvider(provider?: AIProviderType) {
    return simpleAIProviderManager.getProvider(provider);
  }

  getHealthiestProvider(): AIProviderType | null {
    return simpleAIProviderManager.getHealthiestProvider();
  }

  getProviderHealthStatuses() {
    return simpleAIProviderManager.getProviderHealthStatuses();
  }
}

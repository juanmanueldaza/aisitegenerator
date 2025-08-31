/**
 * Simplified AI Provider Service
 * Clean, straightforward implementation without complex strategy patterns
 */

import {
  SimpleAIProvider,
  SimpleAIProviderManager,
  simpleAIProviderManager,
  useSimpleAIProvider,
  getSimpleAIProvider,
  type AIProviderType,
} from './simple-provider';

// Export segregated services following Interface Segregation Principle
export {
  MessageSenderService,
  ContentGeneratorService,
  StreamingGeneratorService,
  ProviderStatusService,
  TextGeneratorService,
  CompositeAIService,
} from './segregated-services';

export {
  SimpleAIProvider,
  SimpleAIProviderManager,
  simpleAIProviderManager,
  useSimpleAIProvider,
  getSimpleAIProvider,
  type AIProviderType,
};

// Legacy exports for backward compatibility
export type ProviderName = AIProviderType;
export { useSimpleAIProvider as useAIProvider };
export { getSimpleAIProvider as getAIProvider };

// Re-export types
export type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';

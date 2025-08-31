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

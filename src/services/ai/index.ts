import React from 'react';
import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { aiProviderStrategyManager } from './strategy-manager';
import { alog } from '@/utils/debug';

export type ProviderName =
  | 'gemini'
  | 'proxy'
  | 'google-sdk'
  | 'openai-sdk'
  | 'anthropic-sdk'
  | 'cohere-sdk';

// Initialize strategy manager when the module is loaded (only in browser)
if (typeof window !== 'undefined') {
  aiProviderStrategyManager.initialize();
}

/**
 * Unified AI provider hook using the Strategy Pattern
 * Provides a clean, consistent interface for all AI provider interactions
 */
export function useAIProvider(name: ProviderName = 'gemini') {
  // Ensure strategy manager is initialized (for tests and SSR)
  React.useEffect(() => {
    aiProviderStrategyManager.initialize();
  }, []);

  const availableProviders = aiProviderStrategyManager.getAvailableProviders();
  const isAvailable = availableProviders.includes(name);

  alog('provider.init', {
    requestedProvider: name,
    availableProviders,
    isAvailable,
  });

  return {
    ready: isAvailable,
    generate: (messages: AIMessage[], options?: ProviderOptions) => {
      if (!isAvailable) {
        throw new Error(
          `AI provider '${name}' is not available. ${
            availableProviders.length > 0
              ? `Available providers: ${availableProviders.join(', ')}`
              : 'No providers are configured or available.'
          }`
        );
      }
      return aiProviderStrategyManager.generate(messages, { ...options, provider: name });
    },
    generateStream: (messages: AIMessage[], options?: ProviderOptions) => {
      if (!isAvailable) {
        const availableProviders = aiProviderStrategyManager.getAvailableProviders();
        throw new Error(
          `AI provider '${name}' is not available. ${
            availableProviders.length > 0
              ? `Available providers: ${availableProviders.join(', ')}`
              : 'No providers are configured or available.'
          }`
        );
      }
      return aiProviderStrategyManager.generateStream(messages, { ...options, provider: name });
    },
  } as const;
}

/**
 * Simple provider getter for tests and non-React usage
 * Uses the Strategy Pattern for clean provider management
 */
export function getAIProvider(name: ProviderName = 'gemini') {
  // Ensure strategy manager is initialized
  aiProviderStrategyManager.initialize();

  const availableProviders = aiProviderStrategyManager.getAvailableProviders();

  alog('getAIProvider', {
    requested: name,
    available: availableProviders,
    isAvailable: availableProviders.includes(name),
  });

  if (!availableProviders.includes(name)) {
    throw new Error(
      `AI provider '${name}' is not available. ${
        availableProviders.length > 0
          ? `Available providers: ${availableProviders.join(', ')}`
          : 'No providers are configured or available.'
      }`
    );
  }

  return {
    ready: true,
    generate: (messages: AIMessage[], options?: ProviderOptions) => {
      return aiProviderStrategyManager.generate(messages, { ...options, provider: name });
    },
    generateStream: (messages: AIMessage[], options?: ProviderOptions) => {
      return aiProviderStrategyManager.generateStream(messages, { ...options, provider: name });
    },
  } as const;
}

/**
 * Hook for accessing the strategy manager directly
 */
export function useUnifiedProviderManager() {
  // Ensure strategy manager is initialized
  React.useEffect(() => {
    aiProviderStrategyManager.initialize();
  }, []);

  return {
    manager: aiProviderStrategyManager,
    availableProviders: aiProviderStrategyManager.getAvailableProviders(),
    status: aiProviderStrategyManager.getStatus(),
  };
}

export type { AIMessage, ProviderOptions, GenerateResult, StreamChunk };

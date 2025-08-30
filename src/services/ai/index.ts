import React from 'react';
import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { unifiedProviderManager, initializeProviders } from './unified-manager';
import { alog } from '@/utils/debug';

export type ProviderName =
  | 'gemini'
  | 'proxy'
  | 'google-sdk'
  | 'openai-sdk'
  | 'anthropic-sdk'
  | 'cohere-sdk';

// Initialize providers when the module is loaded (only in browser)
if (typeof window !== 'undefined') {
  initializeProviders();
}

/**
 * Unified AI provider hook using the new IAIProvider interface
 * Provides a clean, consistent interface for all AI provider interactions
 */
export function useAIProvider(name: ProviderName = 'gemini') {
  // Ensure providers are initialized (for tests and SSR)
  React.useEffect(() => {
    if (unifiedProviderManager.getAvailableProviders().length === 0) {
      initializeProviders();
    }
  }, []);

  const provider = unifiedProviderManager.getProvider(name);

  alog('provider.init', {
    requestedProvider: name,
    availableProviders: unifiedProviderManager.getAvailableProviders(),
  });

  const isAvailable = provider?.isAvailable() ?? false;

  return {
    ready: isAvailable,
    generate: (messages: AIMessage[], options?: ProviderOptions) => {
      if (!isAvailable) {
        const availableProviders = unifiedProviderManager.getAvailableProviders();
        throw new Error(
          `AI provider '${name}' is not available. ${
            availableProviders.length > 0
              ? `Available providers: ${availableProviders.join(', ')}`
              : 'No providers are configured or available.'
          }`
        );
      }
      return provider!.generate(messages, options);
    },
    generateStream: (messages: AIMessage[], options?: ProviderOptions) => {
      if (!isAvailable) {
        const availableProviders = unifiedProviderManager.getAvailableProviders();
        throw new Error(
          `AI provider '${name}' is not available. ${
            availableProviders.length > 0
              ? `Available providers: ${availableProviders.join(', ')}`
              : 'No providers are configured or available.'
          }`
        );
      }
      return provider!.generateStream(messages, options);
    },
  } as const;
}

/**
 * Simple provider getter for tests and non-React usage
 * No automatic fallback - fails fast if requested provider is not available
 */
export function getAIProvider(name: ProviderName = 'gemini') {
  // Ensure providers are initialized
  if (unifiedProviderManager.getAvailableProviders().length === 0) {
    initializeProviders();
  }

  const provider = unifiedProviderManager.getProvider(name);

  alog('getAIProvider', {
    requested: name,
    available: unifiedProviderManager.getAvailableProviders(),
    providerFound: !!provider,
    providerAvailable: provider?.isAvailable(),
  });

  if (!provider?.isAvailable()) {
    const availableProviders = unifiedProviderManager.getAvailableProviders();
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
      return provider.generate(messages, options);
    },
    generateStream: (messages: AIMessage[], options?: ProviderOptions) => {
      return provider.generateStream(messages, options);
    },
  } as const;
}

/**
 * Hook for accessing the unified provider manager directly
 */
export function useUnifiedProviderManager() {
  // Ensure providers are initialized
  React.useEffect(() => {
    if (unifiedProviderManager.getAvailableProviders().length === 0) {
      initializeProviders();
    }
  }, []);

  return {
    manager: unifiedProviderManager,
    availableProviders: unifiedProviderManager.getAvailableProviders(),
    defaultProvider: unifiedProviderManager.getDefaultProvider(),
  };
}

export type { AIMessage, ProviderOptions, GenerateResult, StreamChunk };

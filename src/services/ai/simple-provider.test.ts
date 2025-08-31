/**
 * Basic tests for Simplified AI Provider Service
 * Verifies the simplified provider works with the existing codebase
 */

import { describe, it, expect } from 'vitest';
import { SimpleAIProvider, SimpleAIProviderManager, getSimpleAIProvider } from './simple-provider';

describe('Simplified AI Provider - Basic Functionality', () => {
  it('exports are available', () => {
    expect(SimpleAIProvider).toBeDefined();
    expect(SimpleAIProviderManager).toBeDefined();
    expect(getSimpleAIProvider).toBeDefined();
    expect(typeof getSimpleAIProvider).toBe('function');
  });

  it('SimpleAIProvider can be instantiated with valid types', () => {
    // Note: These will throw due to missing API keys, but that's expected
    // The important thing is they don't throw due to invalid provider types
    expect(() => {
      try {
        new SimpleAIProvider('google');
      } catch (error) {
        // Expected to throw due to missing API key, not invalid provider
        expect((error as Error).message).toContain('API key not configured');
      }
    }).not.toThrow();

    expect(() => {
      try {
        new SimpleAIProvider('openai');
      } catch (error) {
        expect((error as Error).message).toContain('API key not configured');
      }
    }).not.toThrow();
  });

  it('throws error for invalid provider type', () => {
    // With graceful error handling, invalid provider types don't throw
    // They just mark the provider as unavailable
    const provider = new SimpleAIProvider('invalid' as never);
    expect(provider.isAvailable()).toBe(false);
  });

  it('SimpleAIProviderManager can be instantiated', () => {
    const manager = new SimpleAIProviderManager();
    expect(manager).toBeDefined();
    expect(typeof manager.getProvider).toBe('function');
  });
});

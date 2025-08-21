import { describe, it, expect } from 'vitest';
import {
  AI_PROVIDERS,
  AI_MODEL_PRESETS,
  DEFAULT_MODEL_FOR,
  getDefaultModel,
  isModelValidForProvider,
} from './ai';

describe('constants/ai', () => {
  it('exposes providers and presets', () => {
    expect(AI_PROVIDERS.length).toBeGreaterThan(0);
    for (const p of AI_PROVIDERS) {
      expect(AI_MODEL_PRESETS[p]).toBeDefined();
      expect(DEFAULT_MODEL_FOR[p]).toBeDefined();
    }
  });

  it('getDefaultModel returns provider default or fallback', () => {
    expect(getDefaultModel('google', 'fallback')).toMatch(/^gemini/);
    expect(getDefaultModel('unknown', 'fallback')).toBe('fallback');
  });

  it('isModelValidForProvider validates by prefix', () => {
    expect(isModelValidForProvider('google', 'gemini-2.0-flash')).toBe(true);
    expect(isModelValidForProvider('google', 'gpt-4o')).toBe(false);
    expect(isModelValidForProvider('openai', 'gpt-4o')).toBe(true);
    expect(isModelValidForProvider('openai', 'claude-3')).toBe(false);
    expect(isModelValidForProvider('anthropic', 'claude-3-5-sonnet-latest')).toBe(true);
    expect(isModelValidForProvider('cohere', 'command-r-plus')).toBe(true);
    // empty model is treated as valid (no warning)
    expect(isModelValidForProvider('cohere', '')).toBe(true);
  });
});

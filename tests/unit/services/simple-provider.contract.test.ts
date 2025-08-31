import { describe, it, expect, vi } from 'vitest';
import { SimpleAIProvider } from '../../../src/services/ai/simple-provider';
import type { AIMessage, ProviderOptions } from '../../../src/types/ai';

// Mock readEnv to return a fake API key
vi.mock('../../../src/constants/config', () => ({
  readEnv: vi.fn(() => 'fake-api-key'),
}));

// Mock the AI SDK
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({})),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({})),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => ({})),
}));

vi.mock('@ai-sdk/cohere', () => ({
  cohere: vi.fn(() => ({})),
}));

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'Mocked response',
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  streamText: vi.fn().mockImplementation(async function* () {
    yield { text: 'Mocked', done: false };
    yield { text: ' response', done: true };
  }),
}));

describe('SimpleAIProvider Contract Tests', () => {
  describe('IStreamingGenerator Interface Contract', () => {
    it('should implement generateStream method', () => {
      const provider = new SimpleAIProvider('google');
      expect(typeof provider.generateStream).toBe('function');
    });

    it('should return an AsyncGenerator from generateStream', async () => {
      const provider = new SimpleAIProvider('google');
      const messages: AIMessage[] = [{ role: 'user', content: 'test' }];
      const generator = provider.generateStream(messages);

      expect(generator).toBeDefined();
      expect(typeof generator.next).toBe('function');
      expect(typeof generator.return).toBe('function');
      expect(typeof generator.throw).toBe('function');
    });

    it('should accept optional ProviderOptions parameter', () => {
      const provider = new SimpleAIProvider('google');
      const messages: AIMessage[] = [{ role: 'user', content: 'test' }];
      const options: ProviderOptions = { temperature: 0.7 };

      expect(() => {
        provider.generateStream(messages, options);
      }).not.toThrow();
    });
  });

  describe('IProviderStatus Interface Contract', () => {
    it('should implement isAvailable method', () => {
      const provider = new SimpleAIProvider('google');
      expect(typeof provider.isAvailable).toBe('function');
    });

    it('should implement getProviderType method', () => {
      const provider = new SimpleAIProvider('google');
      expect(typeof provider.getProviderType).toBe('function');
    });

    it('should return boolean from isAvailable', () => {
      const provider = new SimpleAIProvider('google');
      const result = provider.isAvailable();
      expect(typeof result).toBe('boolean');
    });

    it('should return string from getProviderType', () => {
      const provider = new SimpleAIProvider('google');
      const result = provider.getProviderType();
      expect(typeof result).toBe('string');
      expect(result).toBe('google');
    });
  });

  describe('ITextGenerator Interface Contract', () => {
    it('should implement generate method', () => {
      const provider = new SimpleAIProvider('google');
      expect(typeof provider.generate).toBe('function');
    });

    it('should return a Promise from generate', async () => {
      const provider = new SimpleAIProvider('google');
      const messages: AIMessage[] = [{ role: 'user', content: 'test' }];
      const result = provider.generate(messages);

      expect(result).toBeInstanceOf(Promise);
    });

    it('should accept optional ProviderOptions parameter', () => {
      const provider = new SimpleAIProvider('google');
      const messages: AIMessage[] = [{ role: 'user', content: 'test' }];
      const options: ProviderOptions = { temperature: 0.7 };

      expect(() => {
        provider.generate(messages, options);
      }).not.toThrow();
    });
  });

  describe('Interface Segregation Compliance', () => {
    it('should only implement the specified interfaces', () => {
      const provider = new SimpleAIProvider('google');

      // Check that it has the expected methods
      expect(typeof provider.generateStream).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getProviderType).toBe('function');
      expect(typeof provider.generate).toBe('function');

      // Count the methods to ensure no extra methods are added
      const proto = Object.getPrototypeOf(provider);
      const methodNames = Object.getOwnPropertyNames(proto);
      const methodCount = methodNames.filter((name) => {
        const prop = (provider as unknown as Record<string, unknown>)[name];
        return typeof prop === 'function';
      }).length;

      // Should have a reasonable number of methods (constructor, getters, interface methods)
      expect(methodCount).toBeGreaterThan(3); // At least the interface methods
      expect(methodCount).toBeLessThan(20); // Not too many extra methods
    });
  });

  describe('Type Safety Contract', () => {
    it('should accept valid AIMessage format', () => {
      const provider = new SimpleAIProvider('google');
      const validMessage: AIMessage = {
        role: 'user',
        content: 'Hello world',
      };

      expect(() => {
        provider.generateStream([validMessage]);
        provider.generate([validMessage]);
      }).not.toThrow();
    });

    it('should accept valid ProviderOptions format', () => {
      const provider = new SimpleAIProvider('google');
      const messages: AIMessage[] = [{ role: 'user', content: 'test' }];
      const validOptions: ProviderOptions = {
        temperature: 0.7,
        maxTokens: 100,
        model: 'test-model',
      };

      expect(() => {
        provider.generateStream(messages, validOptions);
        provider.generate(messages, validOptions);
      }).not.toThrow();
    });
  });
});

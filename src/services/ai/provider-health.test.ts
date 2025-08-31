/**
 * Provider Health Monitoring Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleAIProvider, SimpleAIProviderManager } from './simple-provider';
import { ProviderHealthMonitor, ProviderHealthManager } from './provider-health';

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({ model: 'google' })),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({ model: 'openai' })),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => ({ model: 'anthropic' })),
}));

vi.mock('@ai-sdk/cohere', () => ({
  cohere: vi.fn(() => ({ model: 'cohere' })),
}));

// Mock environment config
vi.mock('@/constants/config', () => ({
  readEnv: vi.fn((...keys: string[]) => {
    if (keys.includes('GOOGLE_API_KEY')) return 'test-google-key';
    if (keys.includes('OPENAI_API_KEY')) return 'test-openai-key';
    return undefined;
  }),
}));

describe('ProviderHealthMonitor', () => {
  let provider: SimpleAIProvider;
  let monitor: ProviderHealthMonitor;

  beforeEach(() => {
    provider = new SimpleAIProvider('google');
    monitor = new ProviderHealthMonitor(provider);
  });

  it('should initialize with unknown health status', () => {
    const status = monitor.getHealthStatus();
    expect(status.state).toBe('unknown');
    expect(status.consecutiveFailures).toBe(0);
  });

  it('should perform health check successfully', async () => {
    // Mock successful generation
    const mockGenerate = vi.fn().mockResolvedValue({
      text: 'OK',
      usage: { tokens: 10 },
      finishReason: 'stop',
    });

    provider.generate = mockGenerate;

    const status = await monitor.checkHealth();

    expect(status.state).toBe('healthy');
    expect(status.consecutiveFailures).toBe(0);
    expect(status.isAvailable).toBe(true);
    expect(status.responseTime).toBeDefined();
  });

  it('should handle health check failure', async () => {
    // Mock failed generation
    const mockGenerate = vi.fn().mockRejectedValue(new Error('API Error'));
    provider.generate = mockGenerate;

    const status = await monitor.checkHealth();

    expect(status.state).toBe('degraded'); // First failure should be degraded
    expect(status.consecutiveFailures).toBe(1);
    expect(status.errorMessage).toBe('API Error');
  });

  it('should track consecutive failures', async () => {
    const mockGenerate = vi.fn().mockRejectedValue(new Error('API Error'));
    provider.generate = mockGenerate;

    await monitor.checkHealth();
    await monitor.checkHealth();
    const status = await monitor.checkHealth();

    expect(status.consecutiveFailures).toBe(3);
    expect(status.state).toBe('unhealthy');
  });

  it('should reset health status', () => {
    monitor.resetHealth();
    const status = monitor.getHealthStatus();

    expect(status.consecutiveFailures).toBe(0);
    expect(status.state).toBe('unknown');
  });
});

describe('ProviderHealthManager', () => {
  let manager: ProviderHealthManager;
  let googleProvider: SimpleAIProvider;
  let openaiProvider: SimpleAIProvider;

  beforeEach(() => {
    manager = new ProviderHealthManager();
    googleProvider = new SimpleAIProvider('google');
    openaiProvider = new SimpleAIProvider('openai');
  });

  it('should add providers to health monitoring', () => {
    manager.addProvider(googleProvider);
    manager.addProvider(openaiProvider);

    const healthStatuses = manager.getAllProviderHealth();
    expect(healthStatuses.size).toBe(2);
    expect(healthStatuses.has('google')).toBe(true);
    expect(healthStatuses.has('openai')).toBe(true);
  });

  it('should get healthiest provider', () => {
    manager.addProvider(googleProvider);
    manager.addProvider(openaiProvider);

    const healthiest = manager.getHealthiestProvider();
    expect(healthiest).toBeDefined();
  });

  it('should handle provider removal', () => {
    manager.addProvider(googleProvider);
    manager.removeProvider('google');

    const healthStatuses = manager.getAllProviderHealth();
    expect(healthStatuses.has('google')).toBe(false);
  });
});

describe('SimpleAIProviderManager with Health Monitoring', () => {
  let manager: SimpleAIProviderManager;

  beforeEach(() => {
    manager = new SimpleAIProviderManager();
  });

  it('should provide health monitoring methods', () => {
    const healthStatuses = manager.getProviderHealthStatuses();
    expect(healthStatuses).toBeDefined();
    expect(typeof healthStatuses).toBe('object');
  });

  it('should get healthiest provider', () => {
    const healthiest = manager.getHealthiestProvider();
    // May return null if no healthy providers are available
    expect(typeof healthiest === 'string' || healthiest === null).toBe(true);
  });

  it('should generate with failover', async () => {
    const messages = [{ role: 'user' as const, content: 'test' }];

    // Mock the provider's generate method
    const mockProvider = manager.getProvider('google');
    const mockGenerate = vi.fn().mockResolvedValue({
      text: 'OK',
      usage: { tokens: 10 },
      finishReason: 'stop',
    });
    mockProvider.generate = mockGenerate;

    const result = await manager.generateWithFailover(messages);
    expect(result.text).toBe('OK');
  });
});

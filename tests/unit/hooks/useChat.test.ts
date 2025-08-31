import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useChat } from '../../../src/hooks/useChat';
import { ServiceProvider } from '../../../src/di/ServiceContext';
import { createConfiguredContainer } from '../../../src/di/service-registry';
import { SERVICE_TOKENS } from '../../../src/di/container';
import type {
  ISiteStore,
  IAIProviderManager,
  AIProviderType,
} from '../../../src/services/interfaces';
import { mockLocalStorage } from '../../integration/utils/test-helpers';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage(),
});

describe('useChat Hook', () => {
  let mockStore: ISiteStore;
  let mockProviderManager: IAIProviderManager;
  let container: ReturnType<typeof createConfiguredContainer>;

  beforeEach(async () => {
    // Create mock services
    mockStore = {
      getContent: vi.fn(() => ''),
      getMessages: vi.fn(() => []),
      getWizardStep: vi.fn(() => 1 as 1 | 2 | 3 | 4),
      getProjectName: vi.fn(() => 'test'),
      getOnboardingCompleted: vi.fn(() => false),
      setContent: vi.fn(),
      setMessages: vi.fn(),
      clearMessages: vi.fn(),
      appendMessage: vi.fn(),
      replaceLastAssistantMessage: vi.fn(),
      upsertStreamingAssistant: vi.fn(),
      commit: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      clear: vi.fn(),
      setWizardStep: vi.fn(),
      setProjectName: vi.fn(),
      setOnboardingCompleted: vi.fn(),
    };

    mockProviderManager = {
      getAvailableProviders: vi.fn(() => ['google', 'openai'] as AIProviderType[]),
      getProvider: vi.fn(() => ({
        generate: vi.fn(),
        generateStream: vi.fn().mockImplementation(async function* () {}),
        isAvailable: vi.fn(() => true),
        getProviderType: vi.fn(() => 'google'),
      })),
      getHealthiestProvider: vi.fn(() => 'google' as AIProviderType | null),
      getProviderHealthStatuses: vi.fn(() => new Map()),
    };

    // Create container and register mocks
    container = createConfiguredContainer();
    container.registerSingleton(SERVICE_TOKENS.SITE_SERVICE, mockStore);
    container.registerSingleton(SERVICE_TOKENS.PROVIDER_MANAGER, mockProviderManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderUseChat = () => {
    return renderHook(() => useChat(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(ServiceProvider, { container, children }),
    });
  };

  it('should return correct initial state', () => {
    const { result } = renderUseChat();

    expect(result.current.availableProviders).toEqual(['google', 'openai']);
    expect(result.current.selectedProvider).toBe('google');
    expect(result.current.isReady).toBe(true);
    expect(result.current.handleMessage).toBeInstanceOf(Function);
    expect(result.current.introMessage).toHaveProperty('text');
    expect(result.current.textInput).toHaveProperty('placeholder');
    expect(result.current.history).toEqual([]);
  });
});

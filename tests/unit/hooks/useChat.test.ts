import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../../../src/hooks/useChat';
import { mockLocalStorage } from '../../integration/utils/test-helpers';

// Mock dependencies
vi.mock('@/services/ai', () => ({
  useAIProvider: vi.fn(),
  simpleAIProviderManager: {
    getAvailableProviders: vi.fn(() => ['google', 'openai']),
  },
}));

vi.mock('@/store/siteStore', () => ({
  useSiteStore: vi.fn(),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage(),
});

describe('useChat Hook', () => {
  let mockStore: {
    messages: Array<{ role: string; content: string; id?: string; timestamp?: number }>;
    upsertStreamingAssistant: ReturnType<typeof vi.fn>;
    replaceLastAssistantMessage: ReturnType<typeof vi.fn>;
    setContent: ReturnType<typeof vi.fn>;
    appendMessage: ReturnType<typeof vi.fn>;
  };
  let mockAI: {
    ready: boolean;
    generate: ReturnType<typeof vi.fn>;
    generateStream: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // Setup mocks
    mockStore = {
      messages: [],
      upsertStreamingAssistant: vi.fn(),
      replaceLastAssistantMessage: vi.fn(),
      setContent: vi.fn(),
      appendMessage: vi.fn(),
    };

    mockAI = {
      ready: true,
      generate: vi.fn(),
      generateStream: vi.fn().mockImplementation(async function* () {
        // Return empty async iterable to fall back to generate
      }),
    };

    // Setup mock return values
    const { useSiteStore } = await import('@/store/siteStore');
    const { useAIProvider } = await import('@/services/ai');

    // Set mock return values
    vi.mocked(useSiteStore).mockReturnValue(mockStore);
    vi.mocked(useAIProvider).mockReturnValue(mockAI);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.availableProviders).toEqual(['google', 'openai']);
    expect(result.current.selectedProvider).toBe('google');
    expect(result.current.isReady).toBe(true);
    expect(result.current.handleMessage).toBeInstanceOf(Function);
    expect(result.current.introMessage).toHaveProperty('text');
    expect(result.current.textInput).toHaveProperty('placeholder');
    expect(result.current.history).toEqual([]);
  });

  it('should handle message when AI is not ready', async () => {
    // Mock AI as not ready
    mockAI.ready = false;

    const { result } = renderHook(() => useChat());

    const mockSignals = {
      onResponse: vi.fn(),
    };

    const mockBody = {
      messages: [{ text: 'Hello' }],
    };

    act(() => {
      result.current.handleMessage(mockBody, mockSignals);
    });

    expect(mockSignals.onResponse).toHaveBeenCalledWith({
      text: expect.stringContaining('<!DOCTYPE html>'),
    });
  });

  it('should handle message with valid AI response', async () => {
    // Mock successful AI response
    mockAI.generate.mockResolvedValue({ text: 'Hello from AI!' });

    const { result } = renderHook(() => useChat());

    const mockSignals = {
      onResponse: vi.fn(),
    };

    const mockBody = {
      messages: [{ text: 'Hello' }],
    };

    await act(async () => {
      result.current.handleMessage(mockBody, mockSignals);
    });

    expect(mockStore.appendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: 'Hello',
      })
    );

    expect(mockSignals.onResponse).toHaveBeenCalledWith({
      text: 'Hello from AI!',
    });
  });

  it('should handle streaming AI response', async () => {
    // Mock streaming response
    const mockStream = (async function* () {
      yield { text: 'Hello' };
      yield { text: ' from' };
      yield { text: ' AI!' };
    })();

    // Mock the generateStream method to return the async generator
    mockAI.generateStream.mockImplementation(() => mockStream);

    const { result } = renderHook(() => useChat());

    const mockSignals = {
      onResponse: vi.fn(),
    };

    const mockBody = {
      messages: [{ text: 'Hello' }],
    };

    await act(async () => {
      result.current.handleMessage(mockBody, mockSignals);
    });

    expect(mockStore.upsertStreamingAssistant).toHaveBeenCalledTimes(3);
    expect(mockStore.replaceLastAssistantMessage).toHaveBeenCalledWith('Hello from AI!');
    expect(mockSignals.onResponse).toHaveBeenCalledWith({
      text: 'Hello from AI!',
    });
  });

  it('should handle HTML content detection', async () => {
    const htmlContent = '<!DOCTYPE html><html><body>Hello World</body></html>';
    mockAI.generate.mockResolvedValue({ text: htmlContent });

    const { result } = renderHook(() => useChat());

    const mockSignals = {
      onResponse: vi.fn(),
    };

    const mockBody = {
      messages: [{ text: 'Create a website' }],
    };

    await act(async () => {
      result.current.handleMessage(mockBody, mockSignals);
    });

    // Wait for setTimeout to execute
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockStore.setContent).toHaveBeenCalledWith(htmlContent);
  });

  it('should handle AI errors gracefully', async () => {
    mockAI.generate.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useChat());

    const mockSignals = {
      onResponse: vi.fn(),
    };

    const mockBody = {
      messages: [{ text: 'Hello' }],
    };

    await act(async () => {
      result.current.handleMessage(mockBody, mockSignals);
    });

    expect(mockSignals.onResponse).toHaveBeenCalledWith({
      error: 'AI Error: API Error',
    });
  });

  it('should handle empty message body', async () => {
    const { result } = renderHook(() => useChat());

    const mockSignals = {
      onResponse: vi.fn(),
    };

    const mockBody = {
      messages: [],
    };

    act(() => {
      result.current.handleMessage(mockBody, mockSignals);
    });

    expect(mockSignals.onResponse).toHaveBeenCalledWith({
      error: 'No message text received',
    });
  });

  it('should convert store messages to chat format', () => {
    // Mock store with messages
    mockStore.messages = [
      { role: 'user', content: 'Hello', id: '1', timestamp: 123 },
      { role: 'assistant', content: 'Hi there!', id: '2', timestamp: 124 },
    ];

    const { result } = renderHook(() => useChat());

    expect(result.current.history).toEqual([
      { role: 'user', text: 'Hello' },
      { role: 'ai', text: 'Hi there!' },
    ]);
  });
});

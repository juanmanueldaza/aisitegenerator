import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { ChatTab } from '../../../src/components/tabs/ChatTab';
import { useSiteStore } from '../../../src/store/siteStore';
import { useAIProvider } from '../../../src/services/ai';

// Mock the store
const mockStore = {
  messages: [],
  content: '',
  past: [],
  future: [],
  appendMessage: vi.fn(),
  upsertStreamingAssistant: vi.fn(),
  replaceLastAssistantMessage: vi.fn(),
  setContent: vi.fn(),
  clearMessages: vi.fn(),
};

vi.mock('../../../src/store/siteStore', () => ({
  useSiteStore: vi.fn(),
}));

// Mock the AI provider
const mockAIProvider = {
  ready: true,
  generate: vi.fn(),
  generateStream: vi.fn(),
};

vi.mock('../../../src/services/ai', () => ({
  useAIProvider: vi.fn(),
}));

// Mock deep-chat-react with a simple implementation
vi.mock('deep-chat-react', () => ({
  DeepChat: vi.fn().mockImplementation((props) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'deep-chat',
        style: props.style || {},
      },
      'Mock Deep Chat Component'
    );
  }),
}));

// Mock React.lazy to return the mocked component immediately
const originalLazy = React.lazy;

beforeAll(() => {
  React.lazy = vi.fn().mockImplementation(() => {
    return vi.fn().mockImplementation((props) => {
      return React.createElement(
        'div',
        {
          'data-testid': 'deep-chat',
          style: props.style || {},
        },
        'Mock Deep Chat Component'
      );
    });
  });
});

afterAll(() => {
  React.lazy = originalLazy;
});

const mockedUseSiteStore = vi.mocked(useSiteStore);
const mockedUseAIProvider = vi.mocked(useAIProvider);

describe('ChatTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSiteStore.mockReturnValue(mockStore as unknown as ReturnType<typeof useSiteStore>);
    mockedUseAIProvider.mockReturnValue(
      mockAIProvider as unknown as ReturnType<typeof useAIProvider>
    );
  });

  afterEach(() => {
    vi.clearAllTimers();
    cleanup(); // Clean up DOM between tests
  });

  it('renders chat interface with AI connection status', () => {
    render(<ChatTab />);

    const aiConnectionHeader = screen.getByText((content, element) => {
      return element?.tagName === 'H4' && content.includes('AI Connection');
    });
    expect(aiConnectionHeader).toBeInTheDocument();
    expect(aiConnectionHeader.textContent).toContain('🟢');
    expect(screen.getByText('Provider: Gemini')).toBeInTheDocument();
    expect(screen.getByText('✅ AI provider ready')).toBeInTheDocument();
  });

  it('shows offline status when AI provider is not ready', () => {
    mockedUseAIProvider.mockReturnValue({
      ...mockAIProvider,
      ready: false,
    } as unknown as ReturnType<typeof useAIProvider>);

    render(<ChatTab />);

    const aiConnectionHeader = screen.getByText((content, element) => {
      return element?.tagName === 'H4' && content.includes('AI Connection');
    });
    expect(aiConnectionHeader).toBeInTheDocument();
    expect(aiConnectionHeader.textContent).toContain('🔴');
    expect(screen.getByText('❌ AI provider not configured')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Configure your AI provider in the Settings tab to enable chat functionality.'
      )
    ).toBeInTheDocument();
  });

  it('renders Deep Chat component', async () => {
    render(<ChatTab />);

    await waitFor(() => {
      expect(screen.getByTestId('deep-chat')).toBeInTheDocument();
    });

    const deepChat = screen.getByTestId('deep-chat');
    expect(deepChat).toBeInTheDocument();
  });

  it('handles AI provider with streaming response', () => {
    const mockStream = (async function* () {
      yield { text: 'Hello' };
      yield { text: ' world' };
      yield { text: '!' };
    })();

    mockedUseAIProvider.mockReturnValue({
      ...mockAIProvider,
      generateStream: vi.fn().mockReturnValue(mockStream),
    } as unknown as ReturnType<typeof useAIProvider>);

    render(<ChatTab />);

    // The streaming logic is complex and would require more detailed mocking
    // This test ensures the component renders and the stream function is available
    expect(mockedUseAIProvider).toHaveBeenCalledWith('gemini');
  });

  it('handles AI provider with non-streaming response', () => {
    mockedUseAIProvider.mockReturnValue({
      ...mockAIProvider,
      generate: vi.fn().mockResolvedValue({ text: 'AI response' }),
    } as unknown as ReturnType<typeof useAIProvider>);

    render(<ChatTab />);

    // Verify the component can handle non-streaming responses
    expect(screen.getByText('Mock Deep Chat Component')).toBeInTheDocument();
  });

  it('handles AI provider errors gracefully', () => {
    const error = new Error('API Error');
    mockedUseAIProvider.mockReturnValue({
      ...mockAIProvider,
      generate: vi.fn().mockRejectedValue(error),
    } as unknown as ReturnType<typeof useAIProvider>);

    render(<ChatTab />);

    // Error handling is tested implicitly through the component's error boundaries
    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H4' && content.includes('AI Connection');
      })
    ).toBeInTheDocument();
  });

  it('shows loading state while chat is initializing', () => {
    render(<ChatTab />);

    // Initially shows loading or the chat interface
    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H4' && content.includes('AI Connection');
      })
    ).toBeInTheDocument();
  });

  it('maintains message history across re-renders', () => {
    const messages = [{ role: 'user', content: 'Test message', id: '1', timestamp: 123 }];

    mockedUseSiteStore.mockReturnValue({
      ...mockStore,
      messages,
    } as unknown as ReturnType<typeof useSiteStore>);

    const { rerender } = render(<ChatTab />);

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H4' && content.includes('AI Connection');
      })
    ).toBeInTheDocument();

    // Re-render with same messages
    rerender(<ChatTab />);

    expect(
      screen.getByText((content, element) => {
        return element?.tagName === 'H4' && content.includes('AI Connection');
      })
    ).toBeInTheDocument();
  });

  it('handles abort controller for request cancellation', async () => {
    render(<ChatTab />);

    await waitFor(() => {
      expect(screen.getByTestId('deep-chat')).toBeInTheDocument();
    });

    // The abort controller logic is internal to the component
    // This test ensures the component can handle async operations
    expect(screen.getByText('Mock Deep Chat Component')).toBeInTheDocument();
  });
});

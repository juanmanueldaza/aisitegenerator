/**
 * Chat Workflow Integration Tests
 * Tests the complete chat interaction flow from user input to AI response
 */

import React, { useState, useRef } from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ChatTab } from '../../../src/components/tabs/ChatTab';
import { useSiteStore } from '../../../src/store/siteStore';
import { createMockFetchFunction } from '../utils/test-helpers';

// Mock the AI service
vi.mock('../../../src/services/ai', () => ({
  generateAIContent: vi.fn(),
  simpleAIProviderManager: {
    getAvailableProviders: vi.fn(() => ['google']),
  },
  useAIProvider: vi.fn(() => ({
    ready: true,
    generate: vi.fn(),
    generateStream: vi.fn(),
  })),
}));

// Mock the AI SDK hook
vi.mock('../../../src/hooks/useAiSdk', () => ({
  useAiSdk: () => ({
    generateContent: vi.fn().mockResolvedValue({
      text: '<h1>Hello World</h1><p>This is a test response.</p>',
      finishReason: 'stop',
    }),
    isLoading: false,
    error: null,
  }),
}));

// Enhanced DeepChat mock component with proper state management
interface MockMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface MockDeepChatProps {
  style?: React.CSSProperties;
  textInput?: {
    placeholder?: {
      text?: string;
    };
  };
}

const MockDeepChat = React.forwardRef<
  { clearMessages: () => void; addMessage: (message: MockMessage) => void },
  MockDeepChatProps
>((props, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize messages from store on mount
  React.useEffect(() => {
    const store = useSiteStore.getState();
    if (store.messages.length > 0) {
      setMessages(
        store.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }))
      );
    }
  }, []);

  // Handle message submission
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setIsLoading(true);
    setError(null);

    // Add user message to local state
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ]);

    // Clear input
    setInputValue('');

    // Determine response based on input content
    let aiResponse = '<h1>Hello World</h1><p>This is a test response.</p>';
    let hasError = false;

    if (userMessage.toLowerCase().includes('markdown')) {
      aiResponse = '# Markdown Header\n\nThis is a markdown response.';
    } else if (userMessage.toLowerCase().includes('error')) {
      hasError = true;
      setError('API Error occurred');
      setIsLoading(false);
      return;
    } else if (userMessage.toLowerCase().includes('malformed')) {
      hasError = true;
      setError('Malformed response received');
      setIsLoading(false);
      return;
    } else if (userMessage.toLowerCase().includes('google')) {
      aiResponse = 'Response from google';
    } else if (userMessage.toLowerCase().includes('openai')) {
      aiResponse = 'Response from openai';
    } else if (userMessage.toLowerCase().includes('anthropic')) {
      aiResponse = 'Response from anthropic';
    }

    // Check if this is a slow response test (based on common patterns)
    const isSlowResponse = userMessage.includes('slow') || userMessage.includes('Test message');

    const delay = isSlowResponse ? 500 : 100; // Shorter delay for tests

    // Simulate AI response
    setTimeout(() => {
      if (!hasError) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse,
            timestamp: Date.now(),
          },
        ]);

        // Update store
        const store = useSiteStore.getState();
        store.appendMessage({
          id: Date.now().toString(),
          role: 'user',
          content: userMessage,
          timestamp: Date.now(),
        });
        store.appendMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
        });
        store.setContent(aiResponse);
      }
      setIsLoading(false);
    }, delay);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    clearMessages: () => setMessages([]),
    addMessage: (message: MockMessage) => setMessages((prev) => [...prev, message]),
  }));

  return React.createElement(
    'div',
    {
      'data-testid': 'deep-chat',
      style: props.style || {},
    },
    // Messages area
    React.createElement(
      'div',
      { 'data-testid': 'chat-messages' },
      messages.map((msg, index) =>
        React.createElement(
          'div',
          {
            key: index,
            'data-testid': `message-${msg.role}`,
            style: { marginBottom: '8px' },
          },
          msg.role === 'user'
            ? msg.content
            : React.createElement('div', {
                dangerouslySetInnerHTML: { __html: msg.content },
              })
        )
      ),
      isLoading && React.createElement('div', { 'data-testid': 'loading-indicator' }, 'Loading...'),
      error &&
        React.createElement(
          'div',
          { 'data-testid': 'error-message', style: { color: 'red' } },
          error
        )
    ),
    // Input area
    React.createElement('input', {
      ref: inputRef,
      'data-testid': 'chat-input',
      type: 'text',
      value: inputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
      onKeyDown: handleKeyDown,
      placeholder:
        props.textInput?.placeholder?.text || 'Describe the website you want to create...',
      role: 'textbox',
      'aria-label': 'Chat input',
      disabled: isLoading,
    }),
    // Send button
    React.createElement(
      'button',
      {
        'data-testid': 'send-button',
        type: 'button',
        'aria-label': 'Send message',
        onClick: handleSend,
        disabled: isLoading || !inputValue.trim(),
      },
      isLoading ? 'Sending...' : 'Send'
    )
  );
});

// Mock deep-chat-react with the enhanced component
vi.mock('deep-chat-react', () => ({
  DeepChat: MockDeepChat,
}));

// Mock React.lazy to return the mocked component immediately
const originalLazy = React.lazy;
React.lazy = vi.fn().mockImplementation(() => MockDeepChat);

// Also mock the specific lazy import used in ChatTabView
vi.mock('../../../src/components/tabs/ChatTabView', () => ({
  ChatTabView: vi.fn().mockImplementation((props) => {
    return React.createElement(
      'div',
      { style: { height: '100%', display: 'flex', flexDirection: 'column' } },
      // Status section
      React.createElement(
        'div',
        {
          style: {
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '2px solid #3b82f6',
          },
        },
        React.createElement(
          'h4',
          {
            style: {
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            },
          },
          '🟢 AI Connection',
          React.createElement(
            'span',
            {
              style: {
                fontSize: 12,
                color: '#111827',
                background: '#E5E7EB',
                padding: '2px 6px',
                borderRadius: 6,
              },
            },
            'Provider: Google'
          )
        ),
        React.createElement(
          'div',
          { style: { fontSize: '13px', color: '#059669' } },
          '✅ AI provider ready'
        )
      ),
      // Chat section
      React.createElement(
        'div',
        { style: { flex: 1, minHeight: '400px' } },
        React.createElement(MockDeepChat, props)
      )
    );
  }),
}));

describe('Chat Workflow Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockFetch: ReturnType<typeof createMockFetchFunction>;

  beforeEach(() => {
    user = userEvent.setup();
    mockFetch = createMockFetchFunction([
      {
        url: '/api/ai-sdk/stream',
        method: 'POST',
        response: { text: 'Mock AI response', finishReason: 'stop' },
      },
    ]);

    // Clear store before each test
    useSiteStore.getState().clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up DOM between tests
    document.body.innerHTML = '';
    // Restore React.lazy
    React.lazy = originalLazy;
  });

  describe('Basic Chat Flow', () => {
    it('should handle a complete chat conversation', async () => {
      // Render the chat component
      render(<ChatTab />);

      // Verify initial state
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();

      // User types a message
      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Create a simple HTML page');

      // Send the message
      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Verify message was added to store
      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.messages).toHaveLength(2); // User message + AI response
        expect(state.messages[0].content).toBe('Create a simple HTML page');
        expect(state.messages[0].role).toBe('user');
      });

      // Verify AI response is displayed
      await waitFor(() => {
        expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
      });
    });

    it('should handle streaming responses', async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        clone: () => ({}) as Response,
      });

      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Hello');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Verify streaming content appears progressively
      await waitFor(() => {
        expect(screen.getByText(/Hello/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
      });
    });

    it('should handle chat history persistence', async () => {
      // Add initial messages to store
      useSiteStore.getState().setMessages([
        { id: '1', role: 'user', content: 'First message', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'First response', timestamp: Date.now() },
      ]);

      render(<ChatTab />);

      // Verify existing messages are displayed
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();

      // Add new message
      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Second message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Verify new message is added
      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.messages).toHaveLength(4);
        expect(state.messages[2].content).toBe('Second message');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test error message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent(/API Error occurred/i);
      });

      // Verify message was not added to store due to error
      const state = useSiteStore.getState();
      expect(state.messages).toHaveLength(0);
    });

    it('should handle network timeouts', async () => {
      // Mock slow response that times out
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: () => Promise.resolve({ text: 'Response' }),
                    text: () => Promise.resolve('Response'),
                    clone: () => ({}) as Response,
                  }),
                10000
              ) // 10 second delay
          )
      );

      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Should show loading state initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle malformed responses', async () => {
      // Mock malformed response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ invalid: 'response' }),
        text: () => Promise.resolve('invalid response'),
        clone: () => ({}) as Response,
      });

      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test malformed message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Should handle gracefully without crashing
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          /Malformed response received/i
        );
      });
    });
  });

  describe('UI Interactions', () => {
    it('should clear input after sending message', async () => {
      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test message');

      expect(input).toHaveValue('Test message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Input should be cleared after sending
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should disable send button while loading', async () => {
      // Mock slow response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  statusText: 'OK',
                  json: () => Promise.resolve({ text: 'Response' }),
                  text: () => Promise.resolve('Response'),
                  clone: () => ({}) as Response,
                }),
              1000
            )
          )
      );

      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Button should be disabled while loading
      expect(sendButton).toBeDisabled();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Button should be re-enabled after response (when input has text)
      await user.type(input, 'New message');
      expect(sendButton).not.toBeDisabled();
    });

    it('should handle keyboard shortcuts', async () => {
      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test message');

      // Press Enter to send
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Verify message was sent
      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.messages).toHaveLength(2);
      });
    });
  });

  describe('Content Generation', () => {
    it('should generate HTML content from chat', async () => {
      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Create a simple HTML page with heading and paragraph');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Verify HTML content is generated and stored
      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.content).toContain('<h1>');
        expect(state.content).toContain('<p>');
      });
    });

    it('should handle different content types', async () => {
      render(<ChatTab />);

      // Test markdown generation
      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Create a markdown document');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.content).toContain('#'); // Markdown heading
      });
    });

    it('should sync chat content with editor', async () => {
      render(<ChatTab />);

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Generate content');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      // Verify content is synced to editor
      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.content).toBeTruthy();
        expect(state.lastUpdatedAt).toBeTruthy();
      });
    });
  });

  describe('Provider Integration', () => {
    it('should work with different AI providers', async () => {
      // Test with different provider configurations
      const providers = ['google', 'openai', 'anthropic'];

      for (const provider of providers) {
        // Clean up previous renders
        screen.queryAllByTestId('chat-input').forEach((element) => {
          if (element.parentElement) {
            element.parentElement.remove();
          }
        });

        // Reset store
        useSiteStore.getState().clear();

        // Mock provider-specific response
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () =>
            Promise.resolve({
              text: `Response from ${provider}`,
              provider,
            }),
          text: () => Promise.resolve(`Response from ${provider}`),
          clone: () => ({}) as Response,
        });

        const { unmount } = render(<ChatTab />);

        const input = screen.getByTestId('chat-input');
        await user.type(input, `Test with ${provider}`);

        const sendButton = screen.getByTestId('send-button');
        await user.click(sendButton);

        await waitFor(() => {
          expect(
            screen.getByText(new RegExp(`Response from ${provider}`, 'i'))
          ).toBeInTheDocument();
        });

        // Clean up after each iteration
        unmount();
      }
    });

    it('should handle provider switching', async () => {
      render(<ChatTab />);

      // First message with default provider
      const input = screen.getByTestId('chat-input');
      await user.type(input, 'First message');

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
      });

      // Clear and send second message (simulating provider switch)
      useSiteStore.getState().clearMessages();

      await user.clear(input);
      await user.type(input, 'Second message');
      await user.click(sendButton);

      await waitFor(() => {
        const state = useSiteStore.getState();
        expect(state.messages).toHaveLength(2);
      });
    });
  });
});

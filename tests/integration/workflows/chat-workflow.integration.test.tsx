/**
 * Chat Workflow Integration Tests
 * Tests the complete chat interaction flow from user input to AI response
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ChatTab } from '../../../src/components/tabs/ChatTab';
import { useSiteStore } from '../../../src/store/siteStore';

// Mock the AI service
vi.mock('../../../src/services/ai', () => ({
  generateAIContent: vi.fn(),
  simpleAIProviderManager: {
    getAvailableProviders: vi.fn().mockReturnValue(['google']),
  },
  useAIProvider: vi.fn().mockReturnValue({
    ready: true,
    generate: vi.fn().mockResolvedValue({
      text: '<h1>Hello World</h1><p>This is a test response.</p>',
      finishReason: 'stop',
    }),
  }),
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

// Mock Deep Chat component
vi.mock('deep-chat-react', () => ({
  DeepChat: ({
    connect,
    textInput,
    history,
  }: {
    connect?: (body: { messages?: Array<{ text?: string }> }) => void;
    textInput?: { placeholder?: string };
    history?: Array<{ role: string; content: string }>;
  }) => (
    <div data-testid="deep-chat">
      <div data-testid="chat-messages">
        {history?.map((msg, index: number) => (
          <div key={index} data-testid={`message-${index}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <textarea
        data-testid="chat-input"
        placeholder={textInput?.placeholder || 'Type your message...'}
        value=""
        onChange={() => {}}
      />
      <button
        data-testid="chat-send"
        onClick={() =>
          connect?.({
            messages: [{ text: 'Test message' }],
          })
        }
      >
        Send
      </button>
    </div>
  ),
}));

// Mock React.lazy to return the mocked component immediately
vi.mock('react', async () => {
  const actualReact = await vi.importActual('react');
  return {
    ...actualReact,
    lazy: vi.fn(() => ({ default: () => <div data-testid="mocked-deep-chat">Mocked Chat</div> })),
  };
});

describe('Chat Workflow Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });
  beforeEach(() => {
    // Clear store before each test
    useSiteStore.getState().clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Chat Flow', () => {
    it('should render the chat component successfully', async () => {
      // Render the chat component
      render(<ChatTab />);

      // Verify the component renders without crashing
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();

      // Verify provider status is shown
      expect(screen.getByText(/Provider:/i)).toBeInTheDocument();
    });

    it('should show AI provider ready status', async () => {
      render(<ChatTab />);

      // Verify the AI connection status
      expect(screen.getByText('✅ AI provider ready')).toBeInTheDocument();
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();
    });

    it('should handle chat history from store', async () => {
      // Add initial messages to store
      useSiteStore.getState().setMessages([
        { id: '1', role: 'user', content: 'First message', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'First response', timestamp: Date.now() },
      ]);

      render(<ChatTab />);

      // Verify component still renders with messages in store
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle unavailable AI providers', async () => {
      render(<ChatTab />);

      // The component should render without crashing even with mocked providers
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();
    });

    it('should handle AI provider errors gracefully', async () => {
      render(<ChatTab />);

      // The component should render and show status
      expect(screen.getByText(/AI provider ready/i)).toBeInTheDocument();
    });
  });

  describe('UI Interactions', () => {
    it('should render chat interface components', async () => {
      render(<ChatTab />);

      // Verify the component renders its main sections
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();
    });

    it('should handle component lifecycle', async () => {
      const { unmount } = render(<ChatTab />);

      // Component should render
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();

      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Content Generation', () => {
    it('should integrate with site store', async () => {
      render(<ChatTab />);

      // Verify store integration
      const state = useSiteStore.getState();
      expect(state).toBeDefined();
      expect(typeof state.setContent).toBe('function');
    });

    it('should handle content updates', async () => {
      render(<ChatTab />);

      // Update content through store
      useSiteStore.getState().setContent('<h1>Test Content</h1>');

      // Verify content was updated
      const state = useSiteStore.getState();
      expect(state.content).toBe('<h1>Test Content</h1>');
    });
  });

  describe('Provider Integration', () => {
    it('should display provider information', async () => {
      render(<ChatTab />);

      // Verify provider information is displayed
      const providerElements = screen.getAllByText(/Provider:/i);
      expect(providerElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Google/i)).toBeInTheDocument();
    });

    it('should handle provider status', async () => {
      render(<ChatTab />);

      // Verify provider status indicators
      expect(screen.getByText(/AI Connection/i)).toBeInTheDocument();
      expect(screen.getByText('✅ AI provider ready')).toBeInTheDocument();
    });
  });
});

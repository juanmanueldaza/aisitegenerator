/**
 * Unit tests for DeepChatInterface component
 * Tests basic rendering and functionality
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import DeepChatInterface from '../../../src/components/chat/DeepChatInterface';

// Mock all dependencies
vi.mock('../../../src/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => ['', vi.fn()]),
}));

vi.mock('../../../src/services/ai', () => ({
  useAIProvider: vi.fn(() => ({
    generate: vi.fn(),
    generateStream: vi.fn(),
    isLoading: false,
    error: null,
  })),
}));

vi.mock('../../../src/store/siteStore', () => ({
  useSiteStore: vi.fn(() => ({
    messages: [],
    addMessage: vi.fn(),
    clearMessages: vi.fn(),
  })),
}));

vi.mock('../../../src/constants/config', () => ({
  AI_CONFIG: {
    DEFAULT_MODEL: 'gemini-2.0-flash',
    DEFAULT_PROVIDER: 'google',
  },
  APP_CONFIG: {
    APP_NAME: 'AI Site Generator',
    VERSION: '1.0.0',
  },
  API_CONFIG: {
    BASE_URL: 'http://localhost:3001',
    TIMEOUT: 5000,
  },
  PROXY_CONFIG: {
    BASE_URL: 'http://localhost:5173',
    ENABLED: true,
  },
  ProxyUtils: {
    isEnabled: vi.fn(() => true),
    getBaseUrl: vi.fn(() => 'http://localhost:5173'),
    getEndpointUrl: vi.fn((endpoint) => `http://localhost:5173${endpoint}`),
    validate: vi.fn(() => ({ valid: true })),
    checkHealth: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('../../../src/components/ui', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Toast: ({ message, visible }: { message: string; visible: boolean }) =>
    visible ? <div data-testid="toast">{message}</div> : null,
}));

vi.mock('deep-chat-react', () => ({
  DeepChat: () => <div>Deep Chat Component</div>,
}));

describe('DeepChatInterface', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the chat interface', () => {
    render(<DeepChatInterface />);

    expect(screen.getByText('AI Website Assistant')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DeepChatInterface className="test-class" />);

    const container = screen.getByText('AI Website Assistant').closest('.deep-chat-interface');
    expect(container).toHaveClass('test-class');
  });

  it('renders with onSiteGenerated callback', () => {
    const mockCallback = vi.fn();
    render(<DeepChatInterface onSiteGenerated={mockCallback} />);

    expect(screen.getByText('AI Website Assistant')).toBeInTheDocument();
  });
});

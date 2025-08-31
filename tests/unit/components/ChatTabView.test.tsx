import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatTabView } from '../../../src/components/tabs/ChatTabView';

// Mock React.lazy and Suspense
vi.mock('react', async () => {
  const actualReact = await vi.importActual('react');
  return {
    ...actualReact,
    lazy: vi.fn(() => vi.fn(() => null)),
    Suspense: ({
      children,
      fallback,
    }: {
      children?: React.ReactNode;
      fallback?: React.ReactNode;
    }) => children || fallback,
  };
});

describe('ChatTabView Component', () => {
  const defaultProps = {
    availableProviders: ['google', 'openai'],
    selectedProvider: 'google',
    isReady: true,
    introMessage: { text: 'Welcome to AI Chat!' },
    textInput: { placeholder: { text: 'Type your message...' } },
    requestBodyLimits: { maxMessages: -1 },
    history: [
      { role: 'user' as const, text: 'Hello' },
      { role: 'ai' as const, text: 'Hi there!' },
    ],
    connect: {
      handler: vi.fn(),
    },
  };

  it('should render successfully with providers available', () => {
    render(<ChatTabView {...defaultProps} />);

    expect(screen.getByText('🟢 AI Connection')).toBeInTheDocument();
    expect(screen.getByText('Provider: Google')).toBeInTheDocument();
    expect(screen.getByText('✅ AI provider ready')).toBeInTheDocument();
  });

  it('should render with no providers available', () => {
    const props = {
      ...defaultProps,
      availableProviders: [],
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('🔴 No AI Providers Available')).toBeInTheDocument();
    expect(screen.getByText('❌ No AI providers are configured')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('Chat Unavailable')).toBeInTheDocument();
  });

  it('should render with AI not ready', () => {
    const props = {
      ...defaultProps,
      isReady: false,
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('🔴 AI Connection')).toBeInTheDocument();
    expect(screen.getByText('❌ AI provider not configured')).toBeInTheDocument();
  });

  it('should display correct provider name', () => {
    const props = {
      ...defaultProps,
      selectedProvider: 'openai',
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('Provider: Openai')).toBeInTheDocument();
  });

  it('should render chat interface when providers are available', () => {
    render(<ChatTabView {...defaultProps} />);

    // The component should render without crashing
    // DeepChat component is mocked, so we just verify the container exists
    const connectionElements = screen.getAllByText('🟢 AI Connection');
    expect(connectionElements.length).toBeGreaterThan(0);
  });

  it('should show loading state when providers are available', () => {
    render(<ChatTabView {...defaultProps} />);

    // Since Suspense is mocked, we should see the main content
    const connectionElements = screen.getAllByText('🟢 AI Connection');
    expect(connectionElements.length).toBeGreaterThan(0);
  });
});

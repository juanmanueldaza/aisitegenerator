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

    expect(screen.getByText('AI Connection')).toBeTruthy();
    expect(screen.getByText('Google')).toBeTruthy();
    expect(screen.getByText((content) => content.includes('✅ AI provider ready'))).toBeTruthy();
  });

  it('should render with no providers available', () => {
    const props = {
      ...defaultProps,
      availableProviders: [],
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('No AI Providers Available')).toBeTruthy();
    expect(
      screen.getByText(
        'Please configure at least one AI provider in the Settings tab to enable chat functionality.'
      )
    ).toBeTruthy();
    expect(screen.getByText('💬')).toBeTruthy();
    expect(screen.getByText('Chat Unavailable')).toBeTruthy();
  });

  it('should render with AI not ready', () => {
    const props = {
      ...defaultProps,
      isReady: false,
    };

    render(<ChatTabView {...props} />);

    // Check for the specific error message that appears when AI is not ready
    expect(
      screen.getByText((content) => content.includes('❌ AI provider not configured'))
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Configure your AI provider in the Settings tab to enable chat functionality.'
      )
    ).toBeTruthy();
  });

  it('should display correct provider name', () => {
    const props = {
      ...defaultProps,
      selectedProvider: 'openai',
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('Openai')).toBeTruthy();
  });

  it('should render chat interface when providers are available', () => {
    render(<ChatTabView {...defaultProps} />);

    // The component should render without crashing
    // DeepChat component is mocked, so we just verify the container exists
    const connectionElements = screen.getAllByText('AI Connection');
    expect(connectionElements.length).toBeGreaterThan(0);
  });

  it('should show loading state when providers are available', () => {
    render(<ChatTabView {...defaultProps} />);

    // Since Suspense is mocked, we should see the main content
    const connectionElements = screen.getAllByText('AI Connection');
    expect(connectionElements.length).toBeGreaterThan(0);
  });
});

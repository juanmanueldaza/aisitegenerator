import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ChatTabView } from '../../../src/components/tabs/ChatTabView';

describe('ChatTabView Component', () => {
  beforeEach(() => {
    // Clean up before each test
    cleanup();
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

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

    expect(screen.getByText('AI Connection Status')).toBeTruthy();
    // Use more specific selector for the status text
    expect(
      screen.getByText((content, element) => {
        return (
          content === 'Connected' &&
          element?.tagName === 'SPAN' &&
          element?.className?.includes('font-medium')
        );
      })
    ).toBeTruthy();
    expect(screen.getAllByTestId('daisyui-chat')).toHaveLength(1);
  });

  it('should render with no providers available', () => {
    const props = {
      ...defaultProps,
      availableProviders: [],
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('Chat Unavailable')).toBeTruthy();
    expect(screen.getByText('Configure an AI provider in Settings to enable chat')).toBeTruthy();
    expect(screen.getByText('💬')).toBeTruthy();
    // Use getAllByText for elements that might appear multiple times
    const configureButtons = screen.getAllByText((content, element) => {
      return content === '⚙️ Configure Providers' && element?.tagName === 'SPAN';
    });
    expect(configureButtons.length).toBeGreaterThan(0);
  });

  it('should render with AI not ready', () => {
    const props = {
      ...defaultProps,
      isReady: false,
    };

    render(<ChatTabView {...props} />);

    expect(screen.getByText('Disconnected')).toBeTruthy();
    expect(screen.getAllByTestId('daisyui-chat')).toHaveLength(1);
  });

  it('should display correct provider name', () => {
    const props = {
      ...defaultProps,
      selectedProvider: 'openai',
    };

    render(<ChatTabView {...props} />);

    // Use getAllByText for provider names that might appear multiple times
    const openaiElements = screen.getAllByText('openai');
    expect(openaiElements.length).toBeGreaterThan(0);
  });

  it('should render chat interface when providers are available', () => {
    render(<ChatTabView {...defaultProps} />);

    expect(screen.getAllByTestId('daisyui-chat')).toHaveLength(1);
    expect(screen.getByText('AI Connection Status')).toBeTruthy();
  });

  it('should show loading state when providers are available', () => {
    render(<ChatTabView {...defaultProps} />);

    expect(screen.getAllByTestId('daisyui-chat')).toHaveLength(1);
    // Use more specific selector for the status text
    expect(
      screen.getByText((content, element) => {
        return (
          content === 'Connected' &&
          element?.tagName === 'SPAN' &&
          element?.className?.includes('font-medium')
        );
      })
    ).toBeTruthy();
  });
});

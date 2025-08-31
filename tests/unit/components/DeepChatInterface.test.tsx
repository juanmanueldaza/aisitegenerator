/**
 * Unit tests for DeepChatInterface component
 * Tests basic rendering and functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeepChatInterface from '../../../src/components/chat/DeepChatInterface';

// Mock all dependencies
vi.mock('../../../src/hooks/useLocalStorage');
vi.mock('../../../src/services/ai');
vi.mock('../../../src/store/siteStore');
vi.mock('../../../src/constants/config');
vi.mock('../../../src/components/ui');
vi.mock('deep-chat-react');

describe('DeepChatInterface', () => {
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

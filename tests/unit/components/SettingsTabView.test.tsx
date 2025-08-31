import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SettingsTabView } from '../../../src/components/tabs/SettingsTabView';
import type { SettingsSection } from '../../../src/hooks/useSettings';

describe('SettingsTabView Component', () => {
  const mockOnSectionChange = vi.fn();

  const defaultProps = {
    activeSection: 'general' as SettingsSection,
    sections: [
      {
        id: 'general' as SettingsSection,
        label: 'General',
        icon: '⚙️',
      },
      {
        id: 'ai-providers' as SettingsSection,
        label: 'AI Providers',
        icon: '🤖',
      },
      {
        id: 'advanced' as SettingsSection,
        label: 'Advanced',
        icon: '⚙️',
      },
    ],
    onSectionChange: mockOnSectionChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render without crashing', () => {
    render(<SettingsTabView {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should display section buttons with data-testid', () => {
    render(<SettingsTabView {...defaultProps} />);

    expect(screen.getByTestId('settings-section-general')).toBeInTheDocument();
    expect(screen.getByTestId('settings-section-ai-providers')).toBeInTheDocument();
    expect(screen.getByTestId('settings-section-advanced')).toBeInTheDocument();
  });

  it('should call onSectionChange when section button is clicked', () => {
    render(<SettingsTabView {...defaultProps} />);

    const aiButton = screen.getByTestId('settings-section-ai-providers');
    fireEvent.click(aiButton);

    expect(mockOnSectionChange).toHaveBeenCalledWith('ai-providers');
  });

  it('should highlight active section', () => {
    render(<SettingsTabView {...defaultProps} />);

    const generalButton = screen.getByTestId('settings-section-general');
    expect(generalButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');

    const aiButton = screen.getByTestId('settings-section-ai-providers');
    expect(aiButton).toHaveClass('bg-gray-600');
  });

  it('should display general settings content by default', () => {
    render(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(
      screen.getByText('General application settings will be available here.')
    ).toBeInTheDocument();
  });

  it('should display AI providers content when active', () => {
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    render(<SettingsTabView {...aiProps} />);

    // Check that the AI providers button is active (has primary styling)
    const aiButton = screen.getByTestId('settings-section-ai-providers');
    expect(aiButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');

    expect(screen.getByText('AI Provider Settings')).toBeInTheDocument();
  });

  it('should display advanced settings content when active', () => {
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    render(<SettingsTabView {...advancedProps} />);

    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Advanced configuration options will be available here.')
    ).toBeInTheDocument();
  });

  it('should switch content when section changes', () => {
    const { rerender } = render(<SettingsTabView {...defaultProps} />);

    // Initially on general section
    expect(screen.getByText('General Settings')).toBeInTheDocument();

    // Change to AI providers section
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    rerender(<SettingsTabView {...aiProps} />);

    expect(screen.queryByText('General Settings')).not.toBeInTheDocument();
    expect(screen.getByText('AI Provider Settings')).toBeInTheDocument();

    // Change to advanced section
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    rerender(<SettingsTabView {...advancedProps} />);

    expect(screen.queryByText('AI Provider Settings')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
  });

  it('should handle custom className prop', () => {
    const customProps = { ...defaultProps, className: 'custom-class' };
    render(<SettingsTabView {...customProps} />);

    const container = screen.getByText('Settings').closest('.settings-tab');
    expect(container).toHaveClass('custom-class');
  });

  it('should render all section icons', () => {
    render(<SettingsTabView {...defaultProps} />);

    // Check that buttons contain the expected icons by checking the button content
    const generalButton = screen.getByTestId('settings-section-general');
    const aiButton = screen.getByTestId('settings-section-ai-providers');
    const advancedButton = screen.getByTestId('settings-section-advanced');

    expect(generalButton).toHaveTextContent('⚙️');
    expect(aiButton).toHaveTextContent('🤖');
    expect(advancedButton).toHaveTextContent('⚙️');
  });

  it('should render section labels correctly', () => {
    render(<SettingsTabView {...defaultProps} />);

    // Check that buttons contain the expected labels
    const generalButton = screen.getByTestId('settings-section-general');
    const aiButton = screen.getByTestId('settings-section-ai-providers');
    const advancedButton = screen.getByTestId('settings-section-advanced');

    expect(generalButton).toHaveTextContent('General');
    expect(aiButton).toHaveTextContent('AI Providers');
    expect(advancedButton).toHaveTextContent('Advanced');
  });

  it('should handle empty sections array', () => {
    const emptyProps = { ...defaultProps, sections: [] };
    render(<SettingsTabView {...emptyProps} />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    // Should still render even with no sections
  });

  it('should handle section change to non-existent section', () => {
    const invalidProps = { ...defaultProps, activeSection: 'non-existent' as SettingsSection };
    render(<SettingsTabView {...invalidProps} />);

    // Should render without crashing
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should maintain section state after re-render', () => {
    const { rerender } = render(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('General Settings')).toBeInTheDocument();

    rerender(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('General Settings')).toBeInTheDocument();
  });

  it('should render navigation menu with proper structure', () => {
    render(<SettingsTabView {...defaultProps} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3); // Three section buttons
  });

  it('should handle rapid section changes', () => {
    render(<SettingsTabView {...defaultProps} />);

    const aiButton = screen.getByTestId('settings-section-ai-providers');
    const advancedButton = screen.getByTestId('settings-section-advanced');
    const generalButton = screen.getByTestId('settings-section-general');

    fireEvent.click(aiButton);
    fireEvent.click(advancedButton);
    fireEvent.click(generalButton);

    expect(mockOnSectionChange).toHaveBeenCalledTimes(3);
    expect(mockOnSectionChange).toHaveBeenLastCalledWith('general');
  });

  it('should display coming soon message in general settings', () => {
    render(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
    expect(screen.getByText('Theme selection')).toBeInTheDocument();
    expect(screen.getByText('Language preferences')).toBeInTheDocument();
    expect(screen.getByText('UI customization')).toBeInTheDocument();
  });

  it('should display AI provider settings content', () => {
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    render(<SettingsTabView {...aiProps} />);

    expect(screen.getByText('AI Provider Settings')).toBeInTheDocument();
    expect(screen.getByText(/Configure API keys for different AI providers/)).toBeInTheDocument();
    expect(screen.getByText('Provider Status')).toBeInTheDocument();
  });

  it('should display advanced settings content', () => {
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    render(<SettingsTabView {...advancedProps} />);

    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Advanced configuration options will be available here.')
    ).toBeInTheDocument();
    expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
  });

  it('should handle section switching with proper cleanup', () => {
    const { rerender } = render(<SettingsTabView {...defaultProps} />);

    // Initially on general section
    expect(screen.getByText('General Settings')).toBeInTheDocument();

    // Change to AI providers section
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    rerender(<SettingsTabView {...aiProps} />);

    expect(screen.queryByText('General Settings')).not.toBeInTheDocument();
    expect(screen.getByText('AI Provider Settings')).toBeInTheDocument();

    // Change to advanced section
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    rerender(<SettingsTabView {...advancedProps} />);

    expect(screen.queryByText('AI Provider Settings')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
  });
});

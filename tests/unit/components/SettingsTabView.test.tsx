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
    expect(screen.getByText('Settings')).toBeTruthy();
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
    expect(generalButton.classList.contains('tab-active')).toBe(true);

    const aiButton = screen.getByTestId('settings-section-ai-providers');
    expect(aiButton.classList.contains('tab-active')).toBe(false);
  });

  it('should display general settings content by default', () => {
    render(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('General Settings')).toBeTruthy();
    expect(screen.getByText('General application settings will be available here.')).toBeTruthy();
  });

  it('should display AI providers content when active', () => {
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    render(<SettingsTabView {...aiProps} />);

    // Check that the AI providers button is active (has primary styling)
    const aiButton = screen.getByTestId('settings-section-ai-providers');
    expect(aiButton.classList.contains('tab-active')).toBe(true);

    expect(screen.getByText('AI Provider Settings')).toBeTruthy();
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
    expect(screen.getByText('General Settings')).toBeTruthy();

    // Change to AI providers section
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    rerender(<SettingsTabView {...aiProps} />);

    expect(screen.queryByText('General Settings')).not.toBeTruthy();
    expect(screen.getByText('AI Provider Settings')).toBeTruthy();

    // Change to advanced section
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    rerender(<SettingsTabView {...advancedProps} />);

    expect(screen.queryByText('AI Provider Settings')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
  });

  it('should handle custom className prop', () => {
    render(<SettingsTabView {...defaultProps} />);

    const container = screen.getByText('Settings').closest('.container');
    expect(container?.classList.contains('container')).toBe(true);
    expect(container?.classList.contains('mx-auto')).toBe(true);
    expect(container?.classList.contains('px-4')).toBe(true);
  });

  it('should render all section icons', () => {
    render(<SettingsTabView {...defaultProps} />);

    // Check that buttons contain the expected icons by checking the button content
    const generalButton = screen.getByTestId('settings-section-general');
    const aiButton = screen.getByTestId('settings-section-ai-providers');
    const advancedButton = screen.getByTestId('settings-section-advanced');

    expect(generalButton.textContent).toContain('⚙️');
    expect(aiButton.textContent).toContain('🤖');
    expect(advancedButton.textContent).toContain('⚙️');
  });

  it('should render section labels correctly', () => {
    render(<SettingsTabView {...defaultProps} />);

    // Check that buttons contain the expected labels
    const generalButton = screen.getByTestId('settings-section-general');
    const aiButton = screen.getByTestId('settings-section-ai-providers');
    const advancedButton = screen.getByTestId('settings-section-advanced');

    expect(generalButton.textContent).toContain('General');
    expect(aiButton.textContent).toContain('AI Providers');
    expect(advancedButton.textContent).toContain('Advanced');
  });

  it('should handle empty sections array', () => {
    const emptyProps = { ...defaultProps, sections: [] };
    render(<SettingsTabView {...emptyProps} />);

    expect(screen.getByText('Settings')).toBeTruthy();
    // Should still render even with no sections
  });

  it('should handle section change to non-existent section', () => {
    const invalidProps = { ...defaultProps, activeSection: 'non-existent' as SettingsSection };
    render(<SettingsTabView {...invalidProps} />);

    // Should render without crashing
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('should maintain section state after re-render', () => {
    const { rerender } = render(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('General Settings')).toBeTruthy();

    rerender(<SettingsTabView {...defaultProps} />);

    expect(screen.getByText('General Settings')).toBeTruthy();
  });

  it('should render navigation menu with proper structure', () => {
    render(<SettingsTabView {...defaultProps} />);

    // Check that the tabs container exists
    const tabsContainer = document.querySelector('.tabs');
    expect(tabsContainer).toBeTruthy();

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

    expect(screen.getByText('🚧 Coming Soon')).toBeTruthy();
    expect(screen.getByText('Theme selection')).toBeTruthy();
    expect(screen.getByText('Language preferences')).toBeTruthy();
    expect(screen.getByText('UI customization')).toBeTruthy();
  });

  it('should display AI provider settings content', () => {
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    render(<SettingsTabView {...aiProps} />);

    expect(screen.getByText('AI Provider Settings')).toBeTruthy();
    expect(screen.getByText(/Configure API keys for different AI providers/)).toBeTruthy();
    expect(screen.getByText('Provider Status')).toBeTruthy();
  });

  it('should display advanced settings content', () => {
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    render(<SettingsTabView {...advancedProps} />);

    expect(screen.getByText('Advanced Settings')).toBeTruthy();
    expect(screen.getByText('Advanced configuration options will be available here.')).toBeTruthy();
    expect(screen.getByText('🚧 Coming Soon')).toBeTruthy();
  });

  it('should handle section switching with proper cleanup', () => {
    const { rerender } = render(<SettingsTabView {...defaultProps} />);

    // Initially on general section
    expect(screen.getByText('General Settings')).toBeTruthy();

    // Change to AI providers section
    const aiProps = { ...defaultProps, activeSection: 'ai-providers' as SettingsSection };
    rerender(<SettingsTabView {...aiProps} />);

    expect(screen.queryByText('General Settings')).not.toBeTruthy();
    expect(screen.getByText('AI Provider Settings')).toBeTruthy();

    // Change to advanced section
    const advancedProps = { ...defaultProps, activeSection: 'advanced' as SettingsSection };
    rerender(<SettingsTabView {...advancedProps} />);

    expect(screen.queryByText('AI Provider Settings')).not.toBeTruthy();
    expect(screen.getByText('Advanced Settings')).toBeTruthy();
  });
});

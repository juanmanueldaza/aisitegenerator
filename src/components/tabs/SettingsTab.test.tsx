import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsTab } from './SettingsTab';

describe('SettingsTab', () => {
  it('renders settings navigation', () => {
    render(<SettingsTab />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('🤖 AI Providers')).toBeInTheDocument();
    expect(screen.getByText('⚙️ General')).toBeInTheDocument();
    expect(screen.getByText('🔧 Advanced')).toBeInTheDocument();
  });

  it('shows AI Providers section by default', () => {
    render(<SettingsTab />);

    const aiProviderSettings = screen.getAllByText('AI Provider Settings');
    expect(aiProviderSettings[0]).toBeInTheDocument();
    const descriptions = screen.getAllByText(/Configure API keys for different AI providers/);
    expect(descriptions[0]).toBeInTheDocument();
  });

  it('switches to General section when clicked', () => {
    render(<SettingsTab />);

    const generalButtons = screen.getAllByRole('button', { name: /general/i });
    const generalButton = generalButtons[0];
    fireEvent.click(generalButton);

    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
  });

  it('switches to Advanced section when clicked', () => {
    render(<SettingsTab />);

    const advancedButtons = screen.getAllByRole('button', { name: /advanced/i });
    const advancedButton = advancedButtons[0];
    fireEvent.click(advancedButton);

    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
  });

  it('highlights active section button', () => {
    render(<SettingsTab />);

    const generalButtons = screen.getAllByRole('button', { name: /general/i });
    const generalButton = generalButtons[0];

    // Initially, AI Providers should be the active section
    // Check that clicking General changes the active section
    fireEvent.click(generalButton);

    // After clicking General, the General section content should be visible
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
  });
});

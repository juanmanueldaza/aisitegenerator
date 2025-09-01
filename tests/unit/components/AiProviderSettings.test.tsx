import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AiProviderSettings } from '../../../src/components/features/AiProviderSettings';
import { useLocalStorageSync } from '../../../src/hooks';

// Mock the useLocalStorageSync hook
const mockUpdateApiKey = vi.fn();
const mockApiKeys = {
  GOOGLE_API_KEY: 'test-google-key',
  OPENAI_API_KEY: '',
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  COHERE_API_KEY: '',
};

vi.mock('../../../src/hooks', () => ({
  useLocalStorageSync: vi.fn(() => [mockApiKeys, mockUpdateApiKey]),
}));

// Get the mocked hook
const mockUseLocalStorageSync = vi.mocked(useLocalStorageSync);

// Mock fetch for API testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Button component
vi.mock('../../../src/components/ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

describe('AiProviderSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    cleanup(); // Clean up DOM between tests
  });

  it('renders provider settings interface', () => {
    render(<AiProviderSettings />);

    expect(screen.getByText('AI Provider Settings')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Configure API keys for different AI providers to enable seamless switching.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Select Provider:')).toBeInTheDocument();
  });

  it('displays provider selector with all available providers', () => {
    render(<AiProviderSettings />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check that all providers are available in the dropdown
    expect(screen.getByRole('option', { name: 'Google Gemini' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'OpenAI GPT' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Anthropic Claude' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cohere' })).toBeInTheDocument();
  });

  it('shows selected provider information and models', () => {
    render(<AiProviderSettings />);

    // Default selected provider should be Google - check the header in provider info section
    const providerHeading = screen.getByRole('heading', { name: 'Google Gemini' });
    expect(providerHeading).toBeInTheDocument();
    expect(
      screen.getByText(
        "Google's Gemini models with excellent performance and multimodal capabilities."
      )
    ).toBeInTheDocument();

    // Check that models are displayed
    expect(screen.getByText('gemini-2.0-flash')).toBeInTheDocument();
    expect(screen.getByText('gemini-1.5-pro')).toBeInTheDocument();
  });

  it('switches provider information when selection changes', () => {
    render(<AiProviderSettings />);

    const select = screen.getByRole('combobox');

    // Switch to OpenAI
    fireEvent.change(select, { target: { value: 'openai' } });

    // Check that OpenAI provider info is displayed (look for the h4 heading specifically)
    const openaiHeading = screen.getByRole('heading', { level: 4, name: 'OpenAI GPT' });
    expect(openaiHeading).toBeInTheDocument();

    expect(
      screen.getByText("OpenAI's GPT models with industry-leading reasoning and code generation.")
    ).toBeInTheDocument();

    // Check OpenAI models
    expect(screen.getByText('gpt-4o-mini')).toBeInTheDocument();
    expect(screen.getByText('gpt-4o')).toBeInTheDocument();
  });

  it('displays API key input for selected provider', () => {
    render(<AiProviderSettings />);

    const input = screen.getByDisplayValue('test-google-key');
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('updates API key when input changes', () => {
    render(<AiProviderSettings />);

    const input = screen.getByDisplayValue('test-google-key');

    fireEvent.change(input, { target: { value: 'new-api-key' } });

    expect(mockUpdateApiKey).toHaveBeenCalledWith('GOOGLE_API_KEY', 'new-api-key');
  });

  it('shows security notice for API key storage', () => {
    render(<AiProviderSettings />);

    expect(
      screen.getByText(
        'Your API key is stored locally in your browser and never sent to our servers.'
      )
    ).toBeTruthy();
  });

  it('displays test connection button', () => {
    render(<AiProviderSettings />);

    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    expect(testButton).toBeInTheDocument();
    expect(testButton).not.toBeDisabled();
  });

  it('disables test button when no API key is present', () => {
    // Mock empty API keys
    mockUseLocalStorageSync.mockReturnValueOnce([
      { ...mockApiKeys, GOOGLE_API_KEY: '' },
      mockUpdateApiKey,
    ]);

    render(<AiProviderSettings />);

    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    expect(testButton).toBeDisabled();
  });

  it('shows testing state when connection test is in progress', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AiProviderSettings />);

    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    fireEvent.click(testButton);

    expect(screen.getByRole('button', { name: 'Testing...' })).toBeInTheDocument();
    expect(testButton).toBeDisabled();
  });

  it('handles successful connection test', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    render(<AiProviderSettings />);

    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('✅ Connected')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/ai-sdk/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'ping' }],
        options: { provider: 'google' },
        apiKey: 'test-google-key',
      }),
    });
  });

  it('handles failed connection test', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    render(<AiProviderSettings />);

    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Failed')).toBeInTheDocument();
    });
  });

  it('handles connection test error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<AiProviderSettings />);

    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Failed')).toBeInTheDocument();
    });
  });

  it('displays provider status grid', () => {
    render(<AiProviderSettings />);

    expect(screen.getByText('Provider Status')).toBeInTheDocument();

    // Check configured providers - there should be at least one
    const configuredElements = screen.getAllByText('✅ Configured');
    expect(configuredElements.length).toBeGreaterThan(0);

    // Check providers needing API keys - there should be at least one
    const missingElements = screen.getAllByText('⚠️ API Key Needed');
    expect(missingElements.length).toBeGreaterThan(0);
  });

  it('shows correct status for each provider', () => {
    render(<AiProviderSettings />);

    // Google should be configured
    const googleStatus = screen.getAllByText('✅ Configured')[0];
    expect(googleStatus).toBeInTheDocument();

    // Anthropic should be configured
    const anthropicStatus = screen.getAllByText('✅ Configured')[1];
    expect(anthropicStatus).toBeInTheDocument();

    // OpenAI and Cohere should need API keys
    const missingStatuses = screen.getAllByText('⚠️ API Key Needed');
    expect(missingStatuses).toHaveLength(2);
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<AiProviderSettings onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<AiProviderSettings className="custom-class" />);

    const settingsDiv = container.querySelector('.ai-provider-settings');
    expect(settingsDiv).toHaveClass('ai-provider-settings', 'custom-class');
  });

  it('handles switching between providers and maintaining API keys', () => {
    render(<AiProviderSettings />);

    const select = screen.getByRole('combobox');

    // Switch to Anthropic
    fireEvent.change(select, { target: { value: 'anthropic' } });

    const anthropicInput = screen.getByDisplayValue('test-anthropic-key');
    expect(anthropicInput).toBeTruthy();

    // Switch back to Google
    fireEvent.change(select, { target: { value: 'google' } });

    const googleInput = screen.getByDisplayValue('test-google-key');
    expect(googleInput).toBeTruthy();
  });

  it('maintains test results when switching providers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    render(<AiProviderSettings />);

    // Test Google connection
    const testButton = screen.getByRole('button', { name: 'Test Connection' });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('✅ Connected')).toBeInTheDocument();
    });

    // Switch to another provider
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'openai' } });

    // Switch back to Google
    fireEvent.change(select, { target: { value: 'google' } });

    // Test result should still be visible
    expect(screen.getByText('✅ Connected')).toBeInTheDocument();
  });
});

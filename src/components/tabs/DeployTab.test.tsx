/**
 * DeployTab Component Tests
 * Tests the DeployTab component functionality including section navigation and RepositoryCreator integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { DeployTab } from './DeployTab';
import { useSiteStore } from '../../store/siteStore';

// Mock the site store
vi.mock('../../store/siteStore', () => ({
  useSiteStore: vi.fn(),
}));

// Mock RepositoryCreator component
vi.mock('../deployment/RepositoryCreator', () => ({
  default: ({
    content,
    onDeploymentComplete,
  }: {
    content: string;
    onDeploymentComplete?: (url: string) => void;
  }) => (
    <div data-testid="repository-creator">
      <p>Repository Creator Mock</p>
      <p>Content: {content}</p>
      <button
        onClick={() => onDeploymentComplete?.('https://example.com')}
        data-testid="mock-deploy-button"
      >
        Mock Deploy
      </button>
    </div>
  ),
}));

describe('DeployTab', () => {
  const mockContent = '# Test Content\nThis is test content for deployment.';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSiteStore).mockReturnValue({
      content: mockContent,
      messages: [],
      past: [],
      future: [],
      wizardStep: 1,
      projectName: 'Test Project',
      onboardingCompleted: false,
      setContent: vi.fn(),
      setMessages: vi.fn(),
      clearMessages: vi.fn(),
      appendMessage: vi.fn(),
      replaceLastAssistantMessage: vi.fn(),
      upsertStreamingAssistant: vi.fn(),
      commit: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      clear: vi.fn(),
      setWizardStep: vi.fn(),
      setProjectName: vi.fn(),
      setOnboardingCompleted: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the DeployTab component with default repository section', () => {
    render(<DeployTab />);

    expect(screen.getByText('Deploy Your Website')).toBeInTheDocument();
    expect(
      screen.getByText('Publish your AI-generated website to GitHub Pages')
    ).toBeInTheDocument();
    expect(screen.getByText('Repository Setup')).toBeInTheDocument();
    expect(screen.getByText('Deploy Website')).toBeInTheDocument();
    expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
  });

  it('displays repository section by default', () => {
    render(<DeployTab />);

    expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Set up your GitHub repository details/)).toBeInTheDocument();
    expect(screen.getByText('Repository URL:')).toBeInTheDocument();
    expect(screen.getByText('Website URL:')).toBeInTheDocument();
  });

  it('switches to deployment section when clicked', async () => {
    render(<DeployTab />);

    const deployButton = screen.getByText('Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByTestId('repository-creator')).toBeInTheDocument();
      expect(screen.getByText('Repository Creator Mock')).toBeInTheDocument();
      expect(screen.getByText(/Content:/)).toBeInTheDocument();
    });
  });

  it('highlights active section button', () => {
    render(<DeployTab />);

    const repositoryButton = screen.getByText('Repository Setup').closest('button');
    expect(repositoryButton).toHaveClass('active');

    const deployButton = screen.getByText('Deploy Website');
    fireEvent.click(deployButton);

    expect(repositoryButton).not.toHaveClass('active');
    const deployButtonElement = screen.getByText('Deploy Website').closest('button');
    expect(deployButtonElement).toHaveClass('active');
  });

  it('passes content from store to RepositoryCreator', async () => {
    render(<DeployTab />);

    const deployButton = screen.getByText('Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByText(/Content:/)).toBeInTheDocument();
    });
  });

  it('handles deployment completion callback', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<DeployTab />);

    const deployButton = screen.getByText('Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByTestId('mock-deploy-button')).toBeInTheDocument();
    });

    const mockDeployButton = screen.getByTestId('mock-deploy-button');
    fireEvent.click(mockDeployButton);

    expect(consoleSpy).toHaveBeenCalledWith('Deployment completed:', 'https://example.com');

    consoleSpy.mockRestore();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-deploy-class';
    render(<DeployTab className={customClass} />);

    const deployTab = screen.getByText('Deploy Your Website').closest('.deploy-tab');
    expect(deployTab).toHaveClass('deploy-tab', customClass);
  });

  it('displays section icons correctly', () => {
    render(<DeployTab />);

    // Check for folder icon in repository section
    const repositoryButton = screen.getByText('Repository Setup').closest('button');
    expect(repositoryButton).toHaveTextContent('📁');

    // Check for rocket icon in deployment section
    const deployButton = screen.getByText('Deploy Website').closest('button');
    expect(deployButton).toHaveTextContent('🚀');
  });

  it('displays section descriptions correctly', () => {
    render(<DeployTab />);

    expect(screen.getByText('Configure your GitHub repository settings')).toBeInTheDocument();
    expect(screen.getByText('Deploy your website to GitHub Pages')).toBeInTheDocument();
  });

  it('maintains section state when switching between sections', () => {
    render(<DeployTab />);

    // Start with repository section
    expect(screen.getByText('Repository Configuration')).toBeInTheDocument();

    // Switch to deployment section
    const deployButton = screen.getByText('Deploy Website');
    fireEvent.click(deployButton);

    // Switch back to repository section
    const repositoryButton = screen.getByText('Repository Setup');
    fireEvent.click(repositoryButton);

    // Should still show repository section
    expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
  });
});

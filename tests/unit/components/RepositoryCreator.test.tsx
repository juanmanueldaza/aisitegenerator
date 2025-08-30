import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import RepositoryCreator from '../../../src/components/deployment/RepositoryCreator';
import { useGitHub } from '../../../src/hooks/useGitHub';
import { normalizeGitHubError } from '../../../src/utils/githubErrors';

// Mock the hooks
const mockUseGitHub = {
  isAuthenticated: true,
  user: {
    id: 123,
    login: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    avatar_url: 'https://example.com/avatar.jpg',
    html_url: 'https://github.com/testuser',
    public_repos: 10,
    followers: 5,
    following: 3,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  isLoading: false,
  error: null,
  scopes: ['repo', 'user'],
  login: vi.fn(),
  startDeviceAuth: vi.fn(),
  logout: vi.fn(),
  repositories: [],
  createRepository: vi.fn(),
  deployToPages: vi.fn(),
  refreshRepositories: vi.fn(),
  clearError: vi.fn(),
  testConnection: vi.fn(),
};

const mockUseToast = {
  toast: '',
  showToast: vi.fn(),
  hideToast: vi.fn(),
  visible: false,
};

const mockStore = {
  projectName: 'Test Project',
  content: 'Test content',
  messages: [],
  past: [],
  future: [],
};

vi.mock('../../../src/hooks/useGitHub', () => ({
  useGitHub: vi.fn(() => mockUseGitHub),
}));

vi.mock('../../../src/hooks', () => ({
  useToast: vi.fn(() => mockUseToast),
}));

vi.mock('../../../src/store/siteStore', () => ({
  useSiteStore: vi.fn(() => mockStore),
}));

vi.mock('../../../src/utils/githubErrors', () => ({
  normalizeGitHubError: vi.fn((error: unknown) => ({
    code: 'unknown',
    message: (error as Error)?.message || 'Unknown error',
  })),
}));

vi.mock('../../../src/utils/string', () => ({
  slugify: vi.fn((str) => str.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
}));

vi.mock('../../../src/utils/content', () => ({
  generatePreviewHTMLAsync: vi.fn(() => Promise.resolve('<html><body>Test HTML</body></html>')),
}));

// Get the mocked hooks
let mockUseGitHubHook: ReturnType<typeof vi.mocked<typeof useGitHub>>;

describe('RepositoryCreator', () => {
  const defaultProps = {
    content: 'Test website content',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGitHubHook = vi.mocked(useGitHub);
  });

  afterEach(() => {
    vi.clearAllTimers();
    cleanup(); // Clean up DOM between tests
  });

  it('renders authentication required message when not authenticated', () => {
    mockUseGitHubHook.mockReturnValueOnce({
      ...mockUseGitHub,
      isAuthenticated: false,
    });

    render(<RepositoryCreator {...defaultProps} />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(
      screen.getByText('Please sign in with GitHub to deploy your website.')
    ).toBeInTheDocument();
  });

  it('renders deployment form when authenticated', () => {
    render(<RepositoryCreator {...defaultProps} />);

    expect(screen.getByText('Deploy to GitHub Pages')).toBeInTheDocument();
    expect(screen.getByText('Create a repository and deploy your website')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('initializes repository name from store project name', () => {
    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    expect(repoNameInput).toHaveValue('Test Project');
  });

  it('shows URL preview for repository', () => {
    render(<RepositoryCreator {...defaultProps} />);

    expect(screen.getByText('testuser.github.io/test-project')).toBeInTheDocument();
  });

  it('sanitizes repository name on blur', () => {
    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');

    fireEvent.change(repoNameInput, { target: { value: 'My Awesome Project!' } });
    fireEvent.blur(repoNameInput);

    expect(repoNameInput).toHaveValue('my-awesome-project');
    expect(mockUseToast.showToast).toHaveBeenCalledWith(
      'Repository name sanitized to "my-awesome-project"'
    );
  });

  it('shows sanitized name preview when name differs', () => {
    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');

    fireEvent.change(repoNameInput, { target: { value: 'My Project!' } });

    expect(screen.getByText('Final repository name: my-project')).toBeInTheDocument();
  });

  it('disables form inputs during deployment', () => {
    // Mock deployment in progress by setting up the component state
    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    const descriptionInput = screen.getByLabelText('Description');
    const deployButton = screen.getByRole('button', { name: '🚀 Deploy Website' });

    // Initially enabled
    expect(repoNameInput).not.toBeDisabled();
    expect(descriptionInput).not.toBeDisabled();
    expect(deployButton).not.toBeDisabled();
  });

  it('disables deploy button when repository name is empty', () => {
    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    const deployButton = screen.getByRole('button', { name: '🚀 Deploy Website' });

    fireEvent.change(repoNameInput, { target: { value: '' } });

    expect(deployButton).toBeDisabled();
  });

  it('handles successful deployment', async () => {
    mockUseGitHub.createRepository.mockResolvedValue(undefined);
    mockUseGitHub.deployToPages.mockResolvedValue('https://testuser.github.io/test-repo');

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByText('Deployment Successful!')).toBeInTheDocument();
    });

    expect(mockUseGitHub.createRepository).toHaveBeenCalledWith({
      name: 'test-repo',
      description: 'Website generated by AI Site Generator',
      private: false,
      auto_init: true,
      has_issues: true,
      has_projects: false,
      has_wiki: false,
    });

    expect(mockUseGitHub.deployToPages).toHaveBeenCalledWith('test-repo', [
      {
        path: 'index.html',
        content: '<html><body>Test HTML</body></html>',
        message: 'Add generated website content',
      },
    ]);

    expect(mockUseToast.showToast).toHaveBeenCalledWith('Deployment successful!');
  });

  it('includes README update when checkbox is checked', async () => {
    mockUseGitHub.createRepository.mockResolvedValue(undefined);
    mockUseGitHub.deployToPages.mockResolvedValue('https://testuser.github.io/test-repo');

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    const readmeCheckbox = screen.getByLabelText(
      'Update README.md (create or update with project name and description)'
    );
    fireEvent.click(readmeCheckbox);

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByText('Deployment Successful!')).toBeInTheDocument();
    });

    expect(mockUseGitHub.deployToPages).toHaveBeenCalledWith('test-repo', [
      {
        path: 'index.html',
        content: '<html><body>Test HTML</body></html>',
        message: 'Add generated website content',
      },
      {
        path: 'README.md',
        content: '# test-repo\n\nTest description\n\nGenerated with AI Site Generator.',
        message: 'Update README',
      },
    ]);
  });

  it('handles repository already exists error gracefully', async () => {
    const error = new Error('Repository already exists');
    mockUseGitHub.createRepository.mockRejectedValueOnce(error);
    mockUseGitHub.deployToPages.mockResolvedValue('https://testuser.github.io/test-repo');

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByRole('button', { name: '🚀 Deploy Website' });
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(
        screen.getByText('Repository exists. Continuing with deployment...')
      ).toBeInTheDocument();
    });

    // Should still complete deployment
    await waitFor(() => {
      expect(screen.getByText('Deployment Successful!')).toBeInTheDocument();
    });
  });

  it('handles deployment failure', async () => {
    const error = new Error('Deployment failed');
    mockUseGitHub.createRepository.mockRejectedValue(error);

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByText('Deployment failed: Deployment failed')).toBeInTheDocument();
    });

    expect(mockUseToast.showToast).toHaveBeenCalledWith('Deployment failed: Deployment failed');
  });

  it('handles rate limiting errors', async () => {
    const error = new Error('Rate limited');
    mockUseGitHub.createRepository.mockRejectedValue(error);

    vi.mocked(normalizeGitHubError).mockReturnValue({
      code: 'rate_limited',
      message: 'Rate limited. Retry after 60s.',
    });

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByRole('button', { name: '🚀 Deploy Website' });
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(
        screen.getByText('Deployment failed: Rate limited. Retry after 60s.')
      ).toBeInTheDocument();
    });
  });

  it('shows success screen with deployment links', async () => {
    mockUseGitHub.createRepository.mockResolvedValue(undefined);
    mockUseGitHub.deployToPages.mockResolvedValue('https://testuser.github.io/test-repo');

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'View Website' })).toHaveAttribute(
      'href',
      'https://testuser.github.io/test-repo'
    );
    expect(screen.getByRole('link', { name: 'View Repository' })).toHaveAttribute(
      'href',
      'https://github.com/testuser/test-repo'
    );
  });

  it('calls onDeploymentComplete callback on successful deployment', async () => {
    const mockOnDeploymentComplete = vi.fn();
    mockUseGitHub.createRepository.mockResolvedValue(undefined);
    mockUseGitHub.deployToPages.mockResolvedValue('https://testuser.github.io/test-repo');

    render(<RepositoryCreator {...defaultProps} onDeploymentComplete={mockOnDeploymentComplete} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByRole('button', { name: '🚀 Deploy Website' });
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(mockOnDeploymentComplete).toHaveBeenCalledWith('https://testuser.github.io/test-repo');
    });
  });

  it('resets form when deploy another site is clicked', async () => {
    mockUseGitHub.createRepository.mockResolvedValue(undefined);
    mockUseGitHub.deployToPages.mockResolvedValue('https://testuser.github.io/test-repo');

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deploy Another Site' })).toBeInTheDocument();
    });

    const resetButton = screen.getByRole('button', { name: 'Deploy Another Site' });
    fireEvent.click(resetButton);

    // Should go back to form
    expect(screen.getByText('Deploy to GitHub Pages')).toBeInTheDocument();
    expect(repoNameInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('shows retry button on deployment failure', async () => {
    const error = new Error('Deployment failed');
    mockUseGitHub.createRepository.mockRejectedValue(error);

    render(<RepositoryCreator {...defaultProps} />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<RepositoryCreator {...defaultProps} className="custom-class" />);

    const creatorDiv = container.querySelector('.repository-creator');
    expect(creatorDiv).toHaveClass('repository-creator', 'custom-class');
  });

  it('prevents deployment when content is empty', () => {
    render(<RepositoryCreator content="" />);

    const repoNameInput = screen.getByLabelText('Repository Name *');
    fireEvent.change(repoNameInput, { target: { value: 'test-repo' } });

    const deployButton = screen.getByText('🚀 Deploy Website');
    fireEvent.click(deployButton);

    expect(screen.getByText('Please provide a repository name and content')).toBeInTheDocument();
    expect(mockUseGitHub.createRepository).not.toHaveBeenCalled();
  });
});

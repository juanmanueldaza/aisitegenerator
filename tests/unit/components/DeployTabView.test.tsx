import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DeployTabView } from '../../../src/components/tabs/DeployTabView';

// Mock RepositoryCreator component
vi.mock('../../../src/components/deployment/RepositoryCreator', () => ({
  default: ({
    content,
    onDeploymentComplete,
  }: {
    content: string;
    onDeploymentComplete: (url: string) => void;
  }) => (
    <div data-testid="repository-creator">
      <p>Repository Creator Mock</p>
      <p>Content: {content}</p>
      <button onClick={() => onDeploymentComplete('https://example.com')}>
        Complete Deployment
      </button>
    </div>
  ),
}));

describe('DeployTabView Component', () => {
  const defaultProps = {
    activeSection: 'repository' as const,
    content: '<html><body>Test content</body></html>',
    sections: [
      {
        id: 'repository' as const,
        label: 'Repository Setup',
        description: 'Configure your GitHub repository settings',
        icon: '📁',
      },
      {
        id: 'deployment' as const,
        label: 'Deploy Website',
        description: 'Deploy your website to GitHub Pages',
        icon: '🚀',
      },
    ],
    onSectionChange: vi.fn(),
    onDeploymentComplete: vi.fn(),
    className: 'test-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render successfully', () => {
    render(<DeployTabView {...defaultProps} />);

    expect(screen.getByText('Deploy Your Website')).toBeInTheDocument();
    expect(
      screen.getByText('Publish your AI-generated website to GitHub Pages')
    ).toBeInTheDocument();
  });

  it('should render repository section by default', () => {
    render(<DeployTabView {...defaultProps} />);

    expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
    expect(screen.getByText('Repository URL:')).toBeInTheDocument();
    expect(screen.getByText('Website URL:')).toBeInTheDocument();
  });

  it('should render deployment section when active', () => {
    const props = {
      ...defaultProps,
      activeSection: 'deployment' as const,
    };

    render(<DeployTabView {...props} />);

    expect(screen.getByTestId('repository-creator')).toBeInTheDocument();
    expect(screen.getByText('Repository Creator Mock')).toBeInTheDocument();
  });

  it('should display section buttons', () => {
    render(<DeployTabView {...defaultProps} />);

    expect(screen.getByTestId('deploy-section-repository')).toBeInTheDocument();
    expect(screen.getByText('Repository Setup')).toBeInTheDocument();
    expect(screen.getByTestId('deploy-section-deployment')).toBeInTheDocument();
    expect(screen.getByText('Deploy Website')).toBeInTheDocument();
  });

  it('should call onSectionChange when section button is clicked', () => {
    render(<DeployTabView {...defaultProps} />);

    const deployButton = screen.getByTestId('deploy-section-deployment');
    fireEvent.click(deployButton);

    expect(defaultProps.onSectionChange).toHaveBeenCalledWith('deployment');
  });

  it('should apply custom className', () => {
    const { container } = render(<DeployTabView {...defaultProps} className="test-class" />);

    const deployTab = container.querySelector('.deploy-tab');
    expect(deployTab).toHaveClass('test-class');
  });

  it('should show active section styling', () => {
    render(<DeployTabView {...defaultProps} />);

    // The repository section should be active by default
    const repositoryButton = screen.getAllByText('Repository Setup')[0].closest('button');
    expect(repositoryButton).toHaveClass('active');

    const deployButton = screen.getAllByText('Deploy Website')[0].closest('button');
    expect(deployButton).not.toHaveClass('active');
  });

  it('should handle deployment completion', () => {
    const props = {
      ...defaultProps,
      activeSection: 'deployment' as const,
    };

    render(<DeployTabView {...props} />);

    const completeButton = screen.getAllByText('Complete Deployment')[0];
    fireEvent.click(completeButton);

    expect(defaultProps.onDeploymentComplete).toHaveBeenCalledWith('https://example.com');
  });
});

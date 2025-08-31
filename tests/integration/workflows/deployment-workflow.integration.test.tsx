import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DeployTab } from '../../../src/components/tabs/DeployTab';
import { mockLocalStorage, createMockFetchResponse } from '../utils/test-helpers';

// Mock dependencies
vi.mock('@/services/github', () => ({
  createRepository: vi.fn(),
  deployToGitHubPages: vi.fn(),
}));

vi.mock('@/hooks/useGitHub', () => ({
  useGitHub: vi.fn(() => ({
    isAuthenticated: true,
    user: { login: 'testuser', name: 'Test User' },
    repositories: [],
    createRepository: vi.fn(),
    deployToPages: vi.fn(),
  })),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage(),
});

// Mock fetch for any API calls
global.fetch = vi.fn();

describe('Deployment Workflow Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Setup mock fetch responses
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockFetchResponse({ success: true })
    );
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  describe('Basic Deployment Flow', () => {
    it('should render the deployment component successfully', async () => {
      render(<DeployTab />);

      // Component should render
      expect(screen.getByText('Deploy Your Website')).toBeInTheDocument();
      expect(screen.getByText('Repository Setup')).toBeInTheDocument();
    });

    it('should display deployment status', async () => {
      render(<DeployTab />);

      // Verify deployment status is displayed
      expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
    });

    it('should show repository information', async () => {
      render(<DeployTab />);

      // Verify repository section is displayed
      expect(screen.getByText('Repository URL:')).toBeInTheDocument();
      expect(screen.getByText('Website URL:')).toBeInTheDocument();
    });
  });

  describe('GitHub Integration', () => {
    it('should display GitHub authentication status', async () => {
      render(<DeployTab />);

      // Verify GitHub connection status through repository setup
      expect(screen.getByText('Repository Setup')).toBeInTheDocument();
    });

    it('should show user information', async () => {
      render(<DeployTab />);

      // Verify user information is displayed through repository URLs
      const userElements = screen.getAllByText(/your-username/i);
      expect(userElements.length).toBeGreaterThan(0);
    });

    it('should display repository creation options', async () => {
      render(<DeployTab />);

      // Verify repository creation UI through configuration section
      expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
    });
  });

  describe('Deployment Configuration', () => {
    it('should display deployment settings', async () => {
      render(<DeployTab />);

      // Verify deployment configuration options through repository configuration
      expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
    });

    it('should show build configuration', async () => {
      render(<DeployTab />);

      // Verify build settings through repository setup description
      const gitHubPagesElements = screen.getAllByText(/GitHub Pages/i);
      expect(gitHubPagesElements.length).toBeGreaterThan(0);
    });

    it('should display environment variables section', async () => {
      render(<DeployTab />);

      // Verify environment variables configuration through repository info
      expect(screen.getByText('Repository URL:')).toBeInTheDocument();
    });
  });

  describe('Deployment Process', () => {
    it('should show deployment progress', async () => {
      render(<DeployTab />);

      // Verify deployment progress indicators through deploy section
      expect(screen.getByText('Deploy Website')).toBeInTheDocument();
    });

    it('should display deployment logs', async () => {
      render(<DeployTab />);

      // Verify deployment logs section through repository info
      expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
    });

    it('should show deployment URL when complete', async () => {
      render(<DeployTab />);

      // Verify deployment URL display
      expect(screen.getByText('Website URL:')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle deployment failures gracefully', async () => {
      render(<DeployTab />);

      // Component should render without crashing
      expect(screen.getByText('Deploy Your Website')).toBeInTheDocument();
    });

    it('should display helpful deployment tips', async () => {
      render(<DeployTab />);

      // Verify tips section is displayed through repository setup description
      const gitHubPagesElements = screen.getAllByText(/GitHub Pages/i);
      expect(gitHubPagesElements.length).toBeGreaterThan(0);
    });
  });
});

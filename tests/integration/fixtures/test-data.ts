/**
 * Test Fixtures for Integration Tests
 * Provides mock data and test scenarios for integration testing
 */

import { expect } from 'vitest';
import type { AIMessage, ProviderOptions } from '../../../src/types/ai';
import type { GitHubRepository } from '../../../src/types/github';

/**
 * Simple site configuration for testing
 */
export interface SiteConfiguration {
  id: string;
  name: string;
  description: string;
  template: string;
  content: {
    title: string;
    description: string;
    sections: Array<{
      type: string;
      content: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock AI messages for testing
 */
export const mockAIMessages = {
  simplePrompt: [
    {
      role: 'user' as const,
      content: 'Create a simple HTML page with a heading and paragraph',
    },
  ] as AIMessage[],

  complexPrompt: [
    {
      role: 'system' as const,
      content: 'You are a professional web developer creating modern, responsive websites.',
    },
    {
      role: 'user' as const,
      content: 'Create a portfolio website with navigation, hero section, and contact form',
    },
  ] as AIMessage[],

  chatConversation: [
    {
      role: 'user' as const,
      content: 'Hello, I need help creating a website',
    },
    {
      role: 'assistant' as const,
      content:
        "I'd be happy to help you create a website! What type of website are you looking for?",
    },
    {
      role: 'user' as const,
      content: 'A simple business website with contact information',
    },
  ] as AIMessage[],
};

/**
 * Mock provider options for testing
 */
export const mockProviderOptions: Record<string, ProviderOptions> = {
  default: {
    temperature: 0.7,
    systemInstruction: 'You are a helpful web development assistant.',
  },

  creative: {
    temperature: 0.9,
    systemInstruction: 'You are a creative web designer focused on modern, beautiful designs.',
  },

  conservative: {
    temperature: 0.3,
    systemInstruction: 'You are a professional web developer following best practices.',
  },
};

/**
 * Mock site configurations for testing
 */
export const mockSiteConfigurations: Record<string, SiteConfiguration> = {
  basic: {
    id: 'test-site-1',
    name: 'Test Business Site',
    description: 'A simple business website',
    template: 'basic',
    content: {
      title: 'My Business',
      description: 'Welcome to our business website',
      sections: [
        {
          type: 'hero',
          content: 'Welcome to Our Company',
        },
        {
          type: 'about',
          content: 'We provide excellent services',
        },
      ],
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  portfolio: {
    id: 'test-site-2',
    name: 'Portfolio Site',
    description: 'A creative portfolio website',
    template: 'portfolio',
    content: {
      title: 'John Doe - Portfolio',
      description: 'Creative designer and developer',
      sections: [
        {
          type: 'hero',
          content: "Hello, I'm John Doe",
        },
        {
          type: 'projects',
          content: 'My latest work',
        },
        {
          type: 'contact',
          content: 'Get in touch',
        },
      ],
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
};

/**
 * Mock GitHub repositories for testing
 */
export const mockGitHubRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'test-repo-1',
    full_name: 'testuser/test-repo-1',
    description: 'Test repository 1',
    private: false,
    html_url: 'https://github.com/testuser/test-repo-1',
    clone_url: 'https://github.com/testuser/test-repo-1.git',
    ssh_url: 'git@github.com:testuser/test-repo-1.git',
    homepage: null,
    size: 100,
    stargazers_count: 5,
    watchers_count: 5,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    has_pages: false,
    has_downloads: true,
    archived: false,
    disabled: false,
    open_issues_count: 2,
    license: null,
    forks: 1,
    open_issues: 2,
    watchers: 5,
    default_branch: 'main',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    pushed_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'test-repo-2',
    full_name: 'testuser/test-repo-2',
    description: 'Test repository 2',
    private: true,
    html_url: 'https://github.com/testuser/test-repo-2',
    clone_url: 'https://github.com/testuser/test-repo-2.git',
    ssh_url: 'git@github.com:testuser/test-repo-2.git',
    homepage: 'https://testuser.github.io/test-repo-2',
    size: 200,
    stargazers_count: 10,
    watchers_count: 10,
    language: 'JavaScript',
    has_issues: true,
    has_projects: false,
    has_wiki: false,
    has_pages: true,
    has_downloads: true,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
      node_id: 'MDc6TGljZW5zZTEz',
    },
    forks: 3,
    open_issues: 0,
    watchers: 10,
    default_branch: 'main',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
    pushed_at: '2025-01-02T00:00:00Z',
  },
];

/**
 * Mock API responses for testing
 */
export const mockApiResponses = {
  success: {
    success: true,
    data: 'Mock response data',
    timestamp: new Date(),
  },

  error: {
    success: false,
    error: 'Mock error message',
    timestamp: new Date(),
  },

  aiGeneration: {
    text: '<!DOCTYPE html>\n<html>\n<head>\n<title>Test Page</title>\n</head>\n<body>\n<h1>Hello World</h1>\n<p>This is a test page.</p>\n</body>\n</html>',
    usage: {
      promptTokens: 10,
      completionTokens: 50,
      totalTokens: 60,
    },
    finishReason: 'stop' as const,
  },
};

/**
 * Test scenarios for different workflows
 */
export const testScenarios = {
  chatWorkflow: {
    name: 'Chat Workflow',
    description: 'Test the complete chat interaction flow',
    steps: [
      'Initialize chat session',
      'Send user message',
      'Receive AI response',
      'Continue conversation',
      'Handle errors gracefully',
    ],
  },

  editorWorkflow: {
    name: 'Editor Workflow',
    description: 'Test the content editing and preview flow',
    steps: [
      'Load initial content',
      'Edit content in editor',
      'Preview changes',
      'Save modifications',
      'Handle validation errors',
    ],
  },

  deploymentWorkflow: {
    name: 'Deployment Workflow',
    description: 'Test the GitHub deployment process',
    steps: [
      'Authenticate with GitHub',
      'Create repository',
      'Generate website content',
      'Deploy to GitHub Pages',
      'Verify deployment',
    ],
  },
};

/**
 * Helper function to create mock delays for testing async operations
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper function to create mock error scenarios
 */
export const createMockError = (message: string, code?: string) => ({
  message,
  code,
  timestamp: new Date(),
});

/**
 * Helper function to validate common response structures
 */
export const validateResponse = (response: unknown) => {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');

  if (response && typeof response === 'object' && 'success' in response) {
    const result = response as { success: boolean; timestamp?: Date };
    expect(typeof result.success).toBe('boolean');
    if (result.timestamp) {
      expect(result.timestamp).toBeInstanceOf(Date);
    }
  }
};

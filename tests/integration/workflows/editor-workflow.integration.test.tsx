import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { EditorTab } from '../../../src/components/tabs/EditorTab';
import { useSiteStore } from '../../../src/store/siteStore';
import { mockLocalStorage, createMockFetchResponse } from '../utils/test-helpers';

// Mock editor content
const mockEditorContent = `# Test Heading

This is a test markdown content with:
- Lists
- **Bold text**
- *Italic text*
- \`Code snippets\`

\`\`\`javascript
console.log("Hello World");
\`\`\`
`;

// Mock dependencies
vi.mock('@/services/ai', () => ({
  generateContent: vi.fn(),
}));

vi.mock('@/hooks/useEditorContent', () => ({
  useEditorContent: vi.fn(() => ({
    localContent: useSiteStore.getState().content || mockEditorContent,
    setContent: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock('@/hooks/useEditorState', () => ({
  useEditorState: vi.fn(() => ({
    localContent: mockEditorContent,
    isDirty: false,
    handleContentChange: vi.fn(),
    handleSave: vi.fn(),
    handleBlur: vi.fn(),
    syntaxHighlighting: true,
    detectedLanguage: 'markdown',
    highlightCode: vi.fn((code) => code),
    handleKeyDown: vi.fn(),
    viewMode: 'browser' as const,
    setViewMode: vi.fn(),
    cycleViewMode: vi.fn(),
    getViewModeLabel: vi.fn((mode) => mode),
    getViewModeIcon: vi.fn((mode) => mode),
    getViewModeDimensions: vi.fn(() => ({ width: 1200, height: 800 })),
    linesCount: 10,
    contentLength: mockEditorContent.length,
    canUndo: false,
    canRedo: false,
  })),
}));

vi.mock('@/hooks/useSyntaxHighlighting', () => ({
  useSyntaxHighlighting: vi.fn(() => ({
    highlightedContent: mockEditorContent,
  })),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage(),
});

// Mock fetch for any API calls
global.fetch = vi.fn();

describe('Editor Workflow Integration', () => {
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

  describe('Basic Editor Flow', () => {
    it('should render the editor component successfully', async () => {
      render(<EditorTab />);

      // Component should render
      expect(screen.getByText('📝 Code Editor')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should display content from store', async () => {
      render(<EditorTab />);

      // Verify content is displayed
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveValue(mockEditorContent);
    });

    it('should render the editor component successfully', async () => {
      render(<EditorTab />);

      // Component should render
      expect(screen.getByText('📝 Code Editor')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Preview Mode', () => {
    it('should display view mode buttons', async () => {
      render(<EditorTab />);

      // Should display desktop view mode button (simplified implementation)
      expect(screen.getByRole('button', { name: /desktop/i })).toBeInTheDocument();
      expect(screen.getByText('Preview:')).toBeInTheDocument();
    });

    it('should render markdown content in preview', async () => {
      render(<EditorTab />);

      // Verify markdown is rendered in iframe
      const previewIframe = screen.getByTitle('Preview');
      expect(previewIframe).toBeInTheDocument();
      expect(previewIframe).toHaveAttribute('srcdoc');
    });
  });

  describe('Content Synchronization', () => {
    it('should integrate with site store', async () => {
      render(<EditorTab />);

      // Verify store integration
      const state = useSiteStore.getState();
      expect(state).toBeDefined();
      expect(typeof state.setContent).toBe('function');
    });

    it('should display editor with content', async () => {
      render(<EditorTab />);

      // Verify editor displays content
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveValue(mockEditorContent);
    });
  });

  describe('Syntax Highlighting', () => {
    it('should show line and character count', async () => {
      render(<EditorTab />);

      // Verify line and character count is displayed (current implementation)
      expect(screen.getByText(/lines,.*chars/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle component rendering without errors', async () => {
      expect(() => render(<EditorTab />)).not.toThrow();
    });

    it('should display helpful tips', async () => {
      render(<EditorTab />);

      // Verify tips section is displayed
      expect(screen.getByText('💡 Tips:')).toBeInTheDocument();
      expect(screen.getByText(/Ctrl\+S/i)).toBeInTheDocument();
    });
  });
});

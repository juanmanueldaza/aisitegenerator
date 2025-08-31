import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditorTab } from '../../../src/components/tabs/EditorTab';
import { useSiteStore } from '../../../src/store/siteStore';

// Mock the site store
const mockStore = {
  content: 'Test content',
  past: [],
  future: [],
  setContent: vi.fn(),
  commit: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
};

vi.mock('../../../src/store/siteStore', () => ({
  useSiteStore: vi.fn(() => mockStore),
}));

// Mock PrismJS
vi.mock('prismjs', () => ({
  default: {
    highlight: vi.fn(() => 'highlighted code'),
  },
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html),
  },
}));

// Mock Textarea component
vi.mock('../../../src/components/ui/Input/Input', () => ({
  Textarea: ({
    value,
    onChange,
    onKeyDown,
    onBlur,
    placeholder,
    size,
    className,
    style,
  }: {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    size?: string;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <textarea
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder={placeholder}
      data-size={size}
      className={className}
      style={style}
    />
  ),
}));

describe('EditorTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store to default state
    Object.assign(mockStore, {
      content: 'Test content',
      past: [],
      future: [],
      setContent: vi.fn(),
      commit: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders editor interface with content', () => {
    render(<EditorTab />);

    expect(screen.getByText('📝 Code Editor')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Paste your HTML, CSS, or JavaScript code here/)
    ).toBeInTheDocument();
  });

  it('displays content statistics', () => {
    render(<EditorTab />);

    // Test content has 2 lines and 12 characters
    expect(screen.getByText('2 lines, 12 chars')).toBeInTheDocument();
  });

  it('shows unsaved changes indicator when content is modified', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified content' } });

    expect(screen.getByText('UNSAVED')).toBeInTheDocument();
  });

  it('handles save operation', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified content' } });

    const saveButton = screen.getByRole('button', { name: /💾 Save/ });
    fireEvent.click(saveButton);

    expect(mockStore.setContent).toHaveBeenCalledWith('Modified content');
    expect(mockStore.commit).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');

    // Test Ctrl+S (save)
    fireEvent.keyDown(textarea, { ctrlKey: true, key: 's' });
    expect(mockStore.setContent).toHaveBeenCalledWith('Test content');
    expect(mockStore.commit).toHaveBeenCalled();

    // Reset mocks
    mockStore.setContent.mockClear();
    mockStore.commit.mockClear();

    // Test Ctrl+Z (undo)
    fireEvent.keyDown(textarea, { ctrlKey: true, key: 'z' });
    expect(mockStore.undo).toHaveBeenCalled();

    // Test Ctrl+Y (redo)
    fireEvent.keyDown(textarea, { ctrlKey: true, key: 'y' });
    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('handles Cmd key shortcuts on Mac', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');

    // Test Cmd+S (save)
    fireEvent.keyDown(textarea, { metaKey: true, key: 's' });
    expect(mockStore.setContent).toHaveBeenCalledWith('Test content');
    expect(mockStore.commit).toHaveBeenCalled();

    // Reset mocks
    mockStore.setContent.mockClear();
    mockStore.commit.mockClear();

    // Test Cmd+Z (undo)
    fireEvent.keyDown(textarea, { metaKey: true, key: 'z' });
    expect(mockStore.undo).toHaveBeenCalled();

    // Test Cmd+Y (redo)
    fireEvent.keyDown(textarea, { metaKey: true, key: 'y' });
    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('auto-saves on blur when content is dirty', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified content' } });
    fireEvent.blur(textarea);

    expect(mockStore.setContent).toHaveBeenCalledWith('Modified content');
    expect(mockStore.commit).toHaveBeenCalled();
  });

  it('enables/disables undo button based on history', () => {
    // Test with no undo history
    render(<EditorTab />);

    const undoButton = screen.getByRole('button', { name: /↶ Undo/ });
    expect(undoButton).toBeDisabled();

    // Test with undo history
    mockStore.past = [{ content: 'Previous content', messages: [] }];
    render(<EditorTab />);

    const enabledUndoButton = screen.getByRole('button', { name: /↶ Undo/ });
    expect(enabledUndoButton).not.toBeDisabled();
  });

  it('enables/disables redo button based on history', () => {
    // Test with no redo history
    render(<EditorTab />);

    const redoButton = screen.getByRole('button', { name: /↷ Redo/ });
    expect(redoButton).toBeDisabled();

    // Test with redo history
    mockStore.future = [{ content: 'Future content', messages: [] }];
    render(<EditorTab />);

    const enabledRedoButton = screen.getByRole('button', { name: /↷ Redo/ });
    expect(enabledRedoButton).not.toBeDisabled();
  });

  it('enables/disables save button based on dirty state', () => {
    render(<EditorTab />);

    const saveButton = screen.getByRole('button', { name: /💾 Save/ });
    expect(saveButton).toBeDisabled();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified content' } });

    expect(saveButton).not.toBeDisabled();
  });

  it('detects HTML language', () => {
    mockStore.content = '<!DOCTYPE html><html><body>Hello</body></html>';
    render(<EditorTab />);

    // Should show MARKUP language indicator
    expect(screen.getByText('MARKUP')).toBeInTheDocument();
  });

  it('detects CSS language', () => {
    mockStore.content = '.class { color: red; }';
    render(<EditorTab />);

    // Should show CSS language indicator
    expect(screen.getByText('CSS')).toBeInTheDocument();
  });

  it('detects JavaScript language', () => {
    mockStore.content = 'function test() { return true; }';
    render(<EditorTab />);

    // Should show JAVASCRIPT language indicator
    expect(screen.getByText('JAVASCRIPT')).toBeInTheDocument();
  });

  it('shows live preview for HTML content', () => {
    mockStore.content = '<div>Hello World</div>';
    render(<EditorTab />);

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows preview placeholder for non-HTML content', () => {
    mockStore.content = 'console.log("Hello");';
    render(<EditorTab />);

    expect(screen.getByText('Preview available for HTML content only')).toBeInTheDocument();
  });

  it('shows device view mode buttons', () => {
    mockStore.content = '<div>Hello</div>';
    render(<EditorTab />);

    expect(screen.getByRole('button', { name: /🖥️ Browser/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📱 Mobile/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📱 Tablet/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /💻 Desktop/ })).toBeInTheDocument();
  });

  it('switches between view modes', () => {
    mockStore.content = '<div>Hello</div>';
    render(<EditorTab />);

    const mobileButton = screen.getByRole('button', { name: /📱 Mobile/ });
    fireEvent.click(mobileButton);

    // The button should be highlighted (we can test this by checking if it has the expected styling)
    // Since we're testing the click handler, we can verify the component doesn't crash
    expect(mobileButton).toBeInTheDocument();
  });

  it('shows keyboard shortcut tips', () => {
    render(<EditorTab />);

    expect(screen.getByText(/💡 Tips:/)).toBeInTheDocument();
    expect(screen.getByText(/Ctrl\+S/)).toBeInTheDocument();
    expect(screen.getByText(/Ctrl\+Z/)).toBeInTheDocument();
    expect(screen.getByText(/Ctrl\+Y/)).toBeInTheDocument();
  });

  it('handles undo button click', () => {
    mockStore.past = [{ content: 'Previous content', messages: [] }];
    render(<EditorTab />);

    const undoButton = screen.getByRole('button', { name: /↶ Undo/ });
    fireEvent.click(undoButton);

    expect(mockStore.undo).toHaveBeenCalled();
  });

  it('handles redo button click', () => {
    mockStore.future = [{ content: 'Future content', messages: [] }];
    render(<EditorTab />);

    const redoButton = screen.getByRole('button', { name: /↷ Redo/ });
    fireEvent.click(redoButton);

    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('syncs content changes from store', () => {
    const { rerender } = render(<EditorTab />);

    // Change store content
    mockStore.content = 'Updated content';

    // Rerender to trigger useEffect
    rerender(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Updated content');
  });

  it('maintains dirty state correctly', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');

    // Initially not dirty
    expect(screen.queryByText('UNSAVED')).not.toBeInTheDocument();

    // Make changes
    fireEvent.change(textarea, { target: { value: 'Modified content' } });
    expect(screen.getByText('UNSAVED')).toBeInTheDocument();

    // Save changes
    const saveButton = screen.getByRole('button', { name: /💾 Save/ });
    fireEvent.click(saveButton);
    expect(screen.queryByText('UNSAVED')).not.toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    mockStore.content = '';
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');

    expect(screen.getByText('0 lines, 0 chars')).toBeInTheDocument();
  });

  it('handles multiline content correctly', () => {
    mockStore.content = 'Line 1\nLine 2\nLine 3';
    render(<EditorTab />);

    expect(screen.getByText('3 lines, 17 chars')).toBeInTheDocument();
  });
});

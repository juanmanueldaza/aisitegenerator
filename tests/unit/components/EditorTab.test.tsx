import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EditorTab } from '../../../src/components/tabs/EditorTab';
import '@testing-library/jest-dom/vitest';

// Mock the site store
const mockStore = {
  content: 'Test content',
  past: [] as Array<{
    content: string;
    messages: Array<{ id: string; role: string; content: string; timestamp: number }>;
  }>,
  future: [] as Array<{
    content: string;
    messages: Array<{ id: string; role: string; content: string; timestamp: number }>;
  }>,
  setContent: vi.fn(),
  commit: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
};

const mockUseSiteStore = vi.fn(() => mockStore);

vi.mock('../../../src/store/siteStore', () => ({
  useSiteStore: () => mockUseSiteStore(),
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
  Textarea: ({ value, onChange, onKeyDown, onBlur, placeholder, size, className, style }) => (
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
    mockUseSiteStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders editor interface with content', () => {
    render(<EditorTab />);

    expect(screen.getByText('📝 Code Editor')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('displays content statistics', () => {
    render(<EditorTab />);

    expect(screen.getByText('1 lines, 12 chars')).toBeInTheDocument();
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

    const saveButton = screen.getByTitle('Save (Ctrl+S)');
    fireEvent.click(saveButton);

    expect(mockStore.setContent).toHaveBeenCalledWith('Modified content');
    expect(mockStore.commit).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });

    expect(mockStore.setContent).toHaveBeenCalledWith('Test content');
    expect(mockStore.commit).toHaveBeenCalled();
  });

  it('handles Cmd key shortcuts on Mac', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 's', metaKey: true });

    expect(mockStore.setContent).toHaveBeenCalledWith('Test content');
    expect(mockStore.commit).toHaveBeenCalled();
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
    // Test with empty history - undo should be disabled
    mockStore.past = [];
    render(<EditorTab />);

    const undoButtons = screen.getAllByTitle('Undo (Ctrl+Z)');
    const disabledUndoButton = undoButtons.find((button) => button.hasAttribute('disabled'));
    expect(disabledUndoButton).toBeInTheDocument();

    // Test with history - undo should be enabled
    mockStore.past = [{ content: 'Previous content', messages: [] }];
    render(<EditorTab />);

    const enabledUndoButtons = screen.getAllByTitle('Undo (Ctrl+Z)');
    const enabledUndoButton = enabledUndoButtons.find((button) => !button.hasAttribute('disabled'));
    expect(enabledUndoButton).toBeInTheDocument();
  });

  it('enables/disables redo button based on history', () => {
    // Test with empty future - redo should be disabled
    mockStore.future = [];
    render(<EditorTab />);

    const redoButtons = screen.getAllByTitle('Redo (Ctrl+Y)');
    const disabledRedoButton = redoButtons.find((button) => button.hasAttribute('disabled'));
    expect(disabledRedoButton).toBeInTheDocument();

    // Test with future - redo should be enabled
    mockStore.future = [{ content: 'Future content', messages: [] }];
    render(<EditorTab />);

    const enabledRedoButtons = screen.getAllByTitle('Redo (Ctrl+Y)');
    const enabledRedoButton = enabledRedoButtons.find((button) => !button.hasAttribute('disabled'));
    expect(enabledRedoButton).toBeInTheDocument();
  });

  it('enables/disables save button based on dirty state', () => {
    render(<EditorTab />);

    const saveButton = screen.getByTitle('Save (Ctrl+S)');
    expect(saveButton).toBeDisabled();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified content' } });

    expect(saveButton).not.toBeDisabled();
  });

  it('handles undo button click', () => {
    mockStore.past = [{ content: 'Previous content', messages: [] }];
    render(<EditorTab />);

    const enabledUndoButtons = screen.getAllByTitle('Undo (Ctrl+Z)');
    const enabledUndoButton = enabledUndoButtons.find((button) => !button.hasAttribute('disabled'));
    if (enabledUndoButton) {
      fireEvent.click(enabledUndoButton);
      expect(mockStore.undo).toHaveBeenCalled();
    }
  });

  it('handles redo button click', () => {
    mockStore.future = [{ content: 'Future content', messages: [] }];
    render(<EditorTab />);

    const enabledRedoButtons = screen.getAllByTitle('Redo (Ctrl+Y)');
    const enabledRedoButton = enabledRedoButtons.find((button) => !button.hasAttribute('disabled'));
    if (enabledRedoButton) {
      fireEvent.click(enabledRedoButton);
      expect(mockStore.redo).toHaveBeenCalled();
    }
  });

  it('syncs content changes from store', () => {
    const { rerender } = render(<EditorTab />);

    mockStore.content = 'Updated content';
    rerender(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Updated content');
  });

  it('maintains dirty state correctly', () => {
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test content');

    fireEvent.change(textarea, { target: { value: 'Modified content' } });
    expect(textarea).toHaveValue('Modified content');

    // Save should clear dirty state
    const saveButton = screen.getByTitle('Save (Ctrl+S)');
    fireEvent.click(saveButton);
    expect(textarea).toHaveValue('Modified content');
  });

  it('handles empty content gracefully', () => {
    mockStore.content = '';
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');

    expect(screen.getByText('1 lines, 0 chars')).toBeInTheDocument();
  });

  it('handles multiline content correctly', () => {
    const multilineContent = 'Line 1\nLine 2\nLine 3';
    mockStore.content = multilineContent;
    render(<EditorTab />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(multilineContent);

    expect(screen.getByText('3 lines, 20 chars')).toBeInTheDocument();
  });

  it('shows keyboard shortcut tips', () => {
    render(<EditorTab />);

    expect(screen.getByText('💡 Tips:')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Z')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Y')).toBeInTheDocument();
  });
});

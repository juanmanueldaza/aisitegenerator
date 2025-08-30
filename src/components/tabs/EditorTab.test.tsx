import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { EditorTab } from './EditorTab';
import { useSiteStore } from '@/store/siteStore';

// Mock the store
const mockStore = {
  content: 'initial content',
  past: [],
  future: [],
  setContent: vi.fn(),
  commit: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
};

vi.mock('@/store/siteStore', () => ({
  useSiteStore: vi.fn(),
}));

const mockedUseSiteStore = vi.mocked(useSiteStore);

vi.mock('@/components/ui/Input/Input', () => ({
  Textarea: ({
    value,
    onChange,
    onKeyDown,
    onBlur,
    placeholder,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    [key: string]: unknown;
  }) => (
    <textarea
      data-testid="editor-textarea"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

describe('EditorTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSiteStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with initial content from store', () => {
    render(<EditorTab />);

    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('initial content');
  });

  it('displays editor status information', () => {
    render(<EditorTab />);

    expect(screen.getByText('📝 Code Editor')).toBeInTheDocument();
    expect(screen.getByText('1 lines, 15 chars')).toBeInTheDocument();
  });

  it('shows unsaved changes indicator when content is modified', async () => {
    render(<EditorTab />);

    const textarea = screen.getByTestId('editor-textarea');

    fireEvent.change(textarea, { target: { value: 'modified content' } });

    await waitFor(() => {
      expect(screen.getByText('UNSAVED')).toBeInTheDocument();
    });
  });

  it('saves content when save button is clicked', async () => {
    render(<EditorTab />);

    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.change(textarea, { target: { value: 'new content' } });

    const saveButton = screen.getByText('💾 Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockStore.setContent).toHaveBeenCalledWith('new content');
      expect(mockStore.commit).toHaveBeenCalled();
    });
  });

  it('handles keyboard shortcuts', () => {
    render(<EditorTab />);

    const textarea = screen.getByTestId('editor-textarea');

    // Test Ctrl+S (save)
    fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });
    expect(mockStore.setContent).toHaveBeenCalledWith('initial content');
    expect(mockStore.commit).toHaveBeenCalled();

    // Reset mocks
    mockStore.setContent.mockClear();
    mockStore.commit.mockClear();

    // Test Ctrl+Z (undo)
    fireEvent.keyDown(textarea, { key: 'z', ctrlKey: true });
    expect(mockStore.undo).toHaveBeenCalled();

    // Test Ctrl+Y (redo)
    fireEvent.keyDown(textarea, { key: 'y', ctrlKey: true });
    expect(mockStore.redo).toHaveBeenCalled();
  });

  it('auto-saves when textarea loses focus', () => {
    render(<EditorTab />);

    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.change(textarea, { target: { value: 'modified content' } });
    fireEvent.blur(textarea);

    expect(mockStore.setContent).toHaveBeenCalledWith('modified content');
    expect(mockStore.commit).toHaveBeenCalled();
  });

  it('disables undo/redo buttons appropriately', () => {
    // Test with no history
    mockedUseSiteStore.mockReturnValue({
      ...mockStore,
      past: [],
      future: [],
    });

    render(<EditorTab />);

    const undoButtons = screen.getAllByTitle('Undo (Ctrl+Z)');
    const redoButtons = screen.getAllByTitle('Redo (Ctrl+Y)');

    // All undo buttons should be disabled
    undoButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    // All redo buttons should be disabled
    redoButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('enables undo/redo buttons when history exists', () => {
    // Test with history available
    mockedUseSiteStore.mockReturnValue({
      ...mockStore,
      past: [{ content: 'old content', messages: [] }],
      future: [{ content: 'future content', messages: [] }],
    });

    render(<EditorTab />);

    const undoButtons = screen.getAllByTitle('Undo (Ctrl+Z)');
    const redoButtons = screen.getAllByTitle('Redo (Ctrl+Y)');

    // At least one undo button should be enabled
    expect(undoButtons.some((button) => !button.hasAttribute('disabled'))).toBe(true);

    // At least one redo button should be enabled
    expect(redoButtons.some((button) => !button.hasAttribute('disabled'))).toBe(true);
  });

  it('displays helpful tips in the footer', () => {
    render(<EditorTab />);

    expect(screen.getByText('Tips:')).toBeInTheDocument();
    expect(screen.getByText(/save changes/)).toBeInTheDocument();
    expect(screen.getByText(/undo\/redo/)).toBeInTheDocument();
  });
});

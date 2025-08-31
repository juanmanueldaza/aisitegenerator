import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorState } from '../../../src/hooks/useEditorState';

// Mock dependencies at the top level
vi.mock('@/store/siteStore', () => ({
  useSiteStore: vi.fn(),
}));

vi.mock('../../../src/hooks/useEditorContent', () => ({
  useEditorContent: vi.fn(),
}));

vi.mock('../../../src/hooks/useSyntaxHighlighting', () => ({
  useSyntaxHighlighting: vi.fn(),
}));

vi.mock('../../../src/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

vi.mock('../../../src/hooks/useViewMode', () => ({
  useViewMode: vi.fn(),
}));

// Import mocked functions
import { useSiteStore } from '../../../src/store/siteStore';
import { useEditorContent } from '../../../src/hooks/useEditorContent';
import { useSyntaxHighlighting } from '../../../src/hooks/useSyntaxHighlighting';
import { useKeyboardShortcuts } from '../../../src/hooks/useKeyboardShortcuts';
import { useViewMode } from '../../../src/hooks/useViewMode';

describe('useEditorState Hook', () => {
  let mockStore: {
    past: unknown[];
    future: unknown[];
  };

  let mockContentState: {
    localContent: string;
    isDirty: boolean;
    handleContentChange: ReturnType<typeof vi.fn>;
    handleSave: ReturnType<typeof vi.fn>;
    handleBlur: ReturnType<typeof vi.fn>;
    resetDirtyState: ReturnType<typeof vi.fn>;
  };

  let mockSyntaxState: {
    syntaxHighlighting: boolean;
    detectedLanguage: string;
    highlightCode: ReturnType<typeof vi.fn>;
    updateLanguage: ReturnType<typeof vi.fn>;
  };

  let mockKeyboardState: {
    handleKeyDown: ReturnType<typeof vi.fn>;
  };

  let mockViewModeState: {
    viewMode: 'editor' | 'preview' | 'split';
    setViewMode: ReturnType<typeof vi.fn>;
    cycleViewMode: ReturnType<typeof vi.fn>;
    getViewModeLabel: ReturnType<typeof vi.fn>;
    getViewModeIcon: ReturnType<typeof vi.fn>;
    getViewModeDimensions: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Setup mocks
    mockStore = {
      past: [],
      future: [],
    };

    mockContentState = {
      localContent: 'test content',
      isDirty: false,
      handleContentChange: vi.fn(),
      handleSave: vi.fn(),
      handleBlur: vi.fn(),
      resetDirtyState: vi.fn(),
    };

    mockSyntaxState = {
      syntaxHighlighting: true,
      detectedLanguage: 'javascript',
      highlightCode: vi.fn().mockReturnValue('<span>test</span>'),
      updateLanguage: vi.fn(),
    };

    mockKeyboardState = {
      handleKeyDown: vi.fn(),
    };

    mockViewModeState = {
      viewMode: 'editor',
      setViewMode: vi.fn(),
      cycleViewMode: vi.fn(),
      getViewModeLabel: vi.fn().mockReturnValue('Editor'),
      getViewModeIcon: vi.fn().mockReturnValue('📝'),
      getViewModeDimensions: vi.fn().mockReturnValue({ width: 100, height: 100 }),
    };

    // Get mocked functions
    const mockedUseSiteStore = vi.mocked(useSiteStore);
    const mockedUseEditorContent = vi.mocked(useEditorContent);
    const mockedUseSyntaxHighlighting = vi.mocked(useSyntaxHighlighting);
    const mockedUseKeyboardShortcuts = vi.mocked(useKeyboardShortcuts);
    const mockedUseViewMode = vi.mocked(useViewMode);

    mockedUseSiteStore.mockReturnValue(mockStore);
    mockedUseEditorContent.mockReturnValue(mockContentState);
    mockedUseSyntaxHighlighting.mockReturnValue(mockSyntaxState);
    mockedUseKeyboardShortcuts.mockReturnValue(mockKeyboardState);
    mockedUseViewMode.mockReturnValue(mockViewModeState);
  });

  it('should return combined state from all hooks', () => {
    const { result } = renderHook(() => useEditorState());

    expect(result.current.localContent).toBe('test content');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.syntaxHighlighting).toBe(true);
    expect(result.current.detectedLanguage).toBe('javascript');
    expect(result.current.viewMode).toBe('editor');
  });

  it('should calculate lines count correctly', () => {
    mockContentState.localContent = 'line1\nline2\nline3';
    const { result } = renderHook(() => useEditorState());

    expect(result.current.linesCount).toBe(3);
  });

  it('should calculate content length correctly', () => {
    mockContentState.localContent = 'hello world';
    const { result } = renderHook(() => useEditorState());

    expect(result.current.contentLength).toBe(11);
  });

  it('should determine canUndo based on store past length', () => {
    mockStore.past = [{ content: 'old content' }];
    const { result } = renderHook(() => useEditorState());

    expect(result.current.canUndo).toBe(true);
  });

  it('should determine canRedo based on store future length', () => {
    mockStore.future = [{ content: 'future content' }];
    const { result } = renderHook(() => useEditorState());

    expect(result.current.canRedo).toBe(true);
  });

  it('should call handleContentChange when content changes', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      const mockEvent = {
        target: { value: 'new content' },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      result.current.handleContentChange(mockEvent);
    });

    expect(mockContentState.handleContentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: 'new content' },
      })
    );
  });

  it('should call handleSave when save is triggered', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      result.current.handleSave();
    });

    expect(mockContentState.handleSave).toHaveBeenCalled();
  });

  it('should call handleKeyDown when keyboard event occurs', () => {
    const { result } = renderHook(() => useEditorState());
    const mockEvent = {} as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockKeyboardState.handleKeyDown).toHaveBeenCalledWith(mockEvent);
  });

  it('should call setViewMode when view mode changes', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      result.current.setViewMode('split');
    });

    expect(mockViewModeState.setViewMode).toHaveBeenCalledWith('split');
  });

  it('should call cycleViewMode when cycling view modes', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      result.current.cycleViewMode();
    });

    expect(mockViewModeState.cycleViewMode).toHaveBeenCalled();
  });

  it('should call highlightCode with correct parameters', () => {
    const { result } = renderHook(() => useEditorState());

    const highlighted = result.current.highlightCode('const x = 1;', 'javascript');

    expect(mockSyntaxState.highlightCode).toHaveBeenCalledWith('const x = 1;', 'javascript');
    expect(highlighted).toBe('<span>test</span>');
  });
});

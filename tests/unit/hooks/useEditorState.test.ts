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

// Import mocked functions
import { useSiteStore } from '../../../src/store/siteStore';
import { useEditorContent } from '../../../src/hooks/useEditorContent';

describe('useEditorState', () => {
  let mockStore: {
    past: unknown[];
    future: unknown[];
    present: { content: string };
    undo: ReturnType<typeof vi.fn>;
    redo: ReturnType<typeof vi.fn>;
    setContent: ReturnType<typeof vi.fn>;
    commit: ReturnType<typeof vi.fn>;
  };

  let mockContentState: {
    localContent: string;
    isDirty: boolean;
    handleContentChange: ReturnType<typeof vi.fn>;
    handleSave: ReturnType<typeof vi.fn>;
    handleBlur: ReturnType<typeof vi.fn>;
    resetDirtyState: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockStore = {
      past: [],
      future: [],
      present: { content: 'test content' },
      undo: vi.fn(),
      redo: vi.fn(),
      setContent: vi.fn(),
      commit: vi.fn(),
    };

    mockContentState = {
      localContent: 'test content',
      isDirty: false,
      handleContentChange: vi.fn(),
      handleSave: vi.fn(),
      handleBlur: vi.fn(),
      resetDirtyState: vi.fn(),
    };

    // Get mocked functions
    const mockedUseSiteStore = vi.mocked(useSiteStore);
    const mockedUseEditorContent = vi.mocked(useEditorContent);

    mockedUseSiteStore.mockReturnValue(mockStore);
    mockedUseEditorContent.mockReturnValue(mockContentState);
  });

  it('should return simplified state from hooks', () => {
    const { result } = renderHook(() => useEditorState());

    expect(result.current.localContent).toBe('test content');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.viewMode).toBe('desktop');
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

  it('should handle undo/redo state correctly', () => {
    mockStore.past = [{ content: 'old' }];
    mockStore.future = [{ content: 'new' }];
    const { result } = renderHook(() => useEditorState());

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('should handle keyboard shortcuts', () => {
    const { result } = renderHook(() => useEditorState());

    const mockEvent = {
      key: 's',
      ctrlKey: true,
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockContentState.handleSave).toHaveBeenCalled();
  });

  it('should provide view mode functions', () => {
    const { result } = renderHook(() => useEditorState());

    expect(result.current.getViewModeLabel('desktop')).toBe('Desktop');
    expect(result.current.getViewModeIcon('desktop')).toBe('🖥️');
    expect(result.current.getViewModeDimensions('desktop')).toEqual({ width: 1920, height: 1080 });
  });

  it('should handle view mode changes (no-op)', () => {
    const { result } = renderHook(() => useEditorState());

    // Should not throw
    act(() => {
      result.current.setViewMode('desktop');
    });

    expect(result.current.viewMode).toBe('desktop');
  });
});

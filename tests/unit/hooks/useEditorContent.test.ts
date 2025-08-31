/**
 * Unit tests for useEditorContent hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorContent } from '../../../src/hooks/useEditorContent';

// Mock the site store
const mockStore = {
  content: 'Initial content',
  setContent: vi.fn(),
  commit: vi.fn(),
};

const mockUseSiteStore = vi.fn(() => mockStore);

vi.mock('../../../src/store/siteStore', () => ({
  useSiteStore: () => mockUseSiteStore(),
}));

describe('useEditorContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.content = 'Initial content';
  });

  it('should initialize with store content', () => {
    const { result } = renderHook(() => useEditorContent());

    expect(result.current.localContent).toBe('Initial content');
    expect(result.current.isDirty).toBe(false);
  });

  it('should update local content and mark as dirty on change', () => {
    const { result } = renderHook(() => useEditorContent());

    const mockEvent = {
      target: { value: 'Updated content' },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleContentChange(mockEvent);
    });

    expect(result.current.localContent).toBe('Updated content');
    expect(result.current.isDirty).toBe(true);
  });

  it('should save content and reset dirty state', () => {
    const { result } = renderHook(() => useEditorContent());

    // Make content dirty
    const mockEvent = {
      target: { value: 'Updated content' },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleContentChange(mockEvent);
    });

    expect(result.current.isDirty).toBe(true);

    // Save content
    act(() => {
      result.current.handleSave();
    });

    expect(mockStore.setContent).toHaveBeenCalledWith('Updated content');
    expect(mockStore.commit).toHaveBeenCalled();
    expect(result.current.isDirty).toBe(false);
  });

  it('should handle blur event correctly', () => {
    const { result } = renderHook(() => useEditorContent());

    // Make content dirty
    const mockEvent = {
      target: { value: 'Updated content' },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleContentChange(mockEvent);
    });

    expect(result.current.isDirty).toBe(true);

    // Trigger blur
    act(() => {
      result.current.handleBlur();
    });

    expect(mockStore.setContent).toHaveBeenCalledWith('Updated content');
    expect(mockStore.commit).toHaveBeenCalled();
    expect(result.current.isDirty).toBe(false);
  });

  it('should not save on blur when content is not dirty', () => {
    const { result } = renderHook(() => useEditorContent());

    act(() => {
      result.current.handleBlur();
    });

    expect(mockStore.setContent).not.toHaveBeenCalled();
    expect(mockStore.commit).not.toHaveBeenCalled();
  });
});

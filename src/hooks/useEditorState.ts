import React, { useMemo } from 'react';
import { useSiteStore } from '@/store/siteStore';
import { useEditorContent } from './useEditorContent';

export interface UseEditorStateReturn {
  // Content management
  localContent: string;
  isDirty: boolean;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: () => void;
  handleBlur: () => void;

  // Basic keyboard handling (simplified)
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  // Basic view mode (simplified)
  viewMode: 'desktop';
  setViewMode: (mode: 'desktop') => void;
  getViewModeLabel: (mode: 'desktop') => string;
  getViewModeIcon: (mode: 'desktop') => string;
  getViewModeDimensions: (mode: 'desktop') => { width: number; height: number };

  // Computed values
  linesCount: number;
  contentLength: number;
  canUndo: boolean;
  canRedo: boolean;
}

export function useEditorState(): UseEditorStateReturn {
  const store = useSiteStore();

  // Content management
  const contentState = useEditorContent();

  // Basic keyboard handling
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Basic Ctrl+S or Cmd+S handling for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        contentState.handleSave();
      }
      // Basic Ctrl+Z or Cmd+Z handling for undo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      // Basic Ctrl+Y or Cmd+Y, or Ctrl+Shift+Z for redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        store.redo();
      }
    },
    [contentState, store]
  );

  // Basic view mode (simplified to desktop only)
  const viewMode = 'desktop' as const;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setViewMode = React.useCallback((_mode: 'desktop') => {
    // No-op since we only support desktop mode
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getViewModeLabel = React.useCallback((_mode: 'desktop') => {
    return 'Desktop';
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getViewModeIcon = React.useCallback((_mode: 'desktop') => {
    return '🖥️';
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getViewModeDimensions = React.useCallback((_mode: 'desktop') => {
    return { width: 1920, height: 1080 };
  }, []);

  // Computed values
  const linesCount = useMemo(() => {
    return contentState.localContent.split('\n').length;
  }, [contentState.localContent]);

  const contentLength = useMemo(() => {
    return contentState.localContent.length;
  }, [contentState.localContent]);

  const canUndo = useMemo(() => {
    return store.past.length > 0;
  }, [store.past.length]);

  const canRedo = useMemo(() => {
    return store.future.length > 0;
  }, [store.future.length]);

  return {
    // Content management
    localContent: contentState.localContent,
    isDirty: contentState.isDirty,
    handleContentChange: contentState.handleContentChange,
    handleSave: contentState.handleSave,
    handleBlur: contentState.handleBlur,

    // Basic keyboard handling
    handleKeyDown,

    // Basic view mode
    viewMode,
    setViewMode,
    getViewModeLabel,
    getViewModeIcon,
    getViewModeDimensions,

    // Computed values
    linesCount,
    contentLength,
    canUndo,
    canRedo,
  };
}

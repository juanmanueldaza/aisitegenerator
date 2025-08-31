import React, { useMemo } from 'react';
import { useSiteStore } from '@/store/siteStore';
import { useEditorContent } from './useEditorContent';
import { useSyntaxHighlighting } from './useSyntaxHighlighting';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useViewMode } from './useViewMode';

export interface UseEditorStateReturn {
  // Content management
  localContent: string;
  isDirty: boolean;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: () => void;
  handleBlur: () => void;

  // Syntax highlighting
  syntaxHighlighting: boolean;
  detectedLanguage: string;
  highlightCode: (code: string, language?: string) => string;

  // Keyboard shortcuts
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  // View mode
  viewMode: import('@/types').ViewMode;
  setViewMode: (mode: import('@/types').ViewMode) => void;
  cycleViewMode: () => void;
  getViewModeLabel: (mode: import('@/types').ViewMode) => string;
  getViewModeIcon: (mode: import('@/types').ViewMode) => string;
  getViewModeDimensions: (mode: import('@/types').ViewMode) => { width: number; height: number };

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

  // Syntax highlighting
  const syntaxState = useSyntaxHighlighting(contentState.localContent);

  // Update language detection when content changes
  React.useEffect(() => {
    syntaxState.updateLanguage(contentState.localContent);
  }, [contentState.localContent, syntaxState]);

  // Keyboard shortcuts
  const keyboardState = useKeyboardShortcuts({
    onSave: contentState.handleSave,
  });

  // View mode
  const viewModeState = useViewMode();

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

    // Syntax highlighting
    syntaxHighlighting: syntaxState.syntaxHighlighting,
    detectedLanguage: syntaxState.detectedLanguage,
    highlightCode: syntaxState.highlightCode,

    // Keyboard shortcuts
    handleKeyDown: keyboardState.handleKeyDown,

    // View mode
    viewMode: viewModeState.viewMode,
    setViewMode: viewModeState.setViewMode,
    cycleViewMode: viewModeState.cycleViewMode,
    getViewModeLabel: viewModeState.getViewModeLabel,
    getViewModeIcon: viewModeState.getViewModeIcon,
    getViewModeDimensions: viewModeState.getViewModeDimensions,

    // Computed values
    linesCount,
    contentLength,
    canUndo,
    canRedo,
  };
}

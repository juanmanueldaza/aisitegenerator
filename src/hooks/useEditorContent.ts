/**
 * useEditorContent Hook
 * Manages editor content state, synchronization with store, and save operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useSiteStore } from '@/store/siteStore';

export interface UseEditorContentReturn {
  localContent: string;
  isDirty: boolean;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSave: () => void;
  handleBlur: () => void;
  resetDirtyState: () => void;
}

export function useEditorContent(): UseEditorContentReturn {
  const store = useSiteStore();
  const [localContent, setLocalContent] = useState(store.content);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local content with store content
  useEffect(() => {
    setLocalContent(store.content);
    setIsDirty(false);
  }, [store.content]);

  // Handle content changes
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    setIsDirty(true);
  }, []);

  // Save content to store
  const handleSave = useCallback(() => {
    store.setContent(localContent);
    store.commit(); // Create undo point
    setIsDirty(false);
  }, [store, localContent]);

  // Handle blur event (auto-save)
  const handleBlur = useCallback(() => {
    if (isDirty) {
      handleSave();
    }
  }, [isDirty, handleSave]);

  // Reset dirty state (useful for external triggers)
  const resetDirtyState = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    localContent,
    isDirty,
    handleContentChange,
    handleSave,
    handleBlur,
    resetDirtyState,
  };
}

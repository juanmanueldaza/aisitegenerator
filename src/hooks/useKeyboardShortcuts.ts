/**
 * useKeyboardShortcuts Hook
 * Manages keyboard shortcuts for the editor
 */

import { useCallback } from 'react';
import { useSiteStore } from '@/store/siteStore';

export interface UseKeyboardShortcutsReturn {
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export interface KeyboardShortcutsConfig {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts(
  config: KeyboardShortcutsConfig = {}
): UseKeyboardShortcutsReturn {
  const store = useSiteStore();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const { onSave, onUndo, onRedo } = config;

      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (onUndo) {
          onUndo();
        } else {
          store.undo();
        }
        return;
      }

      // Ctrl+Y or Cmd+Shift+Z to redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        if (onRedo) {
          onRedo();
        } else {
          store.redo();
        }
        return;
      }
    },
    [config, store]
  );

  return {
    handleKeyDown,
  };
}

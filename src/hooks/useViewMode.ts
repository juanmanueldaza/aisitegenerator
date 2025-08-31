/**
 * useViewMode Hook
 * Manages view mode state for editor preview (browser, mobile, tablet, desktop)
 */

import { useState, useCallback } from 'react';
import type { ViewMode } from '@/types';

export interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  cycleViewMode: () => void;
  getViewModeLabel: (mode: ViewMode) => string;
  getViewModeIcon: (mode: ViewMode) => string;
  getViewModeDimensions: (mode: ViewMode) => { width: number; height: number };
}

const VIEW_MODES: ViewMode[] = ['browser', 'mobile', 'tablet', 'desktop'];

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  browser: 'Browser',
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
};

const VIEW_MODE_ICONS: Record<ViewMode, string> = {
  browser: '🌐',
  mobile: '📱',
  tablet: '📱',
  desktop: '🖥️',
};

const VIEW_MODE_DIMENSIONS: Record<ViewMode, { width: number; height: number }> = {
  browser: { width: 1200, height: 800 },
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

export function useViewMode(initialMode: ViewMode = 'browser'): UseViewModeReturn {
  const [viewMode, setViewModeState] = useState<ViewMode>(initialMode);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  const cycleViewMode = useCallback(() => {
    const currentIndex = VIEW_MODES.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % VIEW_MODES.length;
    setViewModeState(VIEW_MODES[nextIndex]);
  }, [viewMode]);

  const getViewModeLabel = useCallback((mode: ViewMode) => {
    return VIEW_MODE_LABELS[mode];
  }, []);

  const getViewModeIcon = useCallback((mode: ViewMode) => {
    return VIEW_MODE_ICONS[mode];
  }, []);

  const getViewModeDimensions = useCallback((mode: ViewMode) => {
    return VIEW_MODE_DIMENSIONS[mode];
  }, []);

  return {
    viewMode,
    setViewMode,
    cycleViewMode,
    getViewModeLabel,
    getViewModeIcon,
    getViewModeDimensions,
  };
}

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../../../src/hooks/useSettings';

describe('useSettings Hook', () => {
  it('should return correct initial state', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.activeSection).toBe('ai-providers');
    expect(result.current.setActiveSection).toBeInstanceOf(Function);
    expect(result.current.sections).toHaveLength(3);
  });

  it('should have correct section structure', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.sections).toEqual([
      {
        id: 'ai-providers',
        label: 'AI Providers',
        icon: '🤖',
      },
      {
        id: 'general',
        label: 'General',
        icon: '⚙️',
      },
      {
        id: 'advanced',
        label: 'Advanced',
        icon: '🔧',
      },
    ]);
  });

  it('should change active section', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setActiveSection('general');
    });

    expect(result.current.activeSection).toBe('general');
  });

  it('should handle all section changes correctly', () => {
    const { result } = renderHook(() => useSettings());

    // Test changing to general
    act(() => {
      result.current.setActiveSection('general');
    });
    expect(result.current.activeSection).toBe('general');

    // Test changing to advanced
    act(() => {
      result.current.setActiveSection('advanced');
    });
    expect(result.current.activeSection).toBe('advanced');

    // Test changing back to ai-providers
    act(() => {
      result.current.setActiveSection('ai-providers');
    });
    expect(result.current.activeSection).toBe('ai-providers');
  });
});

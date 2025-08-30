import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../../../src/hooks';

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with empty toast', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toast).toBe('');
    expect(result.current.visible).toBe(false);
    expect(typeof result.current.showToast).toBe('function');
    expect(typeof result.current.hideToast).toBe('function');
  });

  it('should show toast message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.toast).toBe('Test message');
    expect(result.current.visible).toBe(true);
  });

  it('should hide toast message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.hideToast();
    });

    expect(result.current.toast).toBe('');
    expect(result.current.visible).toBe(false);
  });

  it('should auto-hide toast after duration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 1000);
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toast).toBe('');
    expect(result.current.visible).toBe(false);

    vi.useRealTimers();
  });

  it('should not auto-hide when duration is 0', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 0);
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toast).toBe('Test message');
    expect(result.current.visible).toBe(true);

    vi.useRealTimers();
  });

  it('should replace current toast with new message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First message');
    });

    expect(result.current.toast).toBe('First message');

    act(() => {
      result.current.showToast('Second message');
    });

    expect(result.current.toast).toBe('Second message');
  });

  it('should handle empty message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('');
    });

    expect(result.current.toast).toBe('');
    expect(result.current.visible).toBe(false);
  });

  it('should clear existing timeout when showing new toast', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First message', 2000);
    });

    expect(result.current.toast).toBe('First message');

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Show new toast (should clear previous timeout)
    act(() => {
      result.current.showToast('Second message', 500);
    });

    expect(result.current.toast).toBe('Second message');

    // Advance time past the new duration
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.toast).toBe('');
    expect(result.current.visible).toBe(false);

    vi.useRealTimers();
  });
});

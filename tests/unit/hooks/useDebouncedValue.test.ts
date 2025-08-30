import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../../../src/hooks';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 100));

    expect(result.current).toBe('initial');
  });

  it('should update value immediately when delay is 0', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 0));

    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 100 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Advance time to just before delay
    act(() => {
      vi.advanceTimersByTime(99);
    });

    expect(result.current).toBe('initial');

    // Advance time past delay
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });

  it('should handle rapid consecutive updates', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe('first');

    // First update
    rerender({ value: 'second' });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current).toBe('first');

    // Second update before first delay completes
    rerender({ value: 'third' });

    // Advance time to complete the delay from the second update
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('third');

    vi.useRealTimers();
  });

  it('should work with different data types', () => {
    vi.useFakeTimers();

    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 50),
      { initialProps: { value: 0 } }
    );

    numberRerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(numberResult.current).toBe(42);

    // Test with boolean
    const { result: boolResult, rerender: boolRerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 50),
      { initialProps: { value: false } }
    );

    boolRerender({ value: true });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(boolResult.current).toBe(true);

    // Test with object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 50),
      { initialProps: { value: { name: 'initial' } } }
    );

    objectRerender({ value: { name: 'updated' } });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(objectResult.current).toEqual({ name: 'updated' });

    vi.useRealTimers();
  });

  it('should handle delay changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 200 } }
    );

    // Update value with longer delay
    rerender({ value: 'updated', delay: 200 });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('initial');

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });

  it('should cancel previous timeout when value changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'first' } }
    );

    // Start first update
    rerender({ value: 'second' });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Start second update (should cancel first timeout)
    rerender({ value: 'third' });

    // Advance time to complete second delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('third');

    vi.useRealTimers();
  });

  it('should handle very short delays', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 1),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });

  it('should handle very long delays', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 5000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Advance time significantly but not enough
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current).toBe('initial');

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncOperation } from '../../../src/hooks/index';

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with default state', () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    expect(typeof result.current.execute).toBe('function');
  });

  it('should handle successful async operation', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success result');
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useAsyncOperation(asyncFn, { onSuccess })
    );

    // Execute the operation
    const promise = result.current.execute();

    // Wait for the operation to complete
    await promise;

    // Wait for state updates to be applied
    await waitFor(() => {
      expect(result.current.data).toBe('success result');
    });

    expect(result.current.error).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith('success result');
    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it('should handle async operation with arguments', async () => {
    const asyncFn = vi.fn().mockImplementation((arg1: string, arg2: number) =>
      Promise.resolve(`${arg1}-${arg2}`)
    );
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    const promise = result.current.execute('test', 123);
    await promise;

    await waitFor(() => {
      expect(result.current.data).toBe('test-123');
    });
    expect(asyncFn).toHaveBeenCalledWith('test', 123);
  });

  it('should handle async operation error', async () => {
    const error = new Error('Test error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAsyncOperation(asyncFn, { onError })
    );

    const promise = result.current.execute();

    // The promise should reject
    await expect(promise).rejects.toThrow('Test error');

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });
    expect(result.current.data).toBe(null);
    expect(onError).toHaveBeenCalledWith(error);
    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error thrown values', async () => {
    const asyncFn = vi.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    const promise = result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('string error');
    });
    expect(result.current.data).toBe(null);
    await expect(promise).rejects.toThrow('string error');
  });

  it('should reset error on new execution', async () => {
    const error = new Error('First error');
    const asyncFn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    // First execution - error
    try {
      await result.current.execute();
    } catch {
      // Expected error
    }
    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    // Second execution - success
    await result.current.execute();
    await waitFor(() => {
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe('success');
    });
  });

  it('should not call onSuccess or onError when not provided', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    const promise = result.current.execute();
    await promise;

    await waitFor(() => {
      expect(result.current.data).toBe('success');
    });
    // No errors should occur from missing callbacks
  });

  it('should handle multiple concurrent executions', async () => {
    const asyncFn = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve('done'), 100))
    );
    const { result } = renderHook(() => useAsyncOperation(asyncFn));

    const promise1 = result.current.execute();
    const promise2 = result.current.execute();

    await Promise.all([promise1, promise2]);

    await waitFor(() => {
      expect(result.current.data).toBe('done');
    });
    expect(asyncFn).toHaveBeenCalledTimes(2);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../../src/hooks';

describe('useLocalStorage', () => {
  let mockGetItem: MockedFunction<typeof Storage.prototype.getItem>;
  let mockSetItem: MockedFunction<typeof Storage.prototype.setItem>;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    mockGetItem = vi.fn();
    mockSetItem = vi.fn();

    mockLocalStorage = {
      getItem: mockGetItem,
      setItem: mockSetItem,
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default value when localStorage is empty', () => {
    mockGetItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(mockGetItem).toHaveBeenCalledWith('testKey');
  });

  it('should initialize with parsed value from localStorage', () => {
    mockGetItem.mockReturnValue(JSON.stringify('storedValue'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('storedValue');
    expect(mockGetItem).toHaveBeenCalledWith('testKey');
  });

  it('should handle JSON parse errors gracefully', () => {
    mockGetItem.mockReturnValue('invalid-json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "testKey":',
      expect.any(SyntaxError)
    );

    consoleSpy.mockRestore();
  });

  it('should update value and sync to localStorage', () => {
    mockGetItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(mockSetItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  it('should handle functional updates', () => {
    mockGetItem.mockReturnValue(JSON.stringify('initial'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    act(() => {
      result.current[1]((prev) => `${prev}Updated`);
    });

    expect(result.current[0]).toBe('initialUpdated');
    expect(mockSetItem).toHaveBeenCalledWith('testKey', JSON.stringify('initialUpdated'));
  });

  it('should handle localStorage setItem errors gracefully', () => {
    mockGetItem.mockReturnValue(null);
    mockSetItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    act(() => {
      result.current[1]('newValue');
    });

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('newValue');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "testKey":',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should work with different data types', () => {
    mockGetItem.mockReturnValue(null);

    // Test with number
    const { result: numberResult } = renderHook(() => useLocalStorage('numberKey', 0));
    act(() => {
      numberResult.current[1](42);
    });
    expect(numberResult.current[0]).toBe(42);
    expect(mockSetItem).toHaveBeenCalledWith('numberKey', JSON.stringify(42));

    // Test with boolean
    const { result: boolResult } = renderHook(() => useLocalStorage('boolKey', false));
    act(() => {
      boolResult.current[1](true);
    });
    expect(boolResult.current[0]).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith('boolKey', JSON.stringify(true));

    // Test with object
    const { result: objectResult } = renderHook(() =>
      useLocalStorage('objectKey', { name: 'test' })
    );
    act(() => {
      objectResult.current[1]((prev) => ({ ...prev, age: 25 }));
    });
    expect(objectResult.current[0]).toEqual({ name: 'test', age: 25 });
    expect(mockSetItem).toHaveBeenCalledWith('objectKey', JSON.stringify({ name: 'test', age: 25 }));

    // Test with array
    const { result: arrayResult } = renderHook(() => useLocalStorage('arrayKey', [1, 2, 3]));
    act(() => {
      arrayResult.current[1]((prev) => [...prev, 4]);
    });
    expect(arrayResult.current[0]).toEqual([1, 2, 3, 4]);
    expect(mockSetItem).toHaveBeenCalledWith('arrayKey', JSON.stringify([1, 2, 3, 4]));
  });

  it('should handle null and undefined values', () => {
    mockGetItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('nullableKey', null as string | null));

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe(null);
    expect(mockSetItem).toHaveBeenCalledWith('nullableKey', JSON.stringify(null));
  });

  it('should persist value across re-renders', () => {
    mockGetItem.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useLocalStorage('persistKey', 'initial'));

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');

    // Re-render should maintain the updated value
    rerender();

    expect(result.current[0]).toBe('updated');
  });
});

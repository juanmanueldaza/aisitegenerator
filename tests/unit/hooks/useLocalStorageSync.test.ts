import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorageSync } from '../../../src/hooks';

describe('useLocalStorageSync', () => {
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

  it('should initialize with default values when localStorage is empty', () => {
    mockGetItem.mockReturnValue(null);

    const keys: (keyof typeof defaultValues)[] = ['apiKey1', 'apiKey2'];
    const defaultValues = { apiKey1: '', apiKey2: '' };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    expect(result.current[0]).toEqual(defaultValues);
    expect(mockGetItem).toHaveBeenCalledWith('apiKey1');
    expect(mockGetItem).toHaveBeenCalledWith('apiKey2');
  });

  it('should initialize with values from localStorage', () => {
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'apiKey1') return JSON.stringify('stored-key-1');
      if (key === 'apiKey2') return JSON.stringify('stored-key-2');
      return null;
    });

    const keys: (keyof typeof defaultValues)[] = ['apiKey1', 'apiKey2'];
    const defaultValues = { apiKey1: '', apiKey2: '' };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    expect(result.current[0]).toEqual({
      apiKey1: 'stored-key-1',
      apiKey2: 'stored-key-2',
    });
  });

  it('should handle JSON parse errors gracefully', () => {
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'apiKey1') return 'invalid-json';
      if (key === 'apiKey2') return JSON.stringify('valid-key');
      return null;
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const keys: (keyof typeof defaultValues)[] = ['apiKey1', 'apiKey2'];
    const defaultValues = { apiKey1: 'default1', apiKey2: 'default2' };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    expect(result.current[0]).toEqual({
      apiKey1: 'default1', // Should use default due to parse error
      apiKey2: 'valid-key',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "apiKey1":',
      expect.any(SyntaxError)
    );

    consoleSpy.mockRestore();
  });

  it('should update single value and sync to localStorage', () => {
    mockGetItem.mockReturnValue(null);

    const keys: (keyof typeof defaultValues)[] = ['apiKey1', 'apiKey2'];
    const defaultValues = { apiKey1: '', apiKey2: '' };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    act(() => {
      result.current[1]('apiKey1', 'new-value');
    });

    expect(result.current[0].apiKey1).toBe('new-value');
    expect(result.current[0].apiKey2).toBe('');
    expect(mockSetItem).toHaveBeenCalledWith('apiKey1', JSON.stringify('new-value'));
  });

  it('should handle functional updates', () => {
    mockGetItem.mockReturnValue(JSON.stringify('initial-value'));

    const keys: (keyof typeof defaultValues)[] = ['apiKey1'];
    const defaultValues = { apiKey1: '' };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    act(() => {
      result.current[1]('apiKey1', (prev) => `${prev}-updated`);
    });

    expect(result.current[0].apiKey1).toBe('initial-value-updated');
    expect(mockSetItem).toHaveBeenCalledWith('apiKey1', JSON.stringify('initial-value-updated'));
  });

  it('should handle localStorage setItem errors gracefully', () => {
    mockGetItem.mockReturnValue(null);
    mockSetItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const keys: (keyof typeof defaultValues)[] = ['apiKey1'];
    const defaultValues = { apiKey1: '' };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    act(() => {
      result.current[1]('apiKey1', 'new-value');
    });

    // State should still update even if localStorage fails
    expect(result.current[0].apiKey1).toBe('new-value');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "apiKey1":',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should work with different data types', () => {
    mockGetItem.mockReturnValue(null);

    const keys: (keyof typeof defaultValues)[] = ['count', 'enabled', 'config'];
    const defaultValues = {
      count: 0,
      enabled: false,
      config: { theme: 'light' } as { theme: string } | { theme: string; fontSize: number },
    };

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    act(() => {
      result.current[1]('count', 42);
      result.current[1]('enabled', true);
      result.current[1]('config', { theme: 'dark', fontSize: 14 });
    });

    expect(result.current[0]).toEqual({
      count: 42,
      enabled: true,
      config: { theme: 'dark', fontSize: 14 },
    });

    expect(mockSetItem).toHaveBeenCalledWith('count', JSON.stringify(42));
    expect(mockSetItem).toHaveBeenCalledWith('enabled', JSON.stringify(true));
    expect(mockSetItem).toHaveBeenCalledWith('config', JSON.stringify({ theme: 'dark', fontSize: 14 }));
  });

  it('should handle empty keys array', () => {
    const keys: (keyof typeof defaultValues)[] = [];
    const defaultValues = {};

    const { result } = renderHook(() =>
      useLocalStorageSync(keys, defaultValues)
    );

    expect(result.current[0]).toEqual({});
    expect(mockGetItem).not.toHaveBeenCalled();
  });
});

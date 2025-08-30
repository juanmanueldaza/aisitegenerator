import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventListener } from '../../../src/hooks';

describe('useEventListener', () => {
  let mockAddEventListener: MockedFunction<typeof window.addEventListener>;
  let mockRemoveEventListener: MockedFunction<typeof window.removeEventListener>;

  beforeEach(() => {
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    // Mock window event listener methods
    Object.defineProperty(window, 'addEventListener', {
      writable: true,
      value: mockAddEventListener,
    });

    Object.defineProperty(window, 'removeEventListener', {
      writable: true,
      value: mockRemoveEventListener,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add event listener on mount', () => {
    const handler = vi.fn();
    const eventName = 'click';

    renderHook(() => useEventListener(eventName, handler));

    expect(mockAddEventListener).toHaveBeenCalledWith(eventName, expect.any(Function), undefined);
  });

  it('should add event listener with options', () => {
    const handler = vi.fn();
    const eventName = 'scroll';
    const options = { passive: true, capture: false };

    renderHook(() => useEventListener(eventName, handler, options));

    expect(mockAddEventListener).toHaveBeenCalledWith(eventName, expect.any(Function), options);
  });

  it('should remove event listener on unmount', () => {
    const handler = vi.fn();
    const eventName = 'resize';

    const { unmount } = renderHook(() => useEventListener(eventName, handler));

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(eventName, expect.any(Function), undefined);
  });

  it('should update handler when it changes', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const eventName = 'keydown';

    let currentHandler = handler1;
    const { rerender } = renderHook(() => useEventListener(eventName, currentHandler));

    // First render
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);

    // Update handler
    currentHandler = handler2;
    rerender();

    // Should not add new listener, but the internal ref should be updated
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
  });

  it('should handle different event types', () => {
    const clickHandler = vi.fn();
    const scrollHandler = vi.fn();
    const resizeHandler = vi.fn();

    renderHook(() => useEventListener('click', clickHandler));
    renderHook(() => useEventListener('scroll', scrollHandler));
    renderHook(() => useEventListener('resize', resizeHandler));

    expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), undefined);
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function), undefined);
  });

  it('should call the handler when event is triggered', () => {
    const handler = vi.fn();
    const eventName = 'click';
    const mockEvent = new Event('click');

    renderHook(() => useEventListener(eventName, handler));

    // Get the event listener function that was added
    const addedListener = mockAddEventListener.mock.calls[0][1] as EventListener;

    // Simulate calling the event listener
    act(() => {
      addedListener(mockEvent);
    });

    expect(handler).toHaveBeenCalledWith(mockEvent);
  });

  it('should handle boolean options', () => {
    const handler = vi.fn();
    const eventName = 'mousedown';

    renderHook(() => useEventListener(eventName, handler, true));

    expect(mockAddEventListener).toHaveBeenCalledWith(eventName, expect.any(Function), true);
  });

  it('should handle complex options object', () => {
    const handler = vi.fn();
    const eventName = 'touchstart';
    const options = {
      capture: true,
      passive: false,
      once: true,
    };

    renderHook(() => useEventListener(eventName, handler, options));

    expect(mockAddEventListener).toHaveBeenCalledWith(eventName, expect.any(Function), options);
  });
});

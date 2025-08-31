/**
 * Test Helpers for Integration Tests
 * Utility functions to support integration testing workflows
 */

import { expect, vi } from 'vitest';
import type { AIMessage } from '../../../src/types/ai';

/**
 * Waits for a condition to be true with timeout
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Creates a mock AI response with customizable content
 */
export const createMockAIResponse = (content: string, delay = 0) => {
  return new Promise<{ text: string; finishReason: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        text: content,
        finishReason: 'stop',
      });
    }, delay);
  });
};

/**
 * Simulates a streaming AI response
 */
export const createMockStreamingResponse = async function* (
  content: string,
  chunkSize = 10,
  delay = 50
) {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    yield { text: chunk, finishReason: 'stop' };
  }
};

/**
 * Validates AI message structure
 */
export const validateAIMessage = (message: AIMessage) => {
  expect(message).toBeDefined();
  expect(typeof message.role).toBe('string');
  expect(['user', 'assistant', 'system']).toContain(message.role);
  expect(typeof message.content).toBe('string');
  expect(message.content.length).toBeGreaterThan(0);
};

/**
 * Creates a sequence of AI messages for conversation testing
 */
export const createConversation = (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): AIMessage[] => {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
};

/**
 * Mocks browser localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

/**
 * Mocks browser sessionStorage for testing
 */
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

/**
 * Creates a mock fetch response
 */
export const createMockFetchResponse = (data: unknown, status = 200, statusText = 'OK') => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    clone: () => createMockFetchResponse(data, status, statusText),
  };
};

/**
 * Creates a mock fetch function for testing
 */
export const createMockFetchFunction = (
  responses: Array<{
    url?: string | RegExp;
    method?: string;
    response: unknown;
    status?: number;
    statusText?: string;
  }>
) => {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';

    for (const mockResponse of responses) {
      const urlMatches =
        !mockResponse.url ||
        (typeof mockResponse.url === 'string'
          ? url === mockResponse.url
          : mockResponse.url.test(url));
      const methodMatches = !mockResponse.method || method === mockResponse.method;

      if (urlMatches && methodMatches) {
        return createMockFetchResponse(
          mockResponse.response,
          mockResponse.status,
          mockResponse.statusText
        );
      }
    }

    // Return a default 404 if no mock matches
    return createMockFetchResponse({ error: 'Not found' }, 404, 'Not Found');
  });
};

/**
 * Waits for React component updates
 */
export const waitForComponentUpdate = async (
  component: { forceUpdate?: () => void },
  timeout = 1000
) => {
  await new Promise<void>((resolve) => {
    const timeoutId = setTimeout(resolve, timeout);

    // If the component has a forceUpdate method, use it
    if (component && typeof component.forceUpdate === 'function') {
      component.forceUpdate();
      clearTimeout(timeoutId);
      resolve();
    }
  });
};

/**
 * Creates a mock event for testing
 */
export const createMockEvent = (type: string, properties: Record<string, unknown> = {}) => {
  const event = {
    type,
    bubbles: false,
    cancelBubble: false,
    cancelable: true,
    composed: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    returnValue: true,
    timeStamp: Date.now(),
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    stopImmediatePropagation: vi.fn(),
    ...properties,
  };

  return event as unknown as Event;
};

/**
 * Simulates user typing in an input field
 */
export const simulateTyping = async (
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  delay = 10
) => {
  element.value = '';
  element.focus();

  for (const char of text) {
    element.value += char;
    element.dispatchEvent(createMockEvent('input', { target: element }));

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  element.dispatchEvent(createMockEvent('change', { target: element }));
};

/**
 * Waits for DOM element to be rendered
 */
export const waitForElement = async (selector: string, timeout = 5000): Promise<Element> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Element with selector "${selector}" not found within ${timeout}ms`);
};

/**
 * Cleans up after tests
 */
export const cleanup = () => {
  // Clear any timers
  vi.clearAllTimers();

  // Clear any mocks
  vi.clearAllMocks();

  // Reset DOM if in jsdom environment
  if (typeof document !== 'undefined' && document.body) {
    document.body.innerHTML = '';
  }
};

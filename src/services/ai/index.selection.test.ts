import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Runtime flags for mocks
let mockKey = '';
let created = { gemini: 0, proxy: 0 };
let cfg = {
  PROXY_BASE_URL: '',
  DEFAULT_PROVIDER: 'google',
  DEFAULT_MODEL: 'gemini-2.0-flash',
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn((key: string) => {
    if (key === 'GEMINI_API_KEY') return mockKey;
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

// Mock the strategy classes to track instantiation
function setupModuleMocks() {
  // Mock window.localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock process.env
  const originalEnv = process.env;
  vi.stubGlobal('process', {
    ...originalEnv,
    env: {
      ...originalEnv,
      GOOGLE_API_KEY: mockKey || undefined,
      GEMINI_API_KEY: mockKey || undefined,
      PROXY_BASE_URL: cfg.PROXY_BASE_URL || undefined,
    },
  });

  vi.doMock('./providers', () => ({
    AIProviderFactory: {
      createGemini: vi.fn((apiKey: string) => {
        created.gemini += 1;
        return {
          isAvailable: () => Boolean(apiKey),
          generate: vi.fn().mockResolvedValue({ text: 'mock gemini response' }),
          generateStream: vi.fn().mockImplementation(async function* () {
            yield { text: 'mock' };
          }),
        };
      }),
      createProxy: vi.fn((baseUrl: string) => {
        created.proxy += 1;
        return {
          isAvailable: () => Boolean(baseUrl && baseUrl !== 'http://localhost:5173'),
          generate: vi.fn().mockResolvedValue({ text: 'mock proxy response' }),
          generateStream: vi.fn().mockImplementation(async function* () {
            yield { text: 'mock' };
          }),
        };
      }),
      createGoogleSDK: vi.fn((apiKey: string) => ({
        isAvailable: () => Boolean(apiKey),
        generate: vi.fn().mockResolvedValue({ text: 'mock google sdk response' }),
        generateStream: vi.fn().mockImplementation(async function* () {
          yield { text: 'mock' };
        }),
      })),
      createOpenAISDK: vi.fn((apiKey: string) => ({
        isAvailable: () => Boolean(apiKey),
        generate: vi.fn().mockResolvedValue({ text: 'mock openai sdk response' }),
        generateStream: vi.fn().mockImplementation(async function* () {
          yield { text: 'mock' };
        }),
      })),
      createAnthropicSDK: vi.fn((apiKey: string) => ({
        isAvailable: () => Boolean(apiKey),
        generate: vi.fn().mockResolvedValue({ text: 'mock anthropic sdk response' }),
        generateStream: vi.fn().mockImplementation(async function* () {
          yield { text: 'mock' };
        }),
      })),
      createCohereSDK: vi.fn((apiKey: string) => ({
        isAvailable: () => Boolean(apiKey),
        generate: vi.fn().mockResolvedValue({ text: 'mock cohere sdk response' }),
        generateStream: vi.fn().mockImplementation(async function* () {
          yield { text: 'mock' };
        }),
      })),
    },
  }));

  // Mock AI_CONFIG and readEnv
  vi.doMock('@/constants/config', () => ({
    AI_CONFIG: cfg,
    readEnv: (...keys: string[]) => {
      // Simulate the readEnv function behavior
      for (const key of keys) {
        if (
          key === 'GOOGLE_API_KEY' ||
          key === 'GEMINI_API_KEY' ||
          key === 'GOOGLE_GENERATIVE_AI_API_KEY'
        ) {
          return mockKey || undefined;
        }
        if (key === 'PROXY_BASE_URL') {
          return cfg.PROXY_BASE_URL || undefined;
        }
        if (key === 'OPENAI_API_KEY') {
          return undefined;
        }
        if (key === 'ANTHROPIC_API_KEY') {
          return undefined;
        }
        if (key === 'COHERE_API_KEY') {
          return undefined;
        }
      }
      return undefined;
    },
  }));
}

async function loadUseAI() {
  setupModuleMocks();
  const mod = await import('./index');
  return mod.getAIProvider;
}

describe('useAIProvider selection', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    created = { gemini: 0, proxy: 0 };
    cfg = {
      PROXY_BASE_URL: '',
      DEFAULT_PROVIDER: 'google',
      DEFAULT_MODEL: 'gemini-2.0-flash',
    };
    mockKey = '';
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('throws error when requesting gemini but only proxy is available', async () => {
    cfg.PROXY_BASE_URL = '/api/ai-sdk';
    const getAI = await loadUseAI();
    expect(() => getAI('gemini')).toThrow(
      "AI provider 'gemini' is not available. Available providers: proxy"
    );
  });

  it('returns gemini when API key is available', async () => {
    mockKey = 'test-api-key';
    const getAI = await loadUseAI();
    const ai = getAI('gemini');
    expect(ai.ready).toBe(true);
    expect(created.gemini).toBe(1);
    expect(created.proxy).toBe(0);
  });

  it('throws error when no providers are available', async () => {
    const getAI = await loadUseAI();
    expect(() => getAI('gemini')).toThrow(
      "AI provider 'gemini' is not available. No providers are configured or available."
    );
    expect(created.proxy).toBe(0);
    expect(created.gemini).toBe(0);
  });

  it('returns proxy when requesting proxy and it is available', async () => {
    cfg.PROXY_BASE_URL = '/api/ai-sdk';
    const getAI = await loadUseAI();
    const ai = getAI('proxy');
    expect(ai.ready).toBe(true);
    expect(created.proxy).toBe(1);
    expect(created.gemini).toBe(0);
  });
});

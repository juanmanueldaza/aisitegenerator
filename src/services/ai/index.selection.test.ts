import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Runtime flags for mocks
let mockKey = '';
let created = { gemini: 0, v2: 0, legacy: 0 };
let cfg = {
  AI_SDK_PROXY_BASE_URL: '',
  PROXY_BASE_URL: '',
  USE_LEGACY_PROXY: false,
  DEFAULT_PROVIDER: 'google',
  DEFAULT_MODEL: 'gemini-2.0-flash',
};

// Provide dynamic mocks per import
function setupModuleMocks() {
  vi.doMock('./gemini', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: function GeminiProvider(_apiKey: string) {
      created.gemini += 1;
      return { generate: vi.fn(), generateStream: vi.fn() };
    },
  }));
  vi.doMock('./proxyV2', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: function ProxyV2(_opts: { baseUrl: string }) {
      created.v2 += 1;
      return { generate: vi.fn(), generateStream: vi.fn() };
    },
  }));
  vi.doMock('./proxy', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: function ProxyLegacy(_opts: { baseUrl: string }) {
      created.legacy += 1;
      return { generate: vi.fn(), generateStream: vi.fn() };
    },
  }));
  vi.doMock('@/hooks/useLocalStorage', async () => {
    const actual =
      await vi.importActual<typeof import('@/hooks/useLocalStorage')>('@/hooks/useLocalStorage');
    return {
      ...actual,
      useLocalStorage: (key: string, initial: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        if (key === 'GEMINI_API_KEY') return [mockKey, (_v: unknown) => {}] as const;
        return [initial, () => {}] as const;
      },
    };
  });
  vi.doMock('@/constants/config', () => ({
    AI_CONFIG: {
      PROXY_BASE_URL: cfg.PROXY_BASE_URL,
      AI_SDK_PROXY_BASE_URL: cfg.AI_SDK_PROXY_BASE_URL,
      USE_LEGACY_PROXY: cfg.USE_LEGACY_PROXY,
      DEFAULT_PROVIDER: cfg.DEFAULT_PROVIDER,
      DEFAULT_MODEL: cfg.DEFAULT_MODEL,
    },
  }));
}

async function loadUseAI() {
  setupModuleMocks();
  const mod = await import('./index');
  return mod.useAIProvider;
}

describe('useAIProvider selection', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    created = { gemini: 0, v2: 0, legacy: 0 };
    cfg = {
      AI_SDK_PROXY_BASE_URL: '',
      PROXY_BASE_URL: '',
      USE_LEGACY_PROXY: false,
      DEFAULT_PROVIDER: 'google',
      DEFAULT_MODEL: 'gemini-2.0-flash',
    };
    mockKey = '';
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('prefers AI SDK proxy (V2) when available and not forcing legacy', async () => {
    cfg.AI_SDK_PROXY_BASE_URL = '/api/ai-sdk';
    cfg.USE_LEGACY_PROXY = false;
    const useAI = await loadUseAI();
    const ai = useAI('gemini');
    expect(ai.ready).toBe(true);
    expect(created.v2).toBe(1);
    expect(created.legacy).toBe(0);
    expect(created.gemini).toBe(0);
  });

  it('uses legacy proxy when flag is true and legacy base is set', async () => {
    cfg.USE_LEGACY_PROXY = true;
    cfg.PROXY_BASE_URL = '/api/ai';
    const useAI = await loadUseAI();
    const ai = useAI('gemini');
    expect(ai.ready).toBe(true);
    expect(created.v2).toBe(0);
    expect(created.legacy).toBe(1);
    expect(created.gemini).toBe(0);
  });

  it('falls back to direct Gemini when no proxy and API key exists', async () => {
    mockKey = 'local-key';
    const useAI = await loadUseAI();
    const ai = useAI('gemini');
    expect(ai.ready).toBe(true);
    expect(created.v2).toBe(0);
    expect(created.legacy).toBe(0);
    expect(created.gemini).toBe(1);
  });

  it('not ready when no proxy and no API key', async () => {
    const useAI = await loadUseAI();
    const ai = useAI('gemini');
    expect(ai.ready).toBe(false);
    expect(created.v2 + created.legacy + created.gemini).toBe(0);
  });
});

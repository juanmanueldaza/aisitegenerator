import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { ProxyAIProviderV2 } from './proxyV2';
import type { AIMessage, ProviderOptions } from '@/types/ai';

function encode(str: string) {
  return new TextEncoder().encode(str);
}

function makeJSONResponse(data: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? 200;
  return {
    ok,
    status,
    async json() {
      return data;
    },
    async text() {
      return JSON.stringify(data);
    },
  } as Response as unknown as {
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
    text: () => Promise<string>;
  };
}

function makeErrorResponse(message: string, status = 500) {
  return {
    ok: false,
    status,
    async text() {
      return message;
    },
  } as Response as unknown as {
    ok: boolean;
    status: number;
    text: () => Promise<string>;
  };
}

function makeStreamResponse(chunks: Array<string | Uint8Array>) {
  // Transform string chunks to Uint8Array
  const bytes = chunks.map((c) => (typeof c === 'string' ? encode(c) : c));
  let i = 0;
  return {
    ok: true,
    status: 200,
    body: {
      getReader() {
        return {
          async read(): Promise<ReadableStreamReadResult<Uint8Array>> {
            if (i >= bytes.length)
              return { value: undefined, done: true } as ReadableStreamReadResult<Uint8Array>;
            const value = bytes[i++];
            return { value, done: false } as ReadableStreamReadResult<Uint8Array>;
          },
        };
      },
    },
  } as unknown as Response;
}

describe('ProxyAIProviderV2', () => {
  const baseUrl = '/api/ai-sdk';
  let provider: ProxyAIProviderV2;
  let fetchMock: Mock;

  beforeEach(() => {
    provider = new ProxyAIProviderV2({ baseUrl, timeoutMs: 5000 });
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('generate returns parsed JSON on success', async () => {
    const resp = { text: 'ok', finishReason: 'stop' };
    fetchMock.mockResolvedValue(makeJSONResponse(resp) as unknown as Response);
    const messages: AIMessage[] = [{ role: 'user', content: 'hi' }];
    const res = await provider.generate(messages);
    expect(res).toEqual(resp);
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/generate`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('generate throws error with status when non-ok', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse('boom', 500) as unknown as Response);
    const messages: AIMessage[] = [{ role: 'user', content: 'hi' }];
    await expect(provider.generate(messages)).rejects.toMatchObject({
      message: 'boom',
      status: 500,
    });
  });

  it('generateStream yields lines split by newlines across chunk boundaries and flushes trailing buffer', async () => {
    // Chunks: partial line, rest + newline, final line without newline
    const chunks = ['Hello, ', 'world!\nThis is a', ' test.\nLast line without newline'];
    fetchMock.mockResolvedValue(makeStreamResponse(chunks) as unknown as Response);
    const messages: AIMessage[] = [{ role: 'user', content: 'go' }];
    const out: string[] = [];
    for await (const c of provider.generateStream(messages)) {
      out.push(c.text);
    }
    expect(out).toEqual(['Hello, world!', 'This is a test.', 'Last line without newline']);
  });

  it('generateStream retries on 500 once then succeeds; onRetry callback invoked', async () => {
    const onRetry = vi.fn();
    const opts: ProviderOptions = { onRetry };

    // First call fails 500, second returns a simple one-line stream
    fetchMock
      .mockResolvedValueOnce(makeErrorResponse('server down', 500) as unknown as Response)
      .mockResolvedValueOnce(makeStreamResponse(['ok line\n']) as unknown as Response);

    const messages: AIMessage[] = [{ role: 'user', content: 'retry please' }];
    const chunks: string[] = [];
    for await (const ch of provider.generateStream(messages, opts)) {
      chunks.push(ch.text);
    }
    expect(chunks).toEqual(['ok line']);
    expect(onRetry).toHaveBeenCalled();
    expect(fetchMock.mock.calls.length).toBe(2);
  });
});

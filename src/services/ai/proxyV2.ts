import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { alog, makeRequestId, mask } from '@/utils/debug';
import { withRetry } from './retry';

export interface ProxyV2Options {
  baseUrl: string; // e.g., /api/ai-sdk
  timeoutMs?: number;
  getHeaders?: () => Record<string, string> | undefined;
}

export class ProxyAIProviderV2 {
  private baseUrl: string;
  private timeoutMs: number;
  private getHeaders?: () => Record<string, string> | undefined;

  constructor(opts: ProxyV2Options) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.timeoutMs = opts.timeoutMs ?? 30000;
    this.getHeaders = opts.getHeaders;
  }

  async generate(messages: AIMessage[], options: ProviderOptions = {}): Promise<GenerateResult> {
    const reqId = makeRequestId('aisdk');
    const started = Date.now();
    const headers = {
      'Content-Type': 'application/json',
      ...(this.getHeaders?.() || {}),
    } as Record<string, string>;
    // Redact any obvious keys for logs
    const redactedHeaders = Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k, /key/i.test(k) ? mask(String(v)) : v])
    );
    alog('proxyV2.generate:request', {
      reqId,
      url: `${this.baseUrl}/generate`,
      headers: redactedHeaders,
      options: {
        provider: options.provider || '(client-default)',
        model: options.model || '(server-default)',
        temperature: options.temperature,
      },
      lastMsgLen: messages[messages.length - 1]?.content?.length || 0,
      count: messages.length,
    });
    return withRetry(
      async () => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
          const res = await fetch(`${this.baseUrl}/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ messages, options }),
            signal: controller.signal,
          });
          if (!res.ok) {
            const text = await res.text();
            const err = Object.assign(new Error(text || `Proxy error ${res.status}`), {
              status: res.status,
            });
            alog('proxyV2.generate:response_error', {
              reqId,
              status: res.status,
              body: (text || '').slice(0, 500),
              ms: Date.now() - started,
            });
            throw err;
          }
          const json = (await res.json()) as GenerateResult;
          alog('proxyV2.generate:response_ok', {
            reqId,
            ms: Date.now() - started,
            finishReason: json.finishReason as unknown,
            textLen: json.text ? json.text.length : 0,
          });
          return json;
        } finally {
          clearTimeout(id);
        }
      },
      { onRetry: options.onRetry }
    );
  }

  async *generateStream(
    messages: AIMessage[],
    options: ProviderOptions = {}
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const url = `${this.baseUrl}/stream`;
    const reqId = makeRequestId('aisdk');
    const started = Date.now();
    const headers = {
      'Content-Type': 'application/json',
      ...(this.getHeaders?.() || {}),
    } as Record<string, string>;
    console.log(
      '[AI] proxyV2 headers:',
      Object.keys(headers),
      headers['X-GOOGLE-API-KEY'] ? 'has X-GOOGLE-API-KEY' : 'no X-GOOGLE-API-KEY'
    );
    const redactedHeaders = Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k, /key/i.test(k) ? mask(String(v)) : v])
    );
    alog('proxyV2.stream:request', {
      reqId,
      url,
      headers: redactedHeaders,
      options: {
        provider: options.provider || '(client-default)',
        model: options.model || '(server-default)',
        temperature: options.temperature,
      },
      lastMsgLen: messages[messages.length - 1]?.content?.length || 0,
      count: messages.length,
    });
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await withRetry(
        async () => {
          const r = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ messages, options }),
            signal: controller.signal,
          });
          if (!r.ok) {
            const text = await r.text();
            const err = Object.assign(new Error(text || `Proxy error ${r.status}`), {
              status: r.status,
            });
            alog('proxyV2.stream:response_error', {
              reqId,
              status: r.status,
              body: (text || '').slice(0, 500),
            });
            throw err;
          }
          return r;
        },
        { onRetry: options.onRetry }
      );

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let emitted = 0;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line) yield { text: line };
            if (line) emitted += line.length;
          }
        }
      }
      if (buffer) yield { text: buffer };
      if (buffer) emitted += buffer.length;
      alog('proxyV2.stream:complete', { reqId, ms: Date.now() - started, emitted });
    } finally {
      clearTimeout(id);
      controller.abort();
    }
  }
}

export default ProxyAIProviderV2;

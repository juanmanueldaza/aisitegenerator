import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { withRetry } from './retry';

export interface ProxyOptions {
  baseUrl: string; // e.g., /api/ai
  timeoutMs?: number;
}

export class ProxyAIProvider {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(opts: ProxyOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.timeoutMs = opts.timeoutMs ?? 30000;
  }

  async generate(messages: AIMessage[], options: ProviderOptions = {}): Promise<GenerateResult> {
    return withRetry(
      async () => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
          const res = await fetch(`${this.baseUrl}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, options }),
            signal: controller.signal,
          });
          if (!res.ok) {
            const text = await res.text();
            const err = Object.assign(new Error(text || `Proxy error ${res.status}`), {
              status: res.status,
            });
            throw err;
          }
          return (await res.json()) as GenerateResult;
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
    // Streaming via Fetch ReadableStream; assumes server sends text/event-stream or chunked JSON
    const url = `${this.baseUrl}/stream`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await withRetry(
        async () => {
          const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, options }),
            signal: controller.signal,
          });
          if (!r.ok) {
            const text = await r.text();
            const err = Object.assign(new Error(text || `Proxy error ${r.status}`), {
              status: r.status,
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
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const text = decoder.decode(value, { stream: true });
          // naive line-split; server should send newline-delimited chunks
          const parts = text.split(/\r?\n/).filter(Boolean);
          for (const p of parts) {
            yield { text: p };
          }
        }
      }
    } finally {
      clearTimeout(id);
      controller.abort();
    }
  }
}

export default ProxyAIProvider;

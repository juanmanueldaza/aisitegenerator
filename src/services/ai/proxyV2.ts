import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { withRetry } from './retry';

export interface ProxyV2Options {
  baseUrl: string; // e.g., /api/ai-sdk
  timeoutMs?: number;
}

export class ProxyAIProviderV2 {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(opts: ProxyV2Options) {
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
      let buffer = '';
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
          }
        }
      }
      if (buffer) yield { text: buffer };
    } finally {
      clearTimeout(id);
      controller.abort();
    }
  }
}

export default ProxyAIProviderV2;

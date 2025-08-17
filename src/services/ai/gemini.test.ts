import { describe, it, expect, vi } from 'vitest';
import { GeminiProvider } from './gemini';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  class GoogleGenerativeAI {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_apiKey: string) {}
    getGenerativeModel() {
      return {
        generateContent: async () => ({
          response: { text: () => 'Hello from Gemini' },
        }),
        startChat: () => ({
          sendMessage: async () => ({ response: { text: () => 'Hello from Gemini' } }),
          sendMessageStream: async () => ({
            stream: (async function* () {
              yield { text: () => 'Hello ' } as const;
              yield { text: () => 'World' } as const;
            })(),
          }),
        }),
      };
    }
  }
  return { GoogleGenerativeAI };
});

describe('GeminiProvider', () => {
  it('generate returns text', async () => {
    const provider = new GeminiProvider('test-key');
    const res = await provider.generate(
      [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
        { role: 'user', content: 'help me' },
      ],
      { model: 'gemini-2.5-flash', temperature: 0.1 }
    );
    expect(res.text).toBe('Hello from Gemini');
  });

  it('generateStream yields chunks in order', async () => {
    const provider = new GeminiProvider('test-key');
    const chunks: string[] = [];
    for await (const c of provider.generateStream([{ role: 'user', content: 'stream please' }])) {
      chunks.push(c.text);
    }
    expect(chunks.join('')).toBe('Hello World');
  });
});

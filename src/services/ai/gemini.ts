import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk, AIError } from '@/types/ai';
import { withRetry } from './retry';

// Lazy import to avoid bundling when unused
async function getClient(apiKey: string) {
  const mod = await import('@google/generative-ai');
  const { GoogleGenerativeAI } = mod as typeof import('@google/generative-ai');
  return new GoogleGenerativeAI(apiKey);
}

function toHistory(messages: AIMessage[]) {
  // Gemini requires chat history to start with a 'user' role.
  const firstUserIdx = messages.findIndex((m) => m.role === 'user');
  const trimmed = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : [];
  return trimmed
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

export class GeminiProvider {
  private apiKey: string;
  constructor(apiKey: string) {
    if (!apiKey) throw new Error('Missing Gemini API key');
    this.apiKey = apiKey;
  }

  async generate(messages: AIMessage[], options: ProviderOptions = {}): Promise<GenerateResult> {
    const { model = 'gemini-2.5-flash', systemInstruction, thinkingBudgetTokens } = options;

    try {
      const attempt = async (modelName: string): Promise<GenerateResult> => {
        return withRetry(
          async () => {
            const client = await getClient(this.apiKey);
            const gen = await client.getGenerativeModel({
              model: modelName,
              systemInstruction,
              // thinking is experimental; guard just in case
              ...(thinkingBudgetTokens ? { thinking: { budgetTokens: thinkingBudgetTokens } } : {}),
            });

            const last = messages[messages.length - 1];
            const prompt = last?.content ?? '';
            const chat = gen.startChat({ history: toHistory(messages.slice(0, -1)) });
            const res = await chat.sendMessage(prompt);
            const text = res.response?.text?.() ?? '';
            return { text };
          },
          {
            maxAttempts: 3,
            onRetry: options.onRetry,
          }
        );
      };

      return await attempt(model);
    } catch (e) {
      const err = e as AIError;
      err.message = normalizeGeminiError(err);
      throw err;
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options: ProviderOptions = {}
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const { model = 'gemini-2.5-flash', systemInstruction, thinkingBudgetTokens } = options;

    try {
      // Helper to start a stream for a given model
      const startStream = async (modelName: string) => {
        // For streaming, we attempt to establish the stream with retry, but once streaming, errors break out
        return withRetry(
          async () => {
            const client = await getClient(this.apiKey);
            const gen = await client.getGenerativeModel({
              model: modelName,
              systemInstruction,
              ...(thinkingBudgetTokens ? { thinking: { budgetTokens: thinkingBudgetTokens } } : {}),
            });

            const last = messages[messages.length - 1];
            const prompt = last?.content ?? '';
            const chat = gen.startChat({ history: toHistory(messages.slice(0, -1)) });
            const stream = await chat.sendMessageStream(prompt);
            return stream;
          },
          { maxAttempts: 3, onRetry: options.onRetry }
        );
      };

      const result = await startStream(model);

      for await (const chunk of result.stream) {
        const partText = chunk.text();
        if (partText) {
          yield { text: partText };
        }
      }
    } catch (e) {
      const err = e as AIError;
      err.message = normalizeGeminiError(err);
      throw err;
    }
  }
}

function normalizeGeminiError(err: Partial<AIError>): string {
  const msg = err?.message || 'Unknown Gemini error';
  if (/400|invalid|bad request/i.test(msg))
    return 'Gemini: Bad request. Check model name and input format.';
  if (/401|unauthorized|api key/i.test(msg)) return 'Gemini: Unauthorized. Check your API key.';
  if (/429|rate|quota/i.test(msg))
    return 'Gemini: Rate limit or quota exceeded. Please retry later. We will auto-retry a few times.';
  if (/safety|blocked/i.test(msg)) return 'Gemini: Response blocked by safety filters.';
  return `Gemini error: ${msg}`;
}

export default GeminiProvider;

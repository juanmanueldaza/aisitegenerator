import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import GeminiProvider from './gemini';

export type ProviderName = 'gemini';

export function useAIProvider(name: ProviderName = 'gemini') {
  const [apiKey] = useLocalStorage<string>('GEMINI_API_KEY', '');

  if (name === 'gemini') {
    const provider = apiKey ? new GeminiProvider(apiKey) : null;
    return {
      ready: Boolean(provider),
      generate: (messages: AIMessage[], options?: ProviderOptions) => {
        if (!provider) throw new Error('Gemini API key not set');
        return provider.generate(messages, options);
      },
      generateStream: (messages: AIMessage[], options?: ProviderOptions) => {
        if (!provider) throw new Error('Gemini API key not set');
        return provider.generateStream(messages, options);
      },
    } as const;
  }

  throw new Error(`Unknown AI provider: ${name}`);
}

export type { AIMessage, ProviderOptions, GenerateResult, StreamChunk };

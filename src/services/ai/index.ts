import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import GeminiProvider from './gemini';
import ProxyAIProvider from './proxy';
import { AI_CONFIG } from '@/constants/config';

export type ProviderName = 'gemini';

export function useAIProvider(name: ProviderName = 'gemini') {
  const [apiKey] = useLocalStorage<string>('GEMINI_API_KEY', '');

  if (name === 'gemini') {
    // Prefer proxy when configured (production), else fallback to direct SDK using API key
    const useProxy = Boolean(AI_CONFIG.PROXY_BASE_URL);
    const provider = useProxy
      ? new ProxyAIProvider({ baseUrl: AI_CONFIG.PROXY_BASE_URL })
      : apiKey
        ? new GeminiProvider(apiKey)
        : null;
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

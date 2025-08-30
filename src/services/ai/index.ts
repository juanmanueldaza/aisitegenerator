import type { AIMessage, ProviderOptions, GenerateResult, StreamChunk } from '@/types/ai';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import GeminiProvider from './gemini';
import ProxyAIProvider from './proxy';
import ProxyAIProviderV2 from './proxyV2';
import { AI_CONFIG } from '@/constants/config';
import { alog, makeRequestId, mask } from '@/utils/debug';

export type ProviderName = 'gemini';

export function useAIProvider(name: ProviderName = 'gemini') {
  const [apiKey] = useLocalStorage<string>('GEMINI_API_KEY', '');
  console.log(
    '[AI] useAIProvider - apiKey from localStorage:',
    apiKey ? `"${apiKey.substring(0, 10)}..."` : 'empty'
  );

  if (name === 'gemini') {
    // Unification: Prefer AI SDK proxy (V2). If USE_LEGACY_PROXY flag is true, use legacy proxy.
    // Plus: If a proxy is present but misconfigured at runtime, transparently fall back to direct Gemini when a local key exists.
    const useLegacy = AI_CONFIG.USE_LEGACY_PROXY;
    const aiSdkBase = AI_CONFIG.AI_SDK_PROXY_BASE_URL;
    const legacyBase = AI_CONFIG.PROXY_BASE_URL;
    // Helper: detect proxy configuration/network errors that warrant local fallback
    const isProxyMisconfigError = (err: unknown) => {
      const e = err as { status?: number; message?: string } | undefined;
      const status = e?.status ?? 0;
      const msg = (e?.message || '').toLowerCase();
      // Only treat as misconfig when the proxy is unreachable or not mounted, not for valid 4xx
      if (status === 0) return true; // network/aborted
      if (status === 404) return true; // route not mounted
      if (status === 502 || status === 503 || status === 504) return true; // proxy/upstream down
      if (/not mounted|proxy not configured|fetch failed|network|ai sdk router/.test(msg))
        return true;
      // Treat server missing-key errors as misconfig so we can fall back to direct SDK when a local key exists
      if (status === 500 && /(missing\s+(google|gemini)|api\s*key)/i.test(msg)) return true;
      return false;
    };

    // A tiny wrapper that tries proxy first and falls back to direct Gemini on early failure
    type BasicProvider = {
      generate: (messages: AIMessage[], options?: ProviderOptions) => Promise<GenerateResult>;
      generateStream: (
        messages: AIMessage[],
        options?: ProviderOptions
      ) => AsyncGenerator<StreamChunk, void, unknown>;
    };
    const withFallback = (
      primary: BasicProvider | null,
      fallback: BasicProvider | null
    ): BasicProvider | null => {
      if (!primary) return fallback;
      if (!fallback) return primary;
      return {
        async generate(messages: AIMessage[], options?: ProviderOptions) {
          try {
            const reqId = makeRequestId('ai');
            alog('provider.generate:primary', {
              reqId,
              provider: options?.provider || '(default)',
              model: options?.model || '(server-default)',
              lastMsgLen: messages[messages.length - 1]?.content?.length || 0,
            });
            const res = await primary.generate(messages, options);
            alog('provider.generate:primary_ok', { reqId });
            return res;
          } catch (err) {
            if (isProxyMisconfigError(err)) {
              const reqId = makeRequestId('ai');
              alog('provider.generate:fallback', { reqId, reason: 'proxy_misconfig' });
              const res = await fallback.generate(messages, options);
              alog('provider.generate:fallback_ok', { reqId });
              return res;
            }
            throw err;
          }
        },
        async *generateStream(messages: AIMessage[], options?: ProviderOptions) {
          // Try primary streaming; if it fails before emitting, fall back to non-stream generate
          let emitted = false;
          try {
            const reqId = makeRequestId('ai');
            alog('provider.stream:primary', {
              reqId,
              provider: options?.provider || '(default)',
              model: options?.model || '(server-default)',
              lastMsgLen: messages[messages.length - 1]?.content?.length || 0,
            });
            const it = primary.generateStream(messages, options) as AsyncGenerator<StreamChunk>;
            for await (const ch of it) {
              emitted = true;
              yield ch;
            }
            alog('provider.stream:primary_complete', { reqId });
            return;
          } catch (err) {
            if (!emitted && isProxyMisconfigError(err)) {
              const reqId = makeRequestId('ai');
              alog('provider.stream:fallback', { reqId, reason: 'proxy_misconfig_no_emit' });
              const res = await fallback.generate(messages, options);
              if (res?.text) yield { text: res.text } as StreamChunk;
              alog('provider.stream:fallback_complete', { reqId });
              return;
            }
            throw err;
          }
        },
      } as const;
    };

    // Compose provider preference and fallback behavior
    const primary: BasicProvider | null =
      !useLegacy && aiSdkBase
        ? new ProxyAIProviderV2({
            baseUrl: aiSdkBase,
            getHeaders: () =>
              apiKey ? ({ 'X-GOOGLE-API-KEY': apiKey } as Record<string, string>) : undefined,
          })
        : legacyBase
          ? new ProxyAIProvider({ baseUrl: legacyBase })
          : null;
    const fallback: BasicProvider | null = apiKey ? new GeminiProvider(apiKey) : null;
    const provider = primary ? withFallback(primary, fallback) : fallback;
    alog('provider.init', {
      path:
        primary instanceof ProxyAIProviderV2
          ? 'ai-sdk-proxy'
          : primary instanceof ProxyAIProvider
            ? 'legacy-proxy'
            : 'direct-sdk',
      hasApiKey: Boolean(apiKey),
      apiKeyPreview: apiKey ? mask(apiKey) : undefined,
      aiSdkBase,
      legacyBase,
      useLegacy,
    });
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

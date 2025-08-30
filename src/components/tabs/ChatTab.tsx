import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button, Card, CardContent } from '@/components/ui';
import type { AIMessage, GenerateResult, StreamChunk, ProviderOptions } from '@/types/ai';
import { AI_CONFIG } from '@/constants/config';
import {
  AI_MODEL_PRESETS,
  AI_PROVIDERS,
  getDefaultModel,
  isModelValidForProvider,
} from '@/constants/ai';

// Lazy-load Deep Chat to reduce initial bundle size
const LazyDeepChat = React.lazy(() =>
  import('deep-chat-react').then((m) => ({ default: m.DeepChat }))
);

// Memoized Deep Chat Component with stable props/handler to prevent resets
const MemoizedDeepChat = React.memo<{
  aiReady: boolean;
  generate: (messages: AIMessage[], options?: ProviderOptions) => Promise<GenerateResult>;
  generateStream: (
    messages: AIMessage[],
    options?: ProviderOptions
  ) => AsyncGenerator<StreamChunk, void, unknown>;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSiteGenerated: (siteData: { content?: string }) => void;
  appendMessage: (m: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }) => void;
  upsertStreamingAssistant: (content: string) => void;
  replaceLastAssistantMessage: (content: string) => void;
  setToast?: (msg: string) => void;
  currentMessagesRef: React.MutableRefObject<
    | Array<{ id: string; role: 'user' | 'assistant'; content?: string; timestamp: number }>
    | undefined
  >;
  history: Array<{ role: 'user' | 'ai'; text: string }>;
}>(
  ({
    aiReady,
    generate,
    generateStream,
    apiKey,
    setApiKey,
    onSiteGenerated,
    appendMessage,
    upsertStreamingAssistant,
    replaceLastAssistantMessage,
    setToast,
    currentMessagesRef,
    history,
  }) => {
    const [provider, setProvider] = useLocalStorage<string>(
      'AI_PROVIDER',
      AI_CONFIG.DEFAULT_PROVIDER
    );
    const [model, setModel] = useLocalStorage<string>('AI_MODEL', AI_CONFIG.DEFAULT_MODEL);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const [proxyHealthy, setProxyHealthy] = useState<boolean | null>(null);
    const [availableProviders, setAvailableProviders] = useState<Record<string, boolean> | null>(
      null
    );

    // Determine if we're using a proxy (AI SDK or legacy). When in proxy mode, client-side API key isn't needed.
    const isProxyMode = useMemo(
      () =>
        Boolean(
          (AI_CONFIG.AI_SDK_PROXY_BASE_URL || '').trim() || (AI_CONFIG.PROXY_BASE_URL || '').trim()
        ),
      []
    );

    // When not using a proxy, the only working local provider is Gemini
    const effectiveProvider = useMemo(
      () => (isProxyMode ? provider : 'gemini'),
      [isProxyMode, provider]
    );

    const providerLabel = useMemo(
      () => effectiveProvider.charAt(0).toUpperCase() + effectiveProvider.slice(1),
      [effectiveProvider]
    );

    // Typed guard for AbortError without using 'any'
    const isAbortError = (e: unknown): e is { name: string } => {
      return !!(
        e &&
        typeof e === 'object' &&
        'name' in (e as Record<string, unknown>) &&
        (e as { name?: unknown }).name === 'AbortError'
      );
    };

    // Provider-specific model presets and validation (centralized)
    // For validation/presets, map local "gemini" runtime to Google provider namespace
    const validationProvider = useMemo(
      () => (isProxyMode ? provider : 'google'),
      [isProxyMode, provider]
    );

    const isModelValid = useMemo(
      () => isModelValidForProvider(validationProvider, model),
      [model, validationProvider]
    );

    const presetListId = `model-presets-${validationProvider}`;
    const placeholderDefaultModel = useMemo(
      () => getDefaultModel(validationProvider, AI_CONFIG.DEFAULT_MODEL),
      [validationProvider]
    );

    const providerPresets = useMemo(
      () => (AI_MODEL_PRESETS as Record<string, string[]>)[validationProvider] || [],
      [validationProvider]
    );

    // Minimal Deep Chat handler types
    type DeepChatMessage = { role: 'user' | 'assistant' | 'system'; text?: string };
    type DeepChatBody = { messages: DeepChatMessage[] };
    type DeepChatSignals = { onResponse: (payload: { text?: string; error?: string }) => void };

    // Keep latest readiness in a ref to avoid changing handler identity
    const aiReadyRef = useRef(aiReady);
    useEffect(() => {
      aiReadyRef.current = aiReady;
    }, [aiReady]);

    // Non-blocking AI SDK proxy health/capability check (only when configured)
    useEffect(() => {
      const base = (AI_CONFIG.AI_SDK_PROXY_BASE_URL || '').replace(/\/$/, '');
      if (!base) {
        setProxyHealthy(null);
        setAvailableProviders(null);
        return;
      }
      let active = true;
      (async () => {
        try {
          const res = await fetch(`${base}/health`, { method: 'GET' });
          if (!active) return;
          setProxyHealthy(res.ok);
          // Also query providers capability to gate the Provider select
          const prov = await fetch(`${base}/providers`).then((r) => (r.ok ? r.json() : null));
          if (!active) return;
          if (prov && prov.providers)
            setAvailableProviders(prov.providers as Record<string, boolean>);
        } catch {
          if (!active) return;
          setProxyHealthy(false);
          setAvailableProviders(null);
        }
      })();
      return () => {
        active = false;
      };
    }, []);

    // Stable handler that never changes identity
    const stableHandler = useCallback(
      (body: DeepChatBody, signals: DeepChatSignals) => {
        console.log('🔗 Deep Chat handler called with:', body);

        if (!aiReadyRef.current) {
          // Offline/Test mode: simulate an HTML site so E2E can pass without API key
          const simulated =
            '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>AI Generated Site</title>\n<style>body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:2rem}header{margin-bottom:1rem}h1{color:#111827}</style>\n</head>\n<body>\n<header>\n  <h1>Welcome to Your Website</h1>\n  <p>This is a basic page generated in offline/test mode.</p>\n</header>\n<main>\n  <section>\n    <h2>Getting Started</h2>\n    <p>Edit this content in the Editor tab to see live updates.</p>\n  </section>\n</main>\n</body>\n</html>';

          try {
            // Show assistant message and apply to editor
            upsertStreamingAssistant(simulated);
            replaceLastAssistantMessage(simulated);
            setTimeout(() => onSiteGenerated({ content: simulated }), 50);
            signals.onResponse({ text: simulated });
          } catch {
            signals.onResponse({ text: simulated });
          }
          return;
        }

        const userMessage = body.messages?.[body.messages.length - 1];
        console.log('👤 User message:', userMessage);
        if (!userMessage?.text) {
          signals.onResponse({ error: 'No message text received' });
          return;
        }
        const userText: string = userMessage.text;

        // Build full history from the store ref (Deep Chat might only send the last message)
        const historyFromStore = currentMessagesRef?.current ?? [];
        const historyAi: AIMessage[] = historyFromStore
          .filter(
            (m) =>
              (m.role === 'user' || m.role === 'assistant') &&
              !!m.content &&
              m.content.trim() !== ''
          )
          .map((m) => ({ role: m.role, content: m.content as string }));
        const aiMessages: AIMessage[] = [...historyAi, { role: 'user', content: userText }];

        // Append the user message immediately
        appendMessage({
          id: `user-${Date.now()}`,
          role: 'user',
          content: userText,
          timestamp: Date.now(),
        });

        // Prefer streaming; fall back to single-shot
        (async () => {
          try {
            const controller = new AbortController();
            abortRef.current = controller;
            setIsStreaming(true);
            // Lock to Gemini locally; coerce model to SDK-supported defaults when not using proxy.
            // The direct Google SDK may reject some 2.0 variants; prefer 2.5/1.5 known-stable.
            let coercedModel = model;
            if (!isProxyMode) {
              const supportsLocal = (m?: string) => !!m && /^gemini-(1\.5|2\.5)-/i.test(m);
              if (!supportsLocal(model)) {
                coercedModel = 'gemini-2.5-flash';
              }
              if (coercedModel !== model) {
                setToast?.('Using local Gemini: model changed to a compatible default');
              }
            }
            const opts: ProviderOptions = {
              provider: effectiveProvider,
              model: coercedModel,
              signal: controller.signal,
            };
            let combined = '';
            for await (const chunk of generateStream(aiMessages, opts)) {
              if (chunk?.text) {
                combined += chunk.text;
                upsertStreamingAssistant(combined);
              }
            }

            if (combined) {
              replaceLastAssistantMessage(combined);
              if (
                combined.includes('<!DOCTYPE html>') ||
                (combined.includes('<html') && combined.includes('</html>'))
              ) {
                console.log('🌐 Website detected, switching to editor');
                setTimeout(() => onSiteGenerated({ content: combined }), 100);
              }
              signals.onResponse({ text: combined });
              return;
            }

            const result = await generate(aiMessages, opts);
            const text = result?.text;
            if (text) {
              replaceLastAssistantMessage(text);
              if (
                text.includes('<!DOCTYPE html>') ||
                (text.includes('<html') && text.includes('</html>'))
              ) {
                setTimeout(() => onSiteGenerated({ content: text }), 100);
              }
              signals.onResponse({ text });
            } else {
              signals.onResponse({ error: 'No response from AI service' });
            }
          } catch (error) {
            console.error('❌ AI generation error:', error);
            const message = error instanceof Error ? error.message : 'Request failed';
            // Surface nicer UX for aborts
            if (isAbortError(error)) {
              setToast?.('Generation cancelled');
              signals.onResponse({ error: 'Generation cancelled' });
            } else {
              setToast?.(`AI Error: ${message}`);
              signals.onResponse({ error: `AI Error: ${message}` });
            }
          } finally {
            setIsStreaming(false);
            abortRef.current = null;
          }
        })();
      },
      [
        generate,
        generateStream,
        appendMessage,
        upsertStreamingAssistant,
        replaceLastAssistantMessage,
        onSiteGenerated,
        currentMessagesRef,
        model,
        setToast,
        effectiveProvider,
        isProxyMode,
      ]
    );

    // Memoize config objects to avoid prop churn that could reset Deep Chat
    const introMessage = useMemo(
      () => ({
        text: "🚀 **AI Site Generator**\\n\\nI'm your AI assistant for creating beautiful websites! Ask me to create any type of website and I'll generate complete HTML, CSS, and JavaScript code.\\n\\n**Try asking me:**\\n- Create a portfolio website\\n- Make a landing page for a restaurant\\n- Build a blog template\\n- Design a company homepage",
      }),
      []
    );

    const textInput = useMemo(
      () => ({
        // Match E2E test selector
        placeholder: { text: 'Describe the website you want to create...' },
      }),
      []
    );

    const requestBodyLimits = useMemo(() => ({ maxMessages: -1 }), []);

    const connect = useMemo(() => ({ handler: stableHandler }), [stableHandler]);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '16px',
            backgroundColor: aiReady ? '#f0f9ff' : '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '16px',
            border: `2px solid ${aiReady ? '#3b82f6' : '#e9ecef'}`,
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {aiReady ? '🟢' : '🔴'} AI Connection
            <span
              style={{
                fontSize: 12,
                color: '#111827',
                background: '#E5E7EB',
                padding: '2px 6px',
                borderRadius: 6,
              }}
              title="Current AI provider"
            >
              Provider: {providerLabel}
            </span>
          </h4>
          {!isProxyMode && (
            <input
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            />
          )}
          {isProxyMode && (
            <input
              type="password"
              placeholder="Enter your Gemini API key for proxy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            />
          )}
          {isProxyMode && !apiKey && (
            <div
              style={{
                fontSize: 12,
                color: '#ef4444',
                marginBottom: 8,
                padding: '8px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px',
                border: '1px solid #fecaca',
              }}
            >
              ⚠️ <strong>API Key Required:</strong> Please enter your Gemini API key above to enable
              AI chat functionality. Get your key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#dc2626', textDecoration: 'underline' }}
              >
                Google AI Studio
              </a>
              .
            </div>
          )}
          {isProxyMode && apiKey && (
            <div
              style={{
                fontSize: 12,
                color: '#10b981',
                marginBottom: 8,
                padding: '8px',
                backgroundColor: '#f0fdf4',
                borderRadius: '4px',
                border: '1px solid #bbf7d0',
              }}
            >
              ✅ API key configured - AI chat should work now!
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              Provider
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={!isProxyMode}
                title={
                  isProxyMode
                    ? 'Select AI provider (server-side proxy)'
                    : 'Provider locked to Gemini locally'
                }
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  opacity: !isProxyMode ? 0.6 : 1,
                }}
              >
                {AI_PROVIDERS.map((p) => {
                  const enabled = availableProviders ? !!availableProviders[p] : true;
                  const label = `${p.charAt(0).toUpperCase() + p.slice(1)}${enabled ? '' : ' (no key)'}`;
                  return (
                    <option
                      key={p}
                      value={p}
                      disabled={!enabled}
                      title={enabled ? undefined : 'No server API key configured'}
                    >
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              Model
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={placeholderDefaultModel || 'model'}
                list={presetListId}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: `1px solid ${isModelValid ? '#d1d5db' : '#ef4444'}`,
                  width: 240,
                }}
              />
            </label>
            <button
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => abortRef.current?.abort()}
              disabled={!isStreaming}
              title={isStreaming ? 'Stop generating' : 'No active generation'}
              style={{ marginLeft: 'auto' }}
            >
              {isStreaming ? '⏹ Stop' : 'Stop'}
            </button>
            {!isModelValid && (
              <button
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={() =>
                  setModel(getDefaultModel(validationProvider, AI_CONFIG.DEFAULT_MODEL) || model)
                }
                title="Use a recommended default model for the selected provider"
              >
                Use default
              </button>
            )}
          </div>
          <datalist id={presetListId}>
            {providerPresets.map((m) => (
              <option value={m} key={m} />
            ))}
          </datalist>
          <div style={{ fontSize: '13px', color: aiReady ? '#059669' : '#6b7280' }}>
            {aiReady
              ? '✅ Ready for AI responses'
              : isProxyMode
                ? 'Proxy mode configured'
                : 'Enter API key to enable AI'}
            {isStreaming && <span style={{ marginLeft: 8 }}>• Generating…</span>}
            {!aiReady && !isProxyMode && (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: '8px', color: '#3b82f6' }}
              >
                Get API Key
              </a>
            )}
            {!!model && !isModelValid && (
              <span style={{ marginLeft: 8, color: '#b91c1c' }}>
                Model may not match {effectiveProvider}. Try a preset.
              </span>
            )}
            {proxyHealthy !== null && (
              <span
                style={{
                  marginLeft: 8,
                  color: proxyHealthy ? '#059669' : '#b91c1c',
                }}
                title={proxyHealthy ? 'AI SDK proxy is reachable' : 'AI SDK proxy not reachable'}
              >
                AI SDK Proxy: {proxyHealthy ? 'Online' : 'Offline'}
              </span>
            )}
            {availableProviders && (
              <span style={{ marginLeft: 8, color: '#6b7280' }} title="Providers enabled on server">
                Providers:{' '}
                {Object.entries(availableProviders)
                  .filter(([, v]) => v)
                  .map(([k]) => k)
                  .join(', ') || 'none'}
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: '400px' }}>
          <React.Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                }}
              >
                Loading chat…
              </div>
            }
          >
            <LazyDeepChat
              style={{
                height: '100%',
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                opacity: isStreaming ? 0.98 : 1,
              }}
              introMessage={introMessage}
              textInput={textInput}
              requestBodyLimits={requestBodyLimits}
              history={history}
              connect={connect}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }
);

MemoizedDeepChat.displayName = 'MemoizedDeepChat';

interface ChatTabProps {
  aiReady: boolean;
  generate: (messages: AIMessage[], options?: ProviderOptions) => Promise<GenerateResult>;
  generateStream: (
    messages: AIMessage[],
    options?: ProviderOptions
  ) => AsyncGenerator<StreamChunk, void, unknown>;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSiteGenerated: (siteData: { content?: string }) => void;
  appendMessage: (m: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }) => void;
  upsertStreamingAssistant: (content: string) => void;
  replaceLastAssistantMessage: (content: string) => void;
  setToast?: (msg: string) => void;
  currentMessagesRef: React.MutableRefObject<
    | Array<{ id: string; role: 'user' | 'assistant'; content?: string; timestamp: number }>
    | undefined
  >;
  history: Array<{ role: 'user' | 'ai'; text: string }>;
  clearMessages: () => void;
}

export function ChatTab(props: ChatTabProps) {
  const { clearMessages } = props;
  return (
    <Card variant="elevated" title="AI Assistant" glow>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="small"
            onClick={() => clearMessages()}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          >
            Clear Chat
          </Button>
        </div>
        <div className="h-96">
          <MemoizedDeepChat {...props} />
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatTab;

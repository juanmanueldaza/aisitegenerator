/**
 * Deep Chat Interface Component - Complete Replacement for ChatInterface.tsx
 * Provides interactive chat functionality for website generation using Deep Chat React
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAIProvider } from '@/services/ai';
import { Toast } from '@/components/ui';
import type { AIMessage, ProviderOptions } from '@/types/ai';
import { useSiteStore } from '@/store/siteStore';
import { AI_CONFIG } from '@/constants/config';

interface DeepChatInterfaceProps {
  onSiteGenerated?: (siteData: { content?: string }) => void;
  className?: string;
}

const DeepChatInterface: React.FC<DeepChatInterfaceProps> = ({
  onSiteGenerated,
  className = '',
}) => {
  const store = useSiteStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage<string>('GEMINI_API_KEY', '');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [provider, setProvider] = useState<string>('google');
  const ai = useAIProvider('gemini');
  const [toast, setToast] = useState<string>('');
  const [autoApply, setAutoApply] = useLocalStorage<boolean>('CHAT_AUTO_APPLY', true);
  const [preferMarkdown, setPreferMarkdown] = useLocalStorage<boolean>('CHAT_PREFER_MD', false);
  const [lastApplied, setLastApplied] = useLocalStorage<string>('CHAT_LAST_APPLIED', '');
  const [lastCandidate, setLastCandidate] = useState<string>('');

  // Deep Chat specific state
  const [availableProviders, setAvailableProviders] = useState<Record<string, boolean> | null>(
    null
  );
  const [proxyHealthy, setProxyHealthy] = useState<boolean | null>(null);

  // Determine if we're using a proxy (AI SDK or legacy)
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

  // Provider-specific model presets and validation
  const validationProvider = useMemo(
    () => (isProxyMode ? provider : 'google'),
    [isProxyMode, provider]
  );
  const providerPresets = useMemo(
    () => AI_MODEL_PRESETS[validationProvider as keyof typeof AI_MODEL_PRESETS] || [],
    [validationProvider]
  );

  // Convert store messages to Deep Chat format
  const deepChatHistory = useMemo(() => {
    return store.messages.map((m) => ({
      role: m.role,
      text: m.content || '',
    }));
  }, [store.messages]);

  // Non-blocking AI SDK proxy health/capability check
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

  // Handle Deep Chat message sending
  const handleDeepChatMessage = useCallback(
    async (
      body: { messages: Array<{ role: string; content: string }> },
      signals: {
        onResponse: (response: {
          text: string;
          isFirst?: boolean;
          isLast?: boolean;
          error?: string;
        }) => void;
      }
    ) => {
      const messages = body.messages || [];
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage || !lastMessage.content) return;

      setIsLoading(true);

      try {
        // Convert Deep Chat messages to AI service format
        const aiMessages: AIMessage[] = messages.map((m: { role: string; content: string }) => ({
          role: (m.role === 'ai'
            ? 'assistant'
            : m.role === 'user'
              ? 'user'
              : 'system') as AIMessage['role'],
          content: m.content,
        }));

        // Use AI provider for streaming
        if (!ai.ready) {
          signals.onResponse?.({
            text: "I'm sorry, the AI service is not available. Please check your configuration.",
            error: 'AI service not ready',
          });
          return;
        }

        let accumulated = '';
        let isFirstChunk = true;

        // Lock to Gemini locally; coerce model to SDK-supported defaults when not using proxy
        let coercedModel = model;
        if (!isProxyMode) {
          const supportsLocal = (m?: string) => !!m && /^gemini-(1\.5|2\.5)-/i.test(m);
          if (!supportsLocal(model)) {
            coercedModel = 'gemini-2.5-flash';
            if (coercedModel !== model) {
              setToast('Using local Gemini: model changed to a compatible default');
            }
          }
        }

        const opts: ProviderOptions = {
          provider: effectiveProvider,
          model: coercedModel,
          systemInstruction:
            'You are a helpful assistant that generates website plans and code snippets when asked. Prefer concise, actionable responses.',
          temperature: 0.6,
        };

        for await (const chunk of ai.generateStream(aiMessages, opts)) {
          if (chunk?.text) {
            accumulated += chunk.text;

            // Send progressive updates to Deep Chat
            signals.onResponse?.({
              text: accumulated,
              isFirst: isFirstChunk,
              isLast: false,
            });

            if (isFirstChunk) {
              isFirstChunk = false;
            }
          }
        }

        // Final response
        signals.onResponse?.({
          text: accumulated,
          isLast: true,
        });

        // Try to auto-apply previewable content
        const picks = extractPreviewables(accumulated);
        const best = getBestPreviewable(picks);
        if (best) {
          setLastCandidate(best.body);
          if (autoApply && onSiteGenerated) {
            onSiteGenerated({ content: best.body });
            store.setContent(best.body);
            store.commit();
            setLastApplied(best.body);
            setToast('Applied AI code to editor');
          } else if (!autoApply) {
            setToast('AI code ready. Use "Use in Editor" or Re-apply.');
          }
        }

        // Store the conversation
        store.appendMessage({
          id: Date.now().toString(),
          role: 'user',
          content: lastMessage.content,
          timestamp: Date.now(),
        });

        store.appendMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: accumulated,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error in Deep Chat:', error);
        signals.onResponse?.({
          text: "I'm sorry, I encountered an error. Please try again.",
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }

      // Helper functions inside useCallback
      function extractPreviewables(
        text: string
      ): Array<{ kind: 'html' | 'markdown'; body: string; index: number }> {
        const out: Array<{ kind: 'html' | 'markdown'; body: string; index: number }> = [];
        try {
          const fenceRe = /```\s*([a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/g;
          let match: RegExpExecArray | null;
          let i = 0;
          while ((match = fenceRe.exec(text))) {
            const lang = (match[1] || '').toLowerCase();
            const code = (match[2] || '').trim();
            if (!code) continue;
            if (lang === 'html' || lang === 'htm' || lang === 'xhtml')
              out.push({ kind: 'html', body: code, index: i });
            if (lang === 'markdown' || lang === 'md')
              out.push({ kind: 'markdown', body: code, index: i });
            i += 1;
          }
          if (!out.length) {
            // Heuristic: looks like raw HTML without fences
            const looksHTML = /<!DOCTYPE|<html[\s>]|<body[\s>]|<div[\s>]/i.test(text);
            if (looksHTML) out.push({ kind: 'html', body: text, index: -1 });
          }
        } catch {
          // ignore
        }
        return out;
      }

      function getBestPreviewable(
        items: Array<{ kind: 'html' | 'markdown'; body: string; index: number }>
      ): { kind: 'html' | 'markdown'; body: string; index: number } | null {
        if (!items.length) return null;
        if (preferMarkdown) {
          const md = items.find((b) => b.kind === 'markdown');
          return md || items[0];
        }
        const html = items.find((b) => b.kind === 'html');
        return html || items[0];
      }
    },
    [
      ai,
      model,
      effectiveProvider,
      isProxyMode,
      autoApply,
      onSiteGenerated,
      store,
      preferMarkdown,
      setLastCandidate,
      setLastApplied,
      setToast,
    ]
  );

  // Handle reapply functionality
  const handleReapply = () => {
    const content = lastCandidate || lastApplied;
    if (!content) {
      setToast('Nothing to re-apply');
      return;
    }
    if (onSiteGenerated) onSiteGenerated({ content });
    store.setContent(content);
    store.commit();
    setLastApplied(content);
    setToast('Re-applied last AI code');
  };

  // Deep Chat configuration
  const deepChatConfig = useMemo(
    () => ({
      connect: {
        handler: handleDeepChatMessage,
      },
      chat: {
        history: deepChatHistory,
      },
      messages: {
        waitTime: 0,
        text: {
          maxChars: 10000,
        },
      },
      textInput: {
        placeholder: {
          text: 'Describe the website you want to create...',
        },
      },
    }),
    [handleDeepChatMessage, deepChatHistory]
  );

  return (
    <div className={`deep-chat-interface ${className}`}>
      {/* Header with controls */}
      <div
        className="chat-header"
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>AI Website Assistant</h2>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              background: ai.ready ? '#dcfce7' : '#fee2e2',
              color: ai.ready ? '#166534' : '#991b1b',
            }}
          >
            {ai.ready ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Provider Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Provider:</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={!isProxyMode}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                opacity: !isProxyMode ? 0.6 : 1,
              }}
              title={
                isProxyMode
                  ? 'Select AI provider (server-side proxy)'
                  : 'Provider locked to Gemini locally'
              }
            >
              {['google', 'openai', 'anthropic', 'cohere'].map((p) => {
                const enabled = availableProviders ? !!availableProviders[p] : true;
                const label = `${p.charAt(0).toUpperCase() + p.slice(1)}${enabled ? '' : ' (no key)'}`;
                return (
                  <option key={p} value={p} disabled={!enabled}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Model Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Model:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            >
              {providerPresets.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>

          {/* API Key Input */}
          {!isProxyMode && (
            <input
              type="password"
              placeholder="Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                width: '220px',
              }}
            />
          )}
          {isProxyMode && (
            <input
              type="password"
              placeholder="API Key for Proxy"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                width: '220px',
              }}
            />
          )}

          {/* Settings */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={autoApply}
                onChange={(e) => setAutoApply(e.target.checked)}
              />
              Auto-apply
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={preferMarkdown}
                onChange={(e) => setPreferMarkdown(e.target.checked)}
              />
              Prefer Markdown
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleReapply}
              disabled={!lastCandidate && !lastApplied}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: 'white',
                fontSize: '12px',
                cursor: !lastCandidate && !lastApplied ? 'not-allowed' : 'pointer',
                opacity: !lastCandidate && !lastApplied ? 0.5 : 1,
              }}
            >
              Re-apply
            </button>
          </div>
        </div>
      </div>

      {/* Deep Chat Component - Using React.lazy for dynamic import */}
      <div style={{ height: '600px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <React.Suspense
          fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading chat...</div>}
        >
          <LazyDeepChat
            style={{ height: '100%', borderRadius: '8px' }}
            connect={deepChatConfig.connect}
            textInput={{ placeholder: { text: 'Describe the website you want to create...' } }}
          />
        </React.Suspense>
      </div>

      {/* Status and Messages */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        {!ai.ready && (
          <div style={{ color: '#dc2626', marginBottom: '8px' }}>
            ⚠️ AI service not available. Please check your configuration.
          </div>
        )}

        {isProxyMode && proxyHealthy !== null && (
          <div style={{ marginBottom: '4px' }}>
            AI SDK Proxy: {proxyHealthy ? '🟢 Online' : '🔴 Offline'}
          </div>
        )}

        {availableProviders && (
          <div>
            Providers:{' '}
            {Object.entries(availableProviders)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(', ') || 'none'}
          </div>
        )}

        {isLoading && <div style={{ color: '#059669' }}>🤖 AI is generating response...</div>}
      </div>

      {/* Toast */}
      <Toast message={toast} visible={!!toast} />
    </div>
  );
};

// Lazy load Deep Chat to reduce initial bundle size
const LazyDeepChat = React.lazy(() =>
  import('deep-chat-react').then((m) => ({ default: m.DeepChat }))
);

// Model presets (should be imported from constants)
const AI_MODEL_PRESETS = {
  google: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-haiku'],
  cohere: ['command-r-plus', 'command-r'],
};

export default DeepChatInterface;

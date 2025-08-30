import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSiteStore } from '@/store/siteStore';
import { useAIProvider } from '@/services/ai';
import type { AIMessage, ProviderOptions } from '@/types/ai';
import { AI_CONFIG } from '@/constants/config';

// Lazy-load Deep Chat to reduce initial bundle size
const LazyDeepChat = React.lazy(() =>
  import('deep-chat-react').then((m) => ({ default: m.DeepChat }))
);

export function ChatTab() {
  const store = useSiteStore();
  const [apiKey, setApiKey] = useLocalStorage('GEMINI_API_KEY', '');
  const ai = useAIProvider('gemini');
  const abortRef = useRef<AbortController | null>(null);
  const [proxyHealthy, setProxyHealthy] = useState<boolean | null>(null);

  // Determine if we're using a proxy
  const isProxyMode = useMemo(
    () =>
      Boolean(
        (AI_CONFIG.AI_SDK_PROXY_BASE_URL || '').trim() || (AI_CONFIG.PROXY_BASE_URL || '').trim()
      ),
    []
  );

  const aiReady = useMemo(() => {
    if (isProxyMode) {
      return proxyHealthy !== false;
    }
    return !!apiKey && ai.ready;
  }, [isProxyMode, proxyHealthy, apiKey, ai.ready]);

  // Check proxy health
  useEffect(() => {
    const base = (AI_CONFIG.AI_SDK_PROXY_BASE_URL || '').replace(/\/$/, '');
    if (!base) {
      setProxyHealthy(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${base}/health`, { method: 'GET' });
        if (!active) return;
        setProxyHealthy(res.ok);
      } catch {
        if (!active) return;
        setProxyHealthy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Stable handler for Deep Chat
  const stableHandler = useCallback(
    (
      body: { messages?: Array<{ text?: string }> },
      signals: { onResponse: (payload: { text?: string; error?: string }) => void }
    ) => {
      console.log('🔗 Deep Chat handler called');

      if (!aiReady) {
        // Offline/Test mode: simulate an HTML site
        const simulated = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI Generated Site</title>
<style>body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:2rem}header{margin-bottom:1rem}h1{color:#111827}</style>
</head>
<body>
<header>
  <h1>Welcome to Your Website</h1>
  <p>This is a basic page generated in offline/test mode.</p>
</header>
<main>
  <section>
    <h2>Getting Started</h2>
    <p>Edit this content in the Editor tab to see live updates.</p>
  </section>
</main>
</body>
</html>`;
        try {
          store.upsertStreamingAssistant(simulated);
          store.replaceLastAssistantMessage(simulated);
          setTimeout(() => store.setContent(simulated), 50);
          signals.onResponse({ text: simulated });
        } catch {
          signals.onResponse({ text: simulated });
        }
        return;
      }

      const userMessage = body.messages?.[body.messages.length - 1];
      if (!userMessage?.text) {
        signals.onResponse({ error: 'No message text received' });
        return;
      }
      const userText: string = userMessage.text;

      // Build history from store
      const historyAi: AIMessage[] = store.messages
        .filter(
          (m) =>
            (m.role === 'user' || m.role === 'assistant') && !!m.content && m.content.trim() !== ''
        )
        .map((m) => ({ role: m.role, content: m.content }));

      const aiMessages: AIMessage[] = [...historyAi, { role: 'user', content: userText }];

      // Append user message
      store.appendMessage({
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      });

      // Generate response
      (async () => {
        try {
          const controller = new AbortController();
          abortRef.current = controller;

          const opts: ProviderOptions = {
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            signal: controller.signal,
          };

          let combined = '';
          for await (const chunk of ai.generateStream(aiMessages, opts)) {
            if (chunk?.text) {
              combined += chunk.text;
              store.upsertStreamingAssistant(combined);
            }
          }

          if (combined) {
            store.replaceLastAssistantMessage(combined);
            if (
              combined.includes('<!DOCTYPE html>') ||
              (combined.includes('<html') && combined.includes('</html>'))
            ) {
              console.log('🌐 Website detected, switching to editor');
              setTimeout(() => store.setContent(combined), 100);
            }
            signals.onResponse({ text: combined });
            return;
          }

          const result = await ai.generate(aiMessages, opts);
          const text = result?.text;
          if (text) {
            store.replaceLastAssistantMessage(text);
            if (
              text.includes('<!DOCTYPE html>') ||
              (text.includes('<html') && text.includes('</html>'))
            ) {
              setTimeout(() => store.setContent(text), 100);
            }
            signals.onResponse({ text });
          } else {
            signals.onResponse({ error: 'No response from AI service' });
          }
        } catch (error) {
          console.error('❌ AI generation error:', error);
          const message = error instanceof Error ? error.message : 'Request failed';
          signals.onResponse({ error: `AI Error: ${message}` });
        }
      })();
    },
    [aiReady, store, ai]
  );

  // Memoize config objects
  const introMessage = useMemo(
    () => ({
      text: `🚀 **AI Site Generator**

I'm your AI assistant for creating beautiful websites! Ask me to create any type of website and I'll generate complete HTML, CSS, and JavaScript code.

**Try asking me:**
- Create a portfolio website
- Make a landing page for a restaurant
- Build a blog template
- Design a company homepage`,
    }),
    []
  );

  const textInput = useMemo(
    () => ({
      placeholder: { text: 'Describe the website you want to create...' },
    }),
    []
  );

  const requestBodyLimits = useMemo(() => ({ maxMessages: -1 }), []);
  const connect = useMemo(() => ({ handler: stableHandler }), [stableHandler]);

  // Convert store messages to Deep Chat format
  const history = useMemo(() => {
    return store.messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && !!m.content)
      .map((m) => ({
        role: m.role === 'assistant' ? 'ai' : m.role,
        text: m.content,
      }));
  }, [store.messages]);

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
          >
            Provider: Gemini
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

        <div style={{ fontSize: '13px', color: aiReady ? '#059669' : '#6b7280' }}>
          {aiReady
            ? '✅ Ready for AI responses'
            : isProxyMode
              ? 'Proxy mode configured'
              : 'Enter API key to enable AI'}
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
          {proxyHealthy !== null && (
            <span
              style={{
                marginLeft: 8,
                color: proxyHealthy ? '#059669' : '#b91c1c',
              }}
            >
              AI SDK Proxy: {proxyHealthy ? 'Online' : 'Offline'}
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

export default ChatTab;

import { useRef, useMemo, useCallback } from 'react';
import { useService } from '@/di/hooks';
import { SERVICE_TOKENS } from '@/di/container';
import type { AIMessage, ProviderOptions } from '@/types/ai';
import type { ISiteStore, IAIProviderManager } from '@/services/interfaces';

export interface UseChatReturn {
  // State
  availableProviders: string[];
  selectedProvider: string;
  ai: {
    generate: (
      messages: AIMessage[],
      options?: ProviderOptions
    ) => Promise<import('@/types/ai').GenerateResult>;
    generateStream: (
      messages: AIMessage[],
      options?: ProviderOptions
    ) => AsyncGenerator<import('@/types/ai').StreamChunk, void, unknown>;
    ready: boolean;
  };
  isReady: boolean;

  // Handlers
  handleMessage: (
    body: { messages?: Array<{ text?: string }> },
    signals: { onResponse: (payload: { text?: string; error?: string }) => void }
  ) => void;

  // Data
  introMessage: { text: string };
  textInput: { placeholder: { text: string } };
  requestBodyLimits: { maxMessages: number };
  history: Array<{ role: 'user' | 'ai'; text: string }>;
}

export function useChat(): UseChatReturn {
  // Inject services using dependency injection
  const store = useService<ISiteStore>(SERVICE_TOKENS.SITE_SERVICE);
  const providerManager = useService<IAIProviderManager>(SERVICE_TOKENS.PROVIDER_MANAGER);

  // Get available providers and use the first one available
  const availableProviders = providerManager.getAvailableProviders();
  const selectedProvider = availableProviders.length > 0 ? availableProviders[0] : 'google';

  // Get the AI provider instance
  const aiProvider = providerManager.getProvider(selectedProvider);
  const abortRef = useRef<AbortController | null>(null);

  // Create a compatible AI interface for backward compatibility
  const ai = useMemo(
    () => ({
      generate: (messages: AIMessage[], options?: ProviderOptions) =>
        aiProvider.generate(messages, options),
      generateStream: (messages: AIMessage[], options?: ProviderOptions) =>
        aiProvider.generateStream(messages, options),
      ready: aiProvider.isAvailable(),
    }),
    [aiProvider]
  );

  // Stable handler for Deep Chat
  const handleMessage = useCallback(
    (
      body: { messages?: Array<{ text?: string }> },
      signals: { onResponse: (payload: { text?: string; error?: string }) => void }
    ) => {
      console.log('🔗 Deep Chat handler called');

      if (!ai.ready || availableProviders.length === 0) {
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
      const historyAi: AIMessage[] = store
        .getMessages()
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
    [store, ai, availableProviders.length]
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

  // Convert store messages to Deep Chat format
  const history = useMemo(() => {
    return store
      .getMessages()
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && !!m.content)
      .map((m) => ({
        role: (m.role === 'assistant' ? 'ai' : 'user') as 'user' | 'ai',
        text: m.content,
      }));
  }, [store]);

  return {
    availableProviders,
    selectedProvider,
    ai,
    isReady: ai.ready,
    handleMessage,
    introMessage,
    textInput,
    requestBodyLimits,
    history,
  };
}

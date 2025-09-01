import React from 'react';

// Lazy-load Deep Chat to reduce initial bundle size
const LazyDeepChat = React.lazy(() =>
  import('deep-chat-react').then((m) => ({ default: m.DeepChat }))
);

export interface ChatTabViewProps {
  availableProviders: string[];
  selectedProvider: string;
  isReady: boolean;
  introMessage: { text: string };
  textInput: { placeholder: { text: string } };
  requestBodyLimits: { maxMessages: number };
  history: Array<{ role: 'user' | 'ai'; text: string }>;
  connect: {
    handler: (
      body: { messages?: Array<{ text?: string }> },
      signals: { onResponse: (payload: { text?: string; error?: string }) => void }
    ) => void;
  };
}

export function ChatTabView({
  availableProviders,
  selectedProvider,
  isReady,
  introMessage,
  textInput,
  requestBodyLimits,
  history,
  connect,
}: ChatTabViewProps) {
  return (
    <div className="flex flex-col h-full">
      {availableProviders.length === 0 ? (
        <div className="alert alert-error mb-4">
          <span className="text-xl">🔴</span>
          <div>
            <h3 className="font-bold">No AI Providers Available</h3>
            <div className="text-sm">
              Please configure at least one AI provider in the Settings tab to enable chat
              functionality.
            </div>
          </div>
        </div>
      ) : (
        <div className={`alert mb-4 ${isReady ? 'alert-success' : 'alert-warning'}`}>
          <span className="text-xl">{isReady ? '🟢' : '🔴'}</span>
          <div>
            <h3 className="font-bold">AI Connection</h3>
            <div className="text-sm">
              Provider:{' '}
              <span className="badge badge-outline">
                {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
              </span>
              <br />
              {isReady ? '✅ AI provider ready' : '❌ AI provider not configured'}
              {!isReady && (
                <div className="mt-2">
                  Configure your AI provider in the Settings tab to enable chat functionality.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-[400px]">
        {availableProviders.length === 0 ? (
          <div className="hero min-h-[400px] bg-base-200 rounded-lg">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">💬</div>
                <h1 className="text-2xl font-bold">Chat Unavailable</h1>
                <p className="py-6">Configure an AI provider in Settings to enable chat</p>
              </div>
            </div>
          </div>
        ) : (
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="loading loading-spinner loading-lg"></div>
                <div className="ml-4">Loading chat...</div>
              </div>
            }
          >
            <LazyDeepChat
              className="h-full w-full border border-base-300 rounded-lg"
              introMessage={introMessage}
              textInput={textInput}
              requestBodyLimits={requestBodyLimits}
              history={history}
              connect={connect}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
}

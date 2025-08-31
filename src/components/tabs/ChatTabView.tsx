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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {availableProviders.length === 0 ? (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '2px solid #fecaca',
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
            🔴 No AI Providers Available
          </h4>
          <div style={{ fontSize: '13px', color: '#dc2626' }}>
            ❌ No AI providers are configured
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Please configure at least one AI provider in the Settings tab to enable chat
              functionality.
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '16px',
            backgroundColor: isReady ? '#f0f9ff' : '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '16px',
            border: `2px solid ${isReady ? '#3b82f6' : '#e9ecef'}`,
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
            {isReady ? '🟢' : '🔴'} AI Connection
            <span
              style={{
                fontSize: 12,
                color: '#111827',
                background: '#E5E7EB',
                padding: '2px 6px',
                borderRadius: 6,
              }}
            >
              Provider: {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
            </span>
          </h4>

          <div style={{ fontSize: '13px', color: isReady ? '#059669' : '#6b7280' }}>
            {isReady ? '✅ AI provider ready' : '❌ AI provider not configured'}
            {!isReady && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                Configure your AI provider in the Settings tab to enable chat functionality.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: '400px' }}>
        {availableProviders.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                Chat Unavailable
              </div>
              <div style={{ fontSize: '14px' }}>
                Configure an AI provider in Settings to enable chat
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

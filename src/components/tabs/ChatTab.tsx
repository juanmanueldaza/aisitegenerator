import { useMemo } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatTabView } from './ChatTabView';

export function ChatTab() {
  const chat = useChat();

  // Memoize connect object to prevent unnecessary re-renders
  const connect = useMemo(() => ({ handler: chat.handleMessage }), [chat.handleMessage]);

  return (
    <ChatTabView
      availableProviders={chat.availableProviders}
      selectedProvider={chat.selectedProvider}
      isReady={chat.isReady}
      introMessage={chat.introMessage}
      textInput={chat.textInput}
      requestBodyLimits={chat.requestBodyLimits}
      history={chat.history}
      connect={connect}
    />
  );
}

export default ChatTab;

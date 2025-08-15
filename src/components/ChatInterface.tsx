import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { MoreVertical, Download, RotateCcw, Settings } from 'lucide-react';

export function ChatInterface() {
  const {
    messages,
    isTyping,
    inputValue,
    sendMessage,
    setInputValue,
    clearConversation,
    exportConversation,
    isLoading
  } = useChat();

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
              <span className="text-lg text-white">🤖</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Site Generator</h1>
              <p className="text-sm text-gray-500">
                {isTyping ? 'AI is typing...' : 'Ready to help you build your website'}
              </p>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export conversation"
              aria-label="Export conversation"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={clearConversation}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Chat settings"
              aria-label="Chat settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList messages={messages} isTyping={isTyping} />

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Describe the website you'd like to create..."
      />

      {/* Status Bar */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Powered by AI</span>
            <span>•</span>
            <span>Secure & Private</span>
            {messages.length > 1 && (
              <>
                <span>•</span>
                <span>{messages.length} messages</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
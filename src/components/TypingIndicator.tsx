import { Bot } from 'lucide-react';
import type { TypingIndicatorProps } from '../types/chat';

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="flex gap-3 mb-4 animate-fade-in"
      role="status"
      aria-label="AI assistant is typing"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
        <Bot className="w-5 h-5" />
      </div>

      {/* Typing Animation */}
      <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-tl-none shadow-sm">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="ml-2 text-sm text-gray-500">AI is typing...</span>
        </div>
      </div>
    </div>
  );
}
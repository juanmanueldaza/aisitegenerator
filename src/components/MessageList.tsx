import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { MessageListProps } from '../types/chat';
import { ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';

export function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  // Check if user is near bottom of chat
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottomThreshold = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(isNearBottomThreshold);
      setShowScrollButton(!isNearBottomThreshold && messages.length > 3);
    }
  };

  // Auto-scroll when new messages arrive (if user is near bottom)
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isTyping, isNearBottom]);

  // Set up scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      return () => scrollContainer.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  return (
    <div className="flex-1 relative">
      {/* Messages Container */}
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-4 py-6 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {/* Welcome Message */}
        {messages.length === 1 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
              <span className="text-2xl text-white">🤖</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to AI Site Generator!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              I'm here to help you create amazing websites step by step. 
              Just tell me what you'd like to build and I'll guide you through the process.
            </p>
          </div>
        )}

        {/* Message List */}
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1}
            />
          ))}
        </div>

        {/* Typing Indicator */}
        <TypingIndicator isVisible={isTyping} />

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className={clsx(
            'absolute bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg',
            'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'transition-all duration-200 transform hover:scale-105',
            'z-10'
          )}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Count Badge */}
      {messages.length > 1 && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-600 shadow-sm border border-gray-200">
          {messages.length} messages
        </div>
      )}
    </div>
  );
}
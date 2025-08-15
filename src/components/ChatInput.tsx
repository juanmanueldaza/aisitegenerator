import { useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import type { ChatInputProps } from '../types/chat';
import { clsx } from 'clsx';

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  disabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setIsExpanded(false);
    }
  }, [value, onSend, disabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Max height in pixels
      
      if (scrollHeight > 40) {
        textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
      } else {
        textareaRef.current.style.height = '40px';
      }
    }
  }, [onChange]);

  const handleFocus = useCallback(() => {
    // Focus handler for potential future use
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className={clsx(
          'flex items-end gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          {/* Quick Actions */}
          <div className="flex gap-1 pb-2">
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Attach file"
              disabled={disabled}
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Add emoji"
              disabled={disabled}
              aria-label="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'flex-1 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400',
              'min-h-[40px] max-h-[120px] py-2 px-2',
              disabled && 'cursor-not-allowed'
            )}
            rows={1}
            aria-label="Message input"
            aria-describedby="message-help"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className={clsx(
              'flex-shrink-0 p-2 rounded-lg transition-all duration-200 mb-1',
              value.trim() && !disabled
                ? 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Help Text */}
        <div id="message-help" className="mt-2 text-xs text-gray-500 flex justify-between items-center">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className={clsx(
            'transition-opacity',
            value.length > 100 ? 'opacity-100' : 'opacity-0'
          )}>
            {value.length}/1000
          </span>
        </div>

        {/* Quick Suggestions */}
        {!value && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Help me build a portfolio website",
              "Create a business landing page",
              "I need an e-commerce site",
              "Build a blog"
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(suggestion)}
                disabled={disabled}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
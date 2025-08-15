import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { MessageBubbleProps } from '../types/chat';
import { CheckCircle, Clock, AlertCircle, User, Bot } from 'lucide-react';
import { clsx } from 'clsx';

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error' || message.type === 'error';
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 animate-pulse" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getMessageIcon = () => {
    return isUser ? 
      <User className="w-5 h-5" /> : 
      <Bot className="w-5 h-5" />;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  return (
    <div 
      className={clsx(
        'flex gap-3 mb-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
      role="article"
      aria-label={`${isUser ? 'User' : 'Assistant'} message at ${formatTimestamp(message.timestamp)}`}
    >
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white',
        isUser ? 'bg-blue-500' : 'bg-green-500'
      )}>
        {getMessageIcon()}
      </div>

      {/* Message Content */}
      <div className={clsx(
        'flex flex-col max-w-xs lg:max-w-md',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Message Bubble */}
        <div className={clsx(
          'px-4 py-2 rounded-lg shadow-sm',
          isUser 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-900 rounded-tl-none',
          isError && 'border-2 border-red-200',
          'break-words'
        )}>
          {message.type === 'code' ? (
            <pre className="whitespace-pre-wrap font-mono text-sm">
              <code>{message.content}</code>
            </pre>
          ) : (
            <div className={clsx(
              'prose prose-sm max-w-none',
              isUser && 'prose-invert'
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Customize code blocks
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return isInline ? (
                      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  // Customize links
                  a: ({ children, href, ...props }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={clsx(
                        'underline hover:no-underline',
                        isUser ? 'text-blue-200' : 'text-blue-600'
                      )}
                      {...props}
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div className={clsx(
          'flex items-center gap-1 mt-1 text-xs text-gray-500',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span>{formatTimestamp(message.timestamp)}</span>
          {isUser && getStatusIcon()}
        </div>

        {/* Message Type Badge */}
        {message.type !== 'text' && (
          <div className={clsx(
            'mt-1 px-2 py-1 text-xs rounded-full border',
            isUser ? 'self-end' : 'self-start',
            {
              'bg-blue-50 text-blue-700 border-blue-200': message.type === 'suggestion',
              'bg-yellow-50 text-yellow-700 border-yellow-200': message.type === 'system',
              'bg-red-50 text-red-700 border-red-200': message.type === 'error',
              'bg-gray-50 text-gray-700 border-gray-200': message.type === 'code'
            }
          )}>
            {message.type}
          </div>
        )}
      </div>
    </div>
  );
}
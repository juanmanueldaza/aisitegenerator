import React, { useState, useCallback } from 'react';
import { ResponseDisplayProps, SuggestionAction } from '../types/gemini';
import { GeminiResponseParser } from '../utils/responseParser';
import CodeHighlighter from './CodeHighlighter';
import MarkdownRenderer from './MarkdownRenderer';
import SuggestionButton from './SuggestionButton';
import ErrorDisplay from './ErrorDisplay';

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  onAction,
  className = ''
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Parse the response using our parser utility
  const parsedResponse = GeminiResponseParser.parseResponse(response);

  const handleCopy = useCallback((code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Clear after 2 seconds
  }, []);

  const handleAction = useCallback((action: SuggestionAction) => {
    onAction?.(action);
  }, [onAction]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getResponseClass = () => {
    const base = 'response-display';
    const typeClass = `response-display--${parsedResponse.type}`;
    const expandedClass = isExpanded ? 'response-display--expanded' : 'response-display--collapsed';
    
    return `${base} ${typeClass} ${expandedClass} ${className}`;
  };

  // Show error display for error responses
  if (parsedResponse.type === 'error' && parsedResponse.error) {
    return (
      <div className={getResponseClass()}>
        <ErrorDisplay 
          error={parsedResponse.error}
          onRetry={() => handleAction({ id: 'retry', label: 'Retry', type: 'apply' })}
        />
      </div>
    );
  }

  return (
    <div className={getResponseClass()}>
      {/* Response Header */}
      <div className="response-display__header">
        <div className="response-display__meta">
          <span className="response-display__type">{parsedResponse.type}</span>
          <span className="response-display__timestamp">
            {response.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        {parsedResponse.content.length > 500 && (
          <button
            onClick={toggleExpanded}
            className="response-display__toggle"
            aria-label={isExpanded ? 'Collapse response' : 'Expand response'}
          >
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
        )}
      </div>

      {/* Response Content */}
      <div className="response-display__content">
        {parsedResponse.type === 'markdown' ? (
          <MarkdownRenderer 
            content={parsedResponse.content}
            className="response-display__markdown"
          />
        ) : (
          <div className="response-display__text">
            {parsedResponse.content}
          </div>
        )}

        {/* Code Blocks */}
        {parsedResponse.codeBlocks.length > 0 && (
          <div className="response-display__code-blocks">
            {parsedResponse.codeBlocks.map((codeBlock, index) => (
              <CodeHighlighter
                key={`code-${index}`}
                code={codeBlock.code}
                language={codeBlock.language}
                title={codeBlock.title}
                filename={codeBlock.filename}
                onCopy={handleCopy}
                className="response-display__code-block"
              />
            ))}
          </div>
        )}

        {/* Copy Feedback */}
        {copiedCode && (
          <div className="response-display__copy-feedback" role="status" aria-live="polite">
            ✓ Code copied to clipboard
          </div>
        )}
      </div>

      {/* Suggestion Actions */}
      {parsedResponse.suggestions.length > 0 && (
        <div className="response-display__actions">
          <div className="response-display__actions-label">
            Available actions:
          </div>
          <div className="response-display__actions-list">
            {parsedResponse.suggestions.map((suggestion) => (
              <SuggestionButton
                key={suggestion.id}
                action={suggestion}
                onAction={handleAction}
                variant={suggestion.type === 'apply' ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Icon components
const ExpandIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const CollapseIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18,15 12,9 6,15"></polyline>
  </svg>
);

export default ResponseDisplay;
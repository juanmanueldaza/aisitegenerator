import React from 'react';
import { ErrorDisplayProps } from '../types/gemini';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  className = ''
}) => {
  const getErrorSeverity = () => {
    // Determine error severity based on error code
    const criticalCodes = ['AUTHENTICATION_FAILED', 'QUOTA_EXCEEDED', 'SERVICE_UNAVAILABLE'];
    const warningCodes = ['RATE_LIMITED', 'CONTENT_FILTERED', 'PARSE_ERROR'];
    
    if (criticalCodes.includes(error.code)) return 'critical';
    if (warningCodes.includes(error.code)) return 'warning';
    return 'info';
  };

  const getErrorIcon = () => {
    const severity = getErrorSeverity();
    
    switch (severity) {
      case 'critical':
        return <CriticalErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getErrorMessage = () => {
    // Provide user-friendly error messages
    const errorMessages: Record<string, string> = {
      'AUTHENTICATION_FAILED': 'Unable to authenticate with the AI service. Please check your connection and try again.',
      'QUOTA_EXCEEDED': 'You have reached your usage limit. Please try again later or upgrade your plan.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment before trying again.',
      'SERVICE_UNAVAILABLE': 'The AI service is temporarily unavailable. Please try again in a few minutes.',
      'CONTENT_FILTERED': 'Your request was filtered due to content policy. Please rephrase and try again.',
      'PARSE_ERROR': 'Unable to process the AI response. This may be a temporary issue.',
      'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    return errorMessages[error.code] || error.message || 'An error occurred';
  };

  const getErrorClass = () => {
    const base = 'error-display';
    const severityClass = `error-display--${getErrorSeverity()}`;
    
    return `${base} ${severityClass} ${className}`;
  };

  const showRetryButton = () => {
    // Don't show retry for quota or authentication errors
    const nonRetryableCodes = ['QUOTA_EXCEEDED', 'AUTHENTICATION_FAILED'];
    return onRetry && !nonRetryableCodes.includes(error.code);
  };

  return (
    <div className={getErrorClass()} role="alert" aria-live="polite">
      <div className="error-display__header">
        <div className="error-display__icon">
          {getErrorIcon()}
        </div>
        <div className="error-display__title">
          <h3>Something went wrong</h3>
          <span className="error-display__code">Error: {error.code}</span>
        </div>
      </div>
      
      <div className="error-display__content">
        <p className="error-display__message">{getErrorMessage()}</p>
        
        {error.details && (
          <details className="error-display__details">
            <summary>Technical details</summary>
            <pre className="error-display__details-content">{error.details}</pre>
          </details>
        )}
      </div>
      
      {showRetryButton() && (
        <div className="error-display__actions">
          <button
            onClick={onRetry}
            className="error-display__retry-button"
            aria-label="Retry the last action"
          >
            <RetryIcon />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// Icon components
const CriticalErrorIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const WarningIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const RetryIcon: React.FC = () => (
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
    <polyline points="23,4 23,10 17,10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

export default ErrorDisplay;
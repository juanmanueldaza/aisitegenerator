import React from 'react';

export type CalloutTone = 'info' | 'success' | 'warning' | 'error';

export interface InlineCalloutProps {
  tone?: CalloutTone;
  children: React.ReactNode;
}

export const InlineCallout: React.FC<InlineCalloutProps> = ({ tone = 'info', children }) => {
  // Map tones to DaisyUI alert classes
  const toneClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  const alertClass = toneClasses[tone];

  return (
    <div className={`alert ${alertClass}`}>
      <span>{children}</span>
    </div>
  );
};

export default InlineCallout;

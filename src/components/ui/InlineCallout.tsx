import React from 'react';

export type CalloutTone = 'info' | 'warn' | 'success';

const toneStyles: Record<CalloutTone, { bg: string; border: string; color: string }> = {
  info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  warn: { bg: '#fff7ed', border: '#fed7aa', color: '#9a3412' },
  success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#065f46' },
};

export interface InlineCalloutProps {
  tone?: CalloutTone;
  children: React.ReactNode;
}

export const InlineCallout: React.FC<InlineCalloutProps> = ({ tone = 'info', children }) => {
  const t = toneStyles[tone];
  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        padding: '8px 10px',
        borderRadius: 6,
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
};

export default InlineCallout;

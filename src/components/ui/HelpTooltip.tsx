import React from 'react';

export interface HelpTooltipProps {
  label: string;
  children?: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ label, children }) => {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        aria-label={label}
        role="img"
        title={label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#eef2ff',
          color: '#3730a3',
          fontSize: 12,
          cursor: 'help',
          marginLeft: 6,
        }}
      >
        ?
      </span>
      {children}
    </span>
  );
};

export default HelpTooltip;

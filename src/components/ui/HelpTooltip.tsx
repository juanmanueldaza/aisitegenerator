import React from 'react';

export interface HelpTooltipProps {
  label: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  label,
  children,
  position = 'top'
}) => {
  const tooltipClass = `tooltip tooltip-${position}`;

  return (
    <div className={`${tooltipClass} inline-block`} data-tip={label}>
      {children || (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs cursor-help ml-1.5">
          ?
        </span>
      )}
    </div>
  );
};

export default HelpTooltip;

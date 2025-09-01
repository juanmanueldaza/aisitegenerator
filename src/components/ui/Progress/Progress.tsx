import React from 'react';
import type { ProgressProps } from './Progress.types';

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'md',
  showValue = false,
  className = '',
  animated = true,
  striped = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantClasses = {
    primary: 'progress-primary',
    secondary: 'progress-secondary',
    accent: 'progress-accent',
    info: 'progress-info',
    success: 'progress-success',
    warning: 'progress-warning',
    error: 'progress-error',
  };

  const sizeClasses = {
    xs: 'progress-xs',
    sm: 'progress-sm',
    md: 'progress-md',
    lg: 'progress-lg',
  };

  const baseClasses = 'progress w-full';
  const animationClasses = animated ? 'progress-animated' : '';
  const stripeClasses = striped ? 'progress-striped' : '';

  return (
    <div className="w-full">
      <progress
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${animationClasses} ${stripeClasses} ${className}`}
        value={value}
        max={max}
      />
      {showValue && (
        <div className="flex justify-between items-center mt-1 text-sm text-base-content/70">
          <span>Progress</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export const ProgressCircle: React.FC<ProgressProps & { radius?: number }> = ({
  value = 0,
  max = 100,
  variant = 'primary',
  showValue = true,
  radius = 40,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    primary: 'hsl(var(--p))',
    secondary: 'hsl(var(--s))',
    accent: 'hsl(var(--a))',
    info: 'hsl(var(--in))',
    success: 'hsl(var(--su))',
    warning: 'hsl(var(--wa))',
    error: 'hsl(var(--er))',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={radius * 2 + 10} height={radius * 2 + 10} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={radius + 5}
          cy={radius + 5}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-base-300"
        />
        {/* Progress circle */}
        <circle
          cx={radius + 5}
          cy={radius + 5}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

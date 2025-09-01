import React from 'react';
import type { AlertProps } from './Alert.types';

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variantClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className={`alert ${variantClasses[variant]} ${className}`}>
      <div className="flex-1">
        {icon || defaultIcons[variant]}
        <div>
          {title && <div className="font-bold">{title}</div>}
          {children && <div className="text-sm">{children}</div>}
        </div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="btn btn-sm btn-circle btn-ghost"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

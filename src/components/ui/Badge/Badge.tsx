import React from 'react';
import type { BadgeProps } from './Badge.types';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  icon,
  removable = false,
  onRemove,
}) => {
  const variantClasses = {
    default: 'badge',
    primary: 'badge badge-primary',
    secondary: 'badge badge-secondary',
    accent: 'badge badge-accent',
    neutral: 'badge badge-neutral',
    info: 'badge badge-info',
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    error: 'badge badge-error',
    outline: 'badge badge-outline',
    ghost: 'badge badge-ghost',
  };

  const sizeClasses = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      <span>{children}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 btn btn-xs btn-circle btn-ghost"
          aria-label="Remove badge"
        >
          ✕
        </button>
      )}
    </div>
  );
};

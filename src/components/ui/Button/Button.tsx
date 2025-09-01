import React from 'react';
import type { ButtonProps } from './Button.types';

/**
 * Enhanced Button component using DaisyUI classes
 * Features multiple variants, sizes, and loading states
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  glow = false,
  ...rest
}) => {
  // Variant mapping with DaisyUI classes
  const variantClasses = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    accent: 'btn btn-accent',
    danger: 'btn btn-error',
    success: 'btn btn-success',
    warning: 'btn btn-warning',
    link: 'btn btn-link',
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost',
  };

  // Size mapping with DaisyUI classes
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg',
  };

  // Base classes with DaisyUI styling
  const baseClasses = 'transition-all duration-300 focus:outline-none';

  // Glow effect for special buttons
  const glowClasses = glow ? 'shadow-lg' : '';

  // Loading state
  const loadingClasses = loading ? 'loading' : '';

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    glowClasses,
    loadingClasses,
    disabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {/* Icon support */}
      {icon && !loading && <span className="mr-2">{icon}</span>}

      {/* Loading spinner - DaisyUI handles this with loading class */}
      {loading && <span className="loading loading-spinner loading-sm"></span>}

      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

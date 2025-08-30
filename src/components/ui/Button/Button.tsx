import React from 'react';
import type { ButtonProps } from './Button.types';

/**
 * Reusable Button component using DaisyUI classes
 * Single Responsibility: Handles button rendering and click events
 * Open/Closed: Extensible through props without modifying the component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  // Map variants to DaisyUI classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-error',
    link: 'btn-link',
    outline: 'btn-outline',
  };

  // Map sizes to DaisyUI classes
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg',
  };

  const baseClasses = 'btn';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const disabledClass = disabled ? 'btn-disabled' : '';

  const buttonClasses = [baseClasses, variantClass, sizeClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

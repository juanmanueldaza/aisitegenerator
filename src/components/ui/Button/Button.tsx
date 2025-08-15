import React from 'react';
import type { ButtonProps } from './Button.types';

/**
 * Reusable Button component following SOLID principles
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
  const baseClasses = 'button';
  const variantClasses = `button--${variant}`;
  const sizeClasses = `button--${size}`;
  const disabledClasses = disabled ? 'button--disabled' : '';

  const buttonClasses = [baseClasses, variantClasses, sizeClasses, disabledClasses, className]
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

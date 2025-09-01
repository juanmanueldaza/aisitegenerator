import React from 'react';

/**
 * Enhanced Input component using DaisyUI classes
 * Features validation states and multiple variants
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  glow?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  icon,
  glow = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes with DaisyUI
  const sizeClasses = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg',
  };

  // Base classes with DaisyUI input classes
  const baseClasses = 'input w-full';

  // Glow effect
  const glowClasses = glow ? 'shadow-lg' : '';

  // Error state with DaisyUI
  const errorClasses = error ? 'input-error' : '';

  // Combine classes
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    glowClasses,
    errorClasses,
    variant === 'minimal'
      ? 'bg-transparent border-b-2 border-base-300 focus:border-primary rounded-none px-0'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="form-control w-full">
      {/* Label */}
      {label && variant !== 'floating' && (
        <label htmlFor={inputId} className="label">
          <span className="label-text font-medium">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70">
            {icon}
          </div>
        )}

        {/* Input field */}
        <input id={inputId} className={`${inputClasses} ${icon ? 'pl-10' : ''}`} {...props} />

        {/* Floating label */}
        {variant === 'floating' && label && (
          <label
            htmlFor={inputId}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70 transition-all duration-300 pointer-events-none peer-focus:text-primary peer-focus:top-0 peer-focus:text-sm peer-focus:bg-base-100 peer-focus:px-1 peer-focus:-ml-1 peer-valid:top-0 peer-valid:text-sm peer-valid:bg-base-100 peer-valid:px-1 peer-valid:-ml-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>

      {/* Helper text and error */}
      {(helperText || error) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-error' : 'text-base-content/70'}`}>
            {error || helperText}
          </span>
        </label>
      )}
    </div>
  );
};

/**
 * Textarea component with DaisyUI classes
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  glow = false,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes with DaisyUI
  const sizeClasses = {
    sm: 'textarea-sm',
    md: 'textarea-md',
    lg: 'textarea-lg',
  };

  // Base classes with DaisyUI
  const baseClasses = 'textarea w-full resize-none';

  // Glow effect
  const glowClasses = glow ? 'shadow-lg' : '';

  // Error state with DaisyUI
  const errorClasses = error ? 'textarea-error' : '';

  // Combine classes
  const textareaClasses = [
    baseClasses,
    sizeClasses[size],
    glowClasses,
    errorClasses,
    variant === 'minimal'
      ? 'bg-transparent border-b-2 border-base-300 focus:border-primary rounded-none px-0'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="form-control w-full">
      {/* Label */}
      {label && (
        <label htmlFor={textareaId} className="label">
          <span className="label-text font-medium">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}

      {/* Textarea */}
      <textarea id={textareaId} className={textareaClasses} {...props} />

      {/* Helper text and error */}
      {(helperText || error) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-error' : 'text-base-content/70'}`}>
            {error || helperText}
          </span>
        </label>
      )}
    </div>
  );
};

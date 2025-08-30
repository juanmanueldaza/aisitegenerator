import React from 'react';

/**
 * Enhanced Input component with sci-fi aesthetic
 * Features floating labels, validation states, and smooth animations
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

  // Size classes
  const sizeClasses = {
    sm: 'input-sm text-sm',
    md: 'input-md',
    lg: 'input-lg text-lg',
  };

  // Base classes with sci-fi styling
  const baseClasses = 'input w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50';

  // Glow effect
  const glowClasses = glow ? 'shadow-lg shadow-primary/10 focus:shadow-primary/20' : '';

  // Error state
  const errorClasses = error ? 'input-error border-error focus:ring-error/50' : '';

  // Combine classes
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    glowClasses,
    errorClasses,
    variant === 'minimal'
      ? 'bg-transparent border-b-2 border-gray-300 focus:border-blue-600 rounded-none px-0'
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
          <span className="label-text font-medium text-gray-900">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}

        {/* Input field */}
        <input id={inputId} className={`${inputClasses} ${icon ? 'pl-10' : ''}`} {...props} />

        {/* Floating label */}
        {variant === 'floating' && label && (
          <label
            htmlFor={inputId}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 transition-all duration-300 pointer-events-none peer-focus:text-blue-600 peer-focus:top-0 peer-focus:text-sm peer-focus:bg-white peer-focus:px-1 peer-focus:-ml-1 peer-valid:top-0 peer-valid:text-sm peer-valid:bg-white peer-valid:px-1 peer-valid:-ml-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>

      {/* Helper text and error */}
      {(helperText || error) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </span>
        </label>
      )}
    </div>
  );
};

/**
 * Textarea component with similar styling
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

  // Size classes
  const sizeClasses = {
    sm: 'textarea-sm text-sm',
    md: 'textarea-md',
    lg: 'textarea-lg text-lg',
  };

  // Base classes
  const baseClasses =
    'textarea w-full transition-all duration-300 focus:ring-2 focus:ring-primary/50 resize-none';

  // Glow effect
  const glowClasses = glow ? 'shadow-lg shadow-primary/10 focus:shadow-primary/20' : '';

  // Error state
  const errorClasses = error ? 'textarea-error border-error focus:ring-error/50' : '';

  // Combine classes
  const textareaClasses = [
    baseClasses,
    sizeClasses[size],
    glowClasses,
    errorClasses,
    variant === 'minimal'
      ? 'bg-transparent border-b-2 border-gray-300 focus:border-blue-600 rounded-none px-0'
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
          <span className="label-text font-medium text-gray-900">
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
          <span className={`label-text-alt ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </span>
        </label>
      )}
    </div>
  );
};

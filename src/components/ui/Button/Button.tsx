import React from 'react';
import type { ButtonProps } from './Button.types';

/**
 * Enhanced Button component with sci-fi aesthetic
 * Features glassmorphism effects, hover animations, and multiple variants
 * Uses DaisyUI classes with custom sci-fi styling
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
}) => {
  // Enhanced variant mapping with sci-fi effects
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-600/25 transition-all duration-300',
    accent:
      'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300',
    danger:
      'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300',
    success:
      'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300',
    warning:
      'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300',
    link: 'bg-transparent text-blue-600 hover:text-blue-800 hover:underline transition-all duration-300',
    outline:
      'bg-transparent border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300',
    ghost:
      'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 transition-all duration-300',
  };

  // Size mapping with responsive design
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-lg',
  };

  // Base classes with sci-fi styling
  const baseClasses =
    'inline-flex items-center justify-center font-medium relative overflow-hidden group rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  // Glow effect for special buttons
  const glowClasses = glow
    ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/20 before:to-purple-600/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:rounded-lg'
    : '';

  // Loading state
  const loadingClasses = loading ? 'cursor-wait' : '';

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    glowClasses,
    loadingClasses,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
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
    >
      {/* Icon support */}
      {icon && !loading && (
        <span className="mr-2 group-hover:scale-110 transition-transform duration-200">{icon}</span>
      )}

      {/* Loading spinner */}
      {loading && (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
      )}

      {/* Button content with subtle animation */}
      <span className="relative z-10 group-hover:scale-105 transition-transform duration-200 inline-block">
        {children}
      </span>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
    </button>
  );
};

import React from 'react';

/**
 * Enhanced Card component with sci-fi aesthetic
 * Features glassmorphism, hover effects, and responsive design
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  variant = 'default',
  size = 'md',
  glow = false,
}) => {
  // Combine classes using pure Tailwind utilities
  const cardClasses = [
    'relative rounded-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden',
    variant === 'default' ? 'glass-card-sci-fi' : '',
    variant === 'elevated' ? 'glass-card-sci-fi shadow-xl' : '',
    variant === 'bordered' ? 'bg-gray-50 border-2 border-blue-500/20' : '',
    variant === 'ghost' ? 'bg-transparent border border-gray-300/20' : '',
    size === 'sm' ? 'p-4' : '',
    size === 'md' ? 'p-6' : '',
    size === 'lg' ? 'p-8' : '',
    glow ? 'shadow-glow-primary hover:shadow-glow-accent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      {/* Card header */}
      {(title || subtitle || actions) && (
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-0">{children}</div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl pointer-events-none"></div>
    </div>
  );
};

/**
 * Card content wrapper for consistent spacing
 */
export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`space-y-4 ${className}`}>{children}</div>;

/**
 * Card footer component
 */
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`mt-6 pt-4 border-t border-gray-300/30 flex justify-end gap-2 ${className}`}>
    {children}
  </div>
);

import React from 'react';

/**
 * Enhanced Card component using DaisyUI classes
 * Features multiple variants and responsive design
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  variant = 'default',
  glow = false,
}) => {
  // Combine classes using DaisyUI card classes
  const cardClasses = [
    'card transition-all duration-300',
    variant === 'default' ? 'bg-base-100' : '',
    variant === 'elevated' ? 'bg-base-100 shadow-xl' : '',
    variant === 'bordered' ? 'bg-base-100 border border-base-300' : '',
    variant === 'ghost' ? 'bg-transparent border border-base-300' : '',
    glow ? 'shadow-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      {/* Card header */}
      {(title || subtitle || actions) && (
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="card-actions flex gap-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="card-body">{children}</div>
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
  <div className={`card-actions justify-end gap-2 mt-6 pt-4 border-t border-base-300 ${className}`}>
    {children}
  </div>
);

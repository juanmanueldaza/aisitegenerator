import React from 'react';
import type { CardProps, CardHeaderProps, CardBodyProps, CardActionsProps } from './Card.types';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  hover = false,
  className = '',
  onClick,
}) => {
  const variantClasses = {
    default: 'card bg-base-100',
    bordered: 'card bg-base-100 border border-base-300',
    compact: 'card bg-base-100 card-compact',
    side: 'card bg-base-100 card-side',
    glass: 'card glass',
  };

  const sizeClasses = {
    sm: 'card-sm',
    md: 'card-md',
    lg: 'card-lg',
  };

  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`card-header p-4 ${className}`}>{children}</div>;
};

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

export const CardActions: React.FC<CardActionsProps> = ({
  children,
  justify = 'end',
  className = '',
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return <div className={`card-actions ${justifyClasses[justify]} ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <h2 className={`card-title ${className}`}>{children}</h2>;
};

export const CardImage: React.FC<{
  src: string;
  alt?: string;
  className?: string;
}> = ({ src, alt = '', className = '' }) => {
  return (
    <figure className={className}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </figure>
  );
};

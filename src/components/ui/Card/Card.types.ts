import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'compact' | 'side' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardActionsProps {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

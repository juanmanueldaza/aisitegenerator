import React from 'react';

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

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

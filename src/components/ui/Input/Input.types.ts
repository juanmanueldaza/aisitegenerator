import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  glow?: boolean;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

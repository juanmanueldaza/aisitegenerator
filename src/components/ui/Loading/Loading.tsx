import React from 'react';
import type { LoadingProps, SkeletonProps } from './Loading.types';

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className = '',
  text,
}) => {
  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    neutral: 'text-neutral',
  };

  const variantClasses = {
    spinner: 'loading-spinner',
    dots: 'loading-dots',
    ring: 'loading-ring',
    ball: 'loading-ball',
    bars: 'loading-bars',
    infinity: 'loading-infinity',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`loading ${variantClasses[variant]} ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      />
      {text && <div className="text-sm text-base-content/70">{text}</div>}
    </div>
  );
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  rounded = true,
  animated = true,
}) => {
  const baseClasses = 'skeleton';
  const roundedClasses = rounded ? 'rounded' : '';
  const animationClasses = animated ? '' : 'skeleton-static';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${roundedClasses} ${animationClasses} ${className}`}
      style={style}
    />
  );
};

export const SkeletonText: React.FC<Omit<SkeletonProps, 'height'> & { lines?: number }> = ({
  lines = 3,
  width,
  className = '',
  rounded = true,
  animated = true,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 && width ? width : '100%'}
          className={className}
          rounded={rounded}
          animated={animated}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <Skeleton height="2rem" width="60%" className="mb-4" />
        <SkeletonText lines={3} className="mb-4" />
        <div className="flex gap-2">
          <Skeleton height="2rem" width="4rem" />
          <Skeleton height="2rem" width="4rem" />
        </div>
      </div>
    </div>
  );
};

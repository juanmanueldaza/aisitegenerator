import React from 'react';

export interface ToastProps {
  message: string;
  visible?: boolean;
  role?: 'status' | 'alert';
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible = true,
  role = 'status',
  variant = 'info',
}) => {
  if (!visible || !message) return null;

  // Map variants to DaisyUI alert classes
  const variantClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  const alertClass = variantClasses[variant];

  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={`alert ${alertClass} shadow-lg fixed bottom-20 left-4 z-50 max-w-sm`}
    >
      <span>{message}</span>
    </div>
  );
};

export default Toast;

import React from 'react';

export interface ToastProps {
  message: string;
  visible?: boolean;
  role?: 'status' | 'alert';
  style?: React.CSSProperties;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible = true,
  role = 'status',
  style,
}) => {
  if (!visible || !message) return null;
  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      style={{
        position: 'absolute',
        bottom: 80,
        left: 16,
        background: 'rgba(17,24,39,0.9)',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 12,
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        ...style,
      }}
    >
      {message}
    </div>
  );
};

export default Toast;

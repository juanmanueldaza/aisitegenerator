
import { useAuth } from '../contexts/AuthContext';

interface ErrorNotificationProps {
  className?: string;
}

export function ErrorNotification({ className = '' }: ErrorNotificationProps) {
  const { state, clearError } = useAuth();

  if (!state.error) {
    return null;
  }

  return (
    <div className={`error-notification ${className}`} style={{
      padding: '12px 16px',
      backgroundColor: '#ffeaea',
      border: '1px solid #f5c6cb',
      borderRadius: '6px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#721c24', fontSize: '16px' }}>⚠️</span>
        <span style={{ color: '#721c24', fontSize: '14px' }}>
          {state.error}
        </span>
      </div>
      <button
        onClick={clearError}
        style={{
          background: 'none',
          border: 'none',
          color: '#721c24',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}
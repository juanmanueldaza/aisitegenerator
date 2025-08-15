import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignOutButtonProps {
  className?: string;
  showConfirmDialog?: boolean;
}

export function SignOutButton({ className = '', showConfirmDialog = true }: SignOutButtonProps) {
  const { signOut, state } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = () => {
    if (showConfirmDialog) {
      setShowConfirm(true);
    } else {
      signOut();
    }
  };

  const confirmSignOut = () => {
    setShowConfirm(false);
    signOut();
  };

  const cancelSignOut = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="sign-out-dialog" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Confirm Sign Out
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#586069', lineHeight: '1.5' }}>
            Are you sure you want to sign out? You'll need to authenticate again to use the application.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={cancelSignOut}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5da',
                backgroundColor: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmSignOut}
              disabled={state.isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: state.isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: state.isLoading ? 0.6 : 1,
              }}
            >
              {state.isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={state.isLoading}
      className={`sign-out-button ${className}`}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: state.isLoading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        opacity: state.isLoading ? 0.6 : 1,
      }}
    >
      {state.isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
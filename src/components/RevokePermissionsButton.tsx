import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RevokePermissionsButtonProps {
  className?: string;
}

export function RevokePermissionsButton({ className = '' }: RevokePermissionsButtonProps) {
  const { revokePermissions, state } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  const handleRevoke = () => {
    setShowConfirm(true);
  };

  const confirmRevoke = () => {
    setShowConfirm(false);
    revokePermissions();
  };

  const cancelRevoke = () => {
    setShowConfirm(false);
  };

  const showEducationDialog = () => {
    setShowEducation(true);
  };

  const closeEducation = () => {
    setShowEducation(false);
  };

  if (showEducation) {
    return (
      <div className="education-dialog" style={{
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
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            About GitHub Permissions
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
              What permissions does this app request?
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>repo</strong>: Create and manage your website repositories</li>
              <li><strong>workflow</strong>: Enable GitHub Actions for automatic deployments</li>
              <li><strong>user:email</strong>: Access your email for GitHub Pages setup</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
              How to manage permissions:
            </h4>
            <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Go to <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer">GitHub Settings → Applications</a></li>
              <li>Find "AI Site Generator" in the "Authorized OAuth Apps" section</li>
              <li>Click "Revoke" to completely remove access</li>
              <li>You can also review what data the app can access</li>
            </ol>
          </div>

          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
              <strong>Note:</strong> This app runs entirely in your browser and cannot revoke permissions programmatically. 
              For complete revocation, please use the GitHub Settings page linked above.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={closeEducation}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5da',
                backgroundColor: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Close
            </button>
            <a
              href="https://github.com/settings/applications"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                backgroundColor: '#0366d6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              Manage on GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="revoke-dialog" style={{
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
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#d73a49' }}>
            ⚠️ Revoke GitHub Permissions
          </h3>
          
          <p style={{ margin: '0 0 16px 0', color: '#586069', lineHeight: '1.5' }}>
            This will clear your authentication data from this app. However, to completely revoke 
            permissions, you'll need to manually revoke access on GitHub.
          </p>

          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f6f8fa', 
            border: '1px solid #d1d5da', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0', fontSize: '14px' }}>
              After clicking "Revoke", you'll be redirected to GitHub where you can completely 
              remove this app's access to your account.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={cancelRevoke}
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
              onClick={showEducationDialog}
              style={{
                padding: '8px 16px',
                border: '1px solid #0366d6',
                backgroundColor: 'white',
                color: '#0366d6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Learn More
            </button>
            <button
              onClick={confirmRevoke}
              disabled={state.isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#d73a49',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: state.isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: state.isLoading ? 0.6 : 1,
              }}
            >
              {state.isLoading ? 'Revoking...' : 'Revoke & Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={state.isLoading}
      className={`revoke-permissions-button ${className}`}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ffeaa7',
        color: '#856404',
        border: '1px solid #f1c40f',
        borderRadius: '6px',
        cursor: state.isLoading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        opacity: state.isLoading ? 0.6 : 1,
      }}
    >
      {state.isLoading ? 'Processing...' : 'Revoke Permissions'}
    </button>
  );
}
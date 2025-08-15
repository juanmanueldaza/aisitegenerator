
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { state } = useAuth();

  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  return (
    <div className={`user-profile ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      border: '1px solid #e1e4e8',
      borderRadius: '6px',
      backgroundColor: '#f6f8fa',
    }}>
      <img
        src={state.user.avatar_url}
        alt={`${state.user.login}'s avatar`}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid #e1e4e8',
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>
          {state.user.login}
        </div>
        <div style={{ fontSize: '12px', color: '#586069' }}>
          Authenticated with GitHub
        </div>
      </div>
      <a
        href={state.user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '12px',
          color: '#0366d6',
          textDecoration: 'none',
        }}
      >
        View Profile
      </a>
    </div>
  );
}
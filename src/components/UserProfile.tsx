import React from 'react';
import { GitHubUser } from '@/types';

interface UserProfileProps {
  user: GitHubUser;
  onLogout: () => void;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onLogout,
  className = '',
}) => {
  return (
    <div className={`user-profile ${className}`} data-testid="user-profile">
      <div className="user-info" data-testid="user-info">
        <img
          src={user.avatar_url}
          alt={`${user.name || user.login}'s avatar`}
          className="avatar"
          data-testid="user-avatar"
        />
        <div className="user-details">
          <h3 data-testid="user-name">{user.name || user.login}</h3>
          <p data-testid="user-login">@{user.login}</p>
          {user.email && (
            <p data-testid="user-email">{user.email}</p>
          )}
        </div>
      </div>
      <button
        onClick={onLogout}
        className="logout-button"
        data-testid="logout-button"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
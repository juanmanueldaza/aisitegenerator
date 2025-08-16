/**
 * GitHub Authentication Component
 * Handles login/logout and displays user information
 */

import React from 'react';
import { useGitHub } from '../../hooks/useGitHub';
import './GitHubAuth.css';

interface GitHubAuthProps {
  className?: string;
}

const GitHubAuth: React.FC<GitHubAuthProps> = ({ className = '' }) => {
  const { isAuthenticated, user, isLoading, error, login, logout, clearError, repositories } =
    useGitHub();

  if (isLoading) {
    return (
      <div className={`github-auth loading ${className}`}>
        <div className="loading-spinner"></div>
        <p>Connecting to GitHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`github-auth error ${className}`}>
        <div className="error-content">
          <h3>Authentication Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={clearError} className="btn btn-secondary">
              Dismiss
            </button>
            <button onClick={login} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`github-auth unauthenticated ${className}`}>
        <div className="auth-content">
          <div className="github-icon">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>
          <h2>Connect to GitHub</h2>
          <p>Sign in with your GitHub account to create and deploy websites</p>
          <button onClick={login} className="btn btn-primary btn-large">
            <span className="btn-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </span>
            Sign in with GitHub
          </button>
          <div className="auth-info">
            <p className="info-text">
              We'll only request the minimum permissions needed to create and deploy your websites.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`github-auth authenticated ${className}`}>
      <div className="user-info">
        <div className="user-avatar">
          <img src={user?.avatar_url} alt={user?.name || user?.login} />
        </div>
        <div className="user-details">
          <h3>{user?.name || user?.login}</h3>
          <p className="user-login">@{user?.login}</p>
          <p className="repo-count">{repositories.length} repositories</p>
        </div>
        <div className="user-actions">
          <button onClick={logout} className="btn btn-secondary btn-small">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubAuth;

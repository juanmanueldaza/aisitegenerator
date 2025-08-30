/**
 * GitHub Authentication Component
 * Handles login/logout and displays user information
 */

import React, { useState } from 'react';
import { useGitHub } from '../../hooks/useGitHub';
import {
  getRuntimeClientId,
  setRuntimeClientId,
  clearRuntimeClientId,
  getRuntimeRedirectUri,
  setRuntimeRedirectUri,
  clearRuntimeRedirectUri,
} from '../../utils/githubConfig';
import { isAuthDebugEnabled, mask } from '../../utils/debug';
import './GitHubAuth.css';
import { ScopesBadge } from './ScopesBadge';
import { HelpPanel } from '@/components/ui';

interface GitHubAuthProps {
  className?: string;
}

const GitHubAuth: React.FC<GitHubAuthProps> = ({ className = '' }) => {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    startDeviceAuth,
    logout,
    clearError,
    repositories,
  } = useGitHub();
  const [deviceHint, setDeviceHint] = useState<null | {
    code: string;
    uri: string;
    expires: number;
  }>(null);
  const [cid, setCid] = useState(getRuntimeClientId() || '');
  const [redirect, setRedirect] = useState(getRuntimeRedirectUri() || '');
  const hasClientId = !!cid;
  const [helpOpen, setHelpOpen] = useState<false | 'access'>(false);

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
          <div className="flex gap-2 mt-4">
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Dismiss
            </button>
            <button
              onClick={login}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
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
          {isAuthDebugEnabled() && (
            <div
              style={{
                fontSize: 12,
                padding: 8,
                background: '#0b1220',
                color: '#9ecbff',
                borderRadius: 6,
                marginBottom: 12,
              }}
            >
              <div>
                <strong>Auth Debug</strong>
              </div>
              <div>Origin: {window.location.origin}</div>
              <div>Client ID: {mask(cid)}</div>
              <div>Callback: {redirect || `${window.location.origin}/oauth/callback`}</div>
            </div>
          )}
          <p>Sign in with your GitHub account to create and deploy websites</p>

          {!hasClientId && (
            <div className="client-id-setup" style={{ width: '100%', marginBottom: 12 }}>
              <label htmlFor="gh-client-id" style={{ display: 'block', marginBottom: 6 }}>
                Enter your GitHub OAuth App Client ID
              </label>
              <input
                id="gh-client-id"
                type="text"
                placeholder="e.g.  Iv1.123abc..."
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                }}
              />
              <label
                htmlFor="gh-redirect-uri"
                style={{ display: 'block', marginTop: 10, marginBottom: 6 }}
              >
                Optional: Override Redirect URI (for local dev)
              </label>
              <input
                id="gh-redirect-uri"
                type="text"
                placeholder="https://aisitegenerator.daza.ar/oauth/callback"
                value={redirect}
                onChange={(e) => setRedirect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => {
                    if (cid.trim()) {
                      setRuntimeClientId(cid.trim());
                      if (redirect.trim()) setRuntimeRedirectUri(redirect.trim());
                      else clearRuntimeRedirectUri();
                      window.location.reload();
                    }
                  }}
                >
                  Save Client ID
                </button>
                {getRuntimeClientId() && (
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => {
                      clearRuntimeClientId();
                      clearRuntimeRedirectUri();
                      setCid('');
                      setRedirect('');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="info-text" style={{ marginTop: 6, fontSize: 12 }}>
                Tip: You can also provide it via URL as ?gh_client_id=YOUR_CLIENT_ID and
                ?gh_redirect=FULL_CALLBACK_URL
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (!hasClientId) return;
              // Persist the client ID at click time to ensure the hook sees it
              if (cid !== getRuntimeClientId()) {
                setRuntimeClientId(cid.trim());
              }
              if (redirect.trim()) setRuntimeRedirectUri(redirect.trim());
              else clearRuntimeRedirectUri();
              login();
            }}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasClientId}
          >
            <span className="mr-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </span>
            Sign in with GitHub
          </button>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={async () => {
                if (!hasClientId) return;
                if (cid !== getRuntimeClientId()) setRuntimeClientId(cid.trim());
                if (redirect.trim()) setRuntimeRedirectUri(redirect.trim());
                else clearRuntimeRedirectUri();
                try {
                  const session = await startDeviceAuth();
                  setDeviceHint({
                    code: session.user_code,
                    uri: session.verification_uri,
                    expires: session.expires_in,
                  });
                  // Fire-and-forget polling; errors surface via alert for now
                  session.poll().catch((e) => alert((e as Error).message));
                } catch (e) {
                  alert((e as Error).message);
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasClientId}
            >
              Use Device Login (no redirect)
            </button>
          </div>
          {deviceHint && (
            <div className="info-text" style={{ marginTop: 8, fontSize: 12 }}>
              1) Visit {deviceHint.uri} 2) Enter code: <strong>{deviceHint.code}</strong> 3) Expires
              in ~{Math.round(deviceHint.expires / 60)} min
            </div>
          )}
          <div className="auth-info">
            <p className="info-text">
              We'll only request the minimum permissions needed to create and deploy your websites.
            </p>
            {!hasClientId && (
              <p className="error-text" style={{ color: '#b91c1c', marginTop: 8 }}>
                Client ID is required. Create an OAuth App and paste its Client ID above.
              </p>
            )}
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
          {/* Show granted scopes to satisfy #14 */}
          <ScopesBadge />
        </div>
        <div className="user-actions">
          <button
            onClick={logout}
            className="btn btn-secondary btn-small"
            title="Clears local session (token in this tab). To fully revoke the app, use GitHub settings (see link below)."
          >
            Sign Out
          </button>
        </div>
      </div>
      <div className="auth-tips" style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        To revoke permissions completely, visit GitHub → Settings → Applications → Authorized OAuth
        Apps.{' '}
        <button className="btn btn-link btn-small" onClick={() => setHelpOpen('access')}>
          Manage access
        </button>
      </div>
      <HelpPanel open={helpOpen === 'access'} onClose={() => setHelpOpen(false)} topic="access" />
    </div>
  );
};

export default GitHubAuth;

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
} from '../../utils/github-config';
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
      <div className={`card bg-base-100 shadow-lg ${className}`}>
        <div className="card-body items-center text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p>Connecting to GitHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card bg-base-100 shadow-lg ${className}`}>
        <div className="card-body">
          <div className="alert alert-error">
            <span>❌</span>
            <div>
              <h3 className="font-bold">Authentication Error</h3>
              <p>{error}</p>
            </div>
          </div>
          <div className="card-actions justify-end">
            <button onClick={clearError} className="btn btn-ghost">
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
      <div className={`card bg-base-100 shadow-lg ${className}`}>
        <div className="card-body items-center text-center">
          <div className="mb-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="text-base-content/70"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>
          <h2 className="card-title">Connect to GitHub</h2>
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
            <div className="w-full space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Enter your GitHub OAuth App Client ID</span>
                </label>
                <input
                  id="gh-client-id"
                  type="text"
                  placeholder="e.g. Iv1.123abc..."
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Optional: Override Redirect URI (for local dev)
                  </span>
                </label>
                <input
                  id="gh-redirect-uri"
                  type="text"
                  placeholder="https://aisitegenerator.daza.ar/oauth/callback"
                  value={redirect}
                  onChange={(e) => setRedirect(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
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
                    className="btn btn-ghost"
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
              <div className="alert alert-info">
                <span>💡</span>
                <div>
                  <p>
                    Tip: You can also provide it via URL as ?gh_client_id=YOUR_CLIENT_ID and
                    ?gh_redirect=FULL_CALLBACK_URL
                  </p>
                </div>
              </div>
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
            className="btn btn-primary btn-wide"
            disabled={!hasClientId}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="mr-2">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Sign in with GitHub
          </button>

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
            className="btn btn-outline btn-wide"
            disabled={!hasClientId}
          >
            Use Device Login (no redirect)
          </button>

          {deviceHint && (
            <div className="alert alert-info">
              <span>ℹ️</span>
              <div>
                <p>
                  1) Visit{' '}
                  <a
                    href={deviceHint.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    {deviceHint.uri}
                  </a>
                </p>
                <p>
                  2) Enter code: <code className="bg-base-200 px-1 rounded">{deviceHint.code}</code>
                </p>
                <p>3) Expires in ~{Math.round(deviceHint.expires / 60)} min</p>
              </div>
            </div>
          )}

          <div className="alert alert-neutral">
            <span>🔒</span>
            <div>
              <p>
                We'll only request the minimum permissions needed to create and deploy your
                websites.
              </p>
              {!hasClientId && (
                <p className="text-error mt-2">
                  Client ID is required. Create an OAuth App and paste its Client ID above.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-lg ${className}`}>
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img src={user?.avatar_url} alt={user?.name || user?.login} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{user?.name || user?.login}</h3>
            <p className="text-base-content/70">@{user?.login}</p>
            <p className="text-sm text-base-content/60">{repositories.length} repositories</p>
            <ScopesBadge />
          </div>
          <div className="card-actions">
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Clears local session (token in this tab). To fully revoke the app, use GitHub settings (see link below)."
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="divider"></div>
        <div className="text-sm text-base-content/70">
          To revoke permissions completely, visit GitHub → Settings → Applications → Authorized
          OAuth Apps.{' '}
          <button className="btn btn-link btn-xs" onClick={() => setHelpOpen('access')}>
            Manage access
          </button>
        </div>
      </div>
      <HelpPanel open={helpOpen === 'access'} onClose={() => setHelpOpen(false)} topic="access" />
    </div>
  );
};

export default GitHubAuth;

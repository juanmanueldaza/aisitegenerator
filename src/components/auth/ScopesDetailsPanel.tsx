import React, { useState } from 'react';
import { HelpPanel } from '@/components/ui';

export interface ScopesDetailsPanelProps {
  open: boolean;
  onClose: () => void;
  scopes: string[];
  onReauth?: () => void;
}

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  public_repo:
    'Create and update public repositories (used to create your website repo and push content).',
  repo: 'Full control of private repositories (not typically required for public Pages).',
  workflow: 'Manage GitHub Actions workflows (used to enable and update Pages deployments).',
  'user:email': 'Read your email address (identifies your account for UI and API calls).',
};

export const ScopesDetailsPanel: React.FC<ScopesDetailsPanelProps> = ({
  open,
  onClose,
  scopes,
  onReauth,
}) => {
  const [helpOpen, setHelpOpen] = useState<false | 'scopes' | 'access'>(false);
  if (!open) return null;
  const list = scopes.length ? scopes : ['public_repo', 'user:email'];
  const missingCritical = !list.includes('public_repo');
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scopes-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
      }}
    >
      <div
        style={{ background: 'white', borderRadius: 8, width: '92%', maxWidth: 600, padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="scopes-title" style={{ margin: 0 }}>
            Permissions & Scopes
          </h3>
          <button className="btn btn-secondary btn-small" onClick={onClose}>
            Close
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
          These permissions are requested to create a repository, push your site, and optionally
          deploy it with GitHub Pages.
        </p>
        <ul style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((s) => (
            <li
              key={s}
              style={{
                listStyle: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '8px 10px',
              }}
            >
              <div style={{ fontWeight: 600 }}>{s}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {SCOPE_DESCRIPTIONS[s] || 'Required by the app to complete requested actions.'}
              </div>
            </li>
          ))}
        </ul>
        {missingCritical && (
          <div
            style={{
              marginTop: 10,
              background: '#fff3cd',
              border: '1px solid #ffecb5',
              color: '#664d03',
              padding: '8px 10px',
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Missing public_repo scope. Deployment and repo creation may be limited. You can
            re-authorize to grant missing scopes.
            {onReauth && (
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-secondary btn-small" onClick={onReauth}>
                  Re-authorize
                </button>
              </div>
            )}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 12 }}>
          To revoke access at any time, visit GitHub → Settings → Applications → Authorized OAuth
          Apps.{' '}
          <button className="btn btn-link btn-small" onClick={() => setHelpOpen('access')}>
            Learn how
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-secondary btn-small" onClick={() => setHelpOpen('scopes')}>
            Learn more
          </button>
        </div>
      </div>
      <HelpPanel open={helpOpen === 'scopes'} onClose={() => setHelpOpen(false)} topic="scopes" />
      <HelpPanel open={helpOpen === 'access'} onClose={() => setHelpOpen(false)} topic="access" />
    </div>
  );
};

export default ScopesDetailsPanel;

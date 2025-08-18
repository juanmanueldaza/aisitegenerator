import React, { useState } from 'react';
import { useGitHub } from '@/hooks/useGitHub';
import { ScopesDetailsPanel } from './ScopesDetailsPanel';

export const ScopesBadge: React.FC = () => {
  const { isAuthenticated, user, scopes, login } = useGitHub();
  const [open, setOpen] = useState(false);
  if (!isAuthenticated || !user) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => setOpen(true)}
        title={`OAuth scopes: ${scopes.join(', ') || 'none'}`}
      >
        Scopes: {scopes.join(', ') || 'none'}
      </button>
      <ScopesDetailsPanel
        open={open}
        onClose={() => setOpen(false)}
        scopes={scopes}
        onReauth={login}
      />
    </div>
  );
};

export default ScopesBadge;

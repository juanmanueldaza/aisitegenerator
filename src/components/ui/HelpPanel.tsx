import React, { useEffect, useState } from 'react';
import { MarkdownView } from './MarkdownView/MarkdownView';

export interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
  topic: 'auth' | 'scopes' | 'pages' | 'access';
}

async function loadTopic(topic: HelpPanelProps['topic']): Promise<string> {
  switch (topic) {
    case 'auth': {
      const mod = await import('@/assets/help/auth.md?raw');
      return (mod as unknown as { default: string }).default || String(mod);
    }
    case 'scopes': {
      const mod = await import('@/assets/help/scopes.md?raw');
      return (mod as unknown as { default: string }).default || String(mod);
    }
    case 'pages': {
      const mod = await import('@/assets/help/pages.md?raw');
      return (mod as unknown as { default: string }).default || String(mod);
    }
    case 'access': {
      const mod = await import('@/assets/help/access.md?raw');
      return (mod as unknown as { default: string }).default || String(mod);
    }
  }
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ open, onClose, topic }) => {
  const [md, setMd] = useState<string>('');
  useEffect(() => {
    if (!open) return;
    loadTopic(topic)
      .then(setMd)
      .catch(() => setMd('# Help\nContent unavailable.'));
  }, [open, topic]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 75,
      }}
    >
      <div
        style={{ background: 'white', borderRadius: 8, width: '96%', maxWidth: 760, padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="help-title" style={{ margin: 0 }}>
            Help
          </h3>
          <button className="btn btn-secondary btn-small" onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <MarkdownView content={md} />
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;

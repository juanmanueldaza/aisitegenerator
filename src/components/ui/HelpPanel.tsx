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
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 id="help-title" className="text-lg font-bold">Help</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="prose max-w-none">
          <MarkdownView content={md} />
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;

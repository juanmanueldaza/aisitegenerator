import React from 'react';
import type { DiffHunk } from '@/utils/diff';
import { buildInlineBlocks } from '@/utils/inlineDiff';

export interface InlineDiffViewProps {
  original: string;
  hunks: DiffHunk[];
}

export const InlineDiffView: React.FC<InlineDiffViewProps> = ({ original, hunks }) => {
  const blocks = buildInlineBlocks(original, hunks, 2);
  if (!hunks.length) return <div style={{ fontSize: 12, color: '#6b7280' }}>No differences</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {blocks.map((block, idx) => (
        <div
          key={idx}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 8, background: '#fafafa' }}>
            {block.left.map((l, i) => (
              <div
                key={i}
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 12,
                  background: l.type === 'remove' ? '#fee2e2' : 'transparent',
                  color: l.type === 'remove' ? '#991b1b' : '#111827',
                }}
              >
                {l.type === 'remove' ? '- ' : l.type === 'context' ? '  ' : '  '}
                {l.text}
              </div>
            ))}
          </div>
          <div style={{ padding: 8, background: '#ffffff' }}>
            {block.right.map((l, i) => (
              <div
                key={i}
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 12,
                  background: l.type === 'add' ? '#dcfce7' : 'transparent',
                  color: l.type === 'add' ? '#166534' : '#111827',
                }}
              >
                {l.type === 'add' ? '+ ' : l.type === 'context' ? '  ' : '  '}
                {l.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InlineDiffView;

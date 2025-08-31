import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DiffHunk } from '@/utils/diff';
import { buildInlineBlocks } from '@/utils/inline-diff';

export interface InlineDiffViewProps {
  original: string;
  hunks: DiffHunk[];
  onActiveChange?: (index: number) => void;
}

export const InlineDiffView: React.FC<InlineDiffViewProps> = ({
  original,
  hunks,
  onActiveChange,
}) => {
  const blocks = useMemo(() => buildInlineBlocks(original, hunks, 2), [original, hunks]);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Reset active when blocks change
    setActive(0);
  }, [blocks.length]);

  useEffect(() => {
    // Scroll currently active block into view
    const el = itemRefs.current[active];
    const canScroll = (
      node: Element | null
    ): node is Element & { scrollIntoView: (opts?: ScrollIntoViewOptions) => void } => {
      return (
        !!node &&
        typeof (node as Element & { scrollIntoView?: unknown }).scrollIntoView === 'function'
      );
    };
    if (canScroll(el)) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [active]);

  useEffect(() => {
    if (onActiveChange) onActiveChange(active);
  }, [active, onActiveChange]);

  if (!hunks.length) return <div className="text-sm text-gray-500 italic">No differences</div>;

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'j') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, blocks.length - 1)));
    } else if (e.key === 'k') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="list"
      aria-label={`Inline diff (${blocks.length} block${blocks.length === 1 ? '' : 's'})`}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, outline: 'none' }}
    >
      {blocks.map((block, idx) => (
        <div
          key={idx}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          role="listitem"
          aria-current={idx === active}
          data-testid={`diff-block-${idx}`}
          data-active={idx === active ? 'true' : 'false'}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: idx === active ? '0 0 0 2px #3b82f6 inset' : 'none',
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

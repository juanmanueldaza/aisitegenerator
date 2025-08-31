export type InlineDiffLine = {
  type: 'context' | 'remove' | 'add';
  text: string;
};

export type InlineDiffBlock = {
  left: InlineDiffLine[]; // original
  right: InlineDiffLine[]; // target
};

import type { DiffHunk } from './diff';

// Build side-by-side blocks from original content and hunks.
// For each hunk, we collect the removed lines on the left and added lines on the right.
// Optionally include a small amount of context above/below when available.
export function buildInlineBlocks(
  original: string,
  hunks: DiffHunk[],
  context = 2
): InlineDiffBlock[] {
  const aLines = original.split(/\r?\n/);
  const blocks: InlineDiffBlock[] = [];
  for (const h of hunks) {
    const start = Math.max(0, h.pos - context);
    const end = Math.min(aLines.length, h.pos + h.remove + context);
    const left: InlineDiffLine[] = [];
    const right: InlineDiffLine[] = [];

    // context before
    for (let i = start; i < h.pos; i++) {
      left.push({ type: 'context', text: aLines[i] });
      right.push({ type: 'context', text: aLines[i] });
    }
    // removed vs added
    for (let i = 0; i < Math.max(h.remove, h.add.length); i++) {
      if (i < h.remove) left.push({ type: 'remove', text: aLines[h.pos + i] });
      else left.push({ type: 'context', text: '' });
      if (i < h.add.length) right.push({ type: 'add', text: h.add[i] });
      else right.push({ type: 'context', text: '' });
    }
    // context after
    for (let i = h.pos + h.remove; i < end; i++) {
      left.push({ type: 'context', text: aLines[i] });
      right.push({ type: 'context', text: aLines[i] });
    }
    blocks.push({ left, right });
  }
  return blocks;
}

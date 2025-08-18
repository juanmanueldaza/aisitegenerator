import { describe, it, expect } from 'vitest';
import { buildInlineBlocks, type InlineDiffLine } from './inlineDiff';
import { computeHunks } from './diff';

describe('inline diff', () => {
  it('builds side-by-side blocks with remove/add lines', () => {
    const a = 'one\ntwo\nthree';
    const b = 'one\nTWO\nTHREE';
    const hunks = computeHunks(a, b);
    const blocks = buildInlineBlocks(a, hunks, 1);
    expect(blocks.length).toBe(1);
    const block = blocks[0];
    // should include context 'one' and changes around 'two'/'three'
    expect(block.left.some((l: InlineDiffLine) => l.type === 'context' && l.text === 'one')).toBe(
      true
    );
    expect(block.left.some((l: InlineDiffLine) => l.type === 'remove')).toBe(true);
    expect(block.right.some((l: InlineDiffLine) => l.type === 'add')).toBe(true);
  });
});

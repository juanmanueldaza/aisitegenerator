import { describe, it, expect } from 'vitest';
import { computeHunks, applyAll } from './diff';

describe('diff utils', () => {
  it('returns empty hunks for identical strings', () => {
    const a = 'line1\nline2';
    const b = 'line1\nline2';
    expect(computeHunks(a, b)).toEqual([]);
  });

  it('computes and applies hunks for simple insert', () => {
    const a = 'a\nb';
    const b = 'a\nX\nb';
    const hunks = computeHunks(a, b);
    const out = applyAll(a, hunks);
    expect(out).toBe(b);
  });

  it('computes and applies hunks for simple replace', () => {
    const a = 'one\ntwo\nthree';
    const b = 'one\nTWO\nTHREE';
    const hunks = computeHunks(a, b);
    const out = applyAll(a, hunks);
    expect(out).toBe(b);
  });
});

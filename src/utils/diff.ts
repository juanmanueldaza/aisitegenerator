export type DiffHunk = {
  pos: number; // start line in original
  remove: number; // number of lines to remove
  add: string[]; // lines to insert
};

// Compute simple line-based hunks between original (a) and target (b)
// Uses a lightweight pass grouping removed+added blocks from a naive LCS-like scan.
export function computeHunks(a: string, b: string): DiffHunk[] {
  const aLines = a.split(/\r?\n/);
  const bLines = b.split(/\r?\n/);

  if (a === b) return [];

  const n = aLines.length;
  const m = bLines.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (aLines[i] === bLines[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const hunks: DiffHunk[] = [];
  let i = 0,
    j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && aLines[i] === bLines[j]) {
      i++;
      j++;
      continue;
    }
    const start = i;
    const addLines: string[] = [];
    let removeCount = 0;
    while (i < n || j < m) {
      if (i < n && j < m && aLines[i] === bLines[j]) break;
      if (j < m && (i === n || dp[i][j + 1] >= (dp[i + 1]?.[j] ?? 0))) {
        addLines.push(bLines[j]);
        j++;
      } else if (i < n) {
        removeCount++;
        i++;
      }
    }
    hunks.push({ pos: start, remove: removeCount, add: addLines });
  }
  return hunks;
}

export function applyHunk(original: string, hunk: DiffHunk): string {
  const lines = original.split(/\r?\n/);
  const before = lines.slice(0, hunk.pos);
  const after = lines.slice(hunk.pos + hunk.remove);
  return [...before, ...hunk.add, ...after].join('\n');
}

export function applyAll(original: string, hunks: DiffHunk[]): string {
  let current = original;
  let offset = 0;
  for (const h of hunks) {
    const adjusted: DiffHunk = { ...h, pos: h.pos + offset } as DiffHunk;
    const beforeLen = current.split(/\r?\n/).length;
    current = applyHunk(current, adjusted);
    const afterLen = current.split(/\r?\n/).length;
    offset += afterLen - beforeLen;
  }
  return current;
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePreviewHTMLAsync } from './content';

// Mock mermaid to avoid heavy rendering and ensure determinism
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (_id: string, code: string) => ({
      svg: `<svg data-mock="1"><text>${code.trim()}</text></svg>`,
    })),
  },
}));

describe('generatePreviewHTMLAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sanitizes scripts from markdown', async () => {
    const md = '# Hi\n\n<script>alert(1)</script>\n\n**ok**';
    const html = await generatePreviewHTMLAsync(md);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Hi');
    // Script tags must be removed by DOMPurify
    expect(html).not.toContain('<script>');
  });

  it('replaces mermaid code blocks with SVG', async () => {
    const md = '```mermaid\nA-->B\n```';
    const html = await generatePreviewHTMLAsync(md);
    expect(html).toContain('<svg');
    // '>' se escapa como entidad HTML en el string resultante
    expect(html).toContain('A--&gt;B');
    // No raw code fence should remain
    expect(html).not.toContain('```mermaid');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock mermaid to avoid heavy rendering and ensure determinism
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (_id: string, code: string) => ({
      svg: `<svg data-mock="1"><text>${code.trim()}</text></svg>`,
    })),
  },
}));

// Importar después del mock para garantizar que Vitest use el mock
import { generatePreviewHTMLAsync } from './content';

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

  it('sanitizes dangerous href and event attributes', async () => {
    const md =
      '[xss](javascript:alert(1))\n\n<a href="https://example.com" onclick="alert(1)">ok</a>';
    const html = await generatePreviewHTMLAsync(md);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain('https://example.com');
    expect(html).not.toContain('onclick=');
  });

  it('falls back to code block when mermaid render fails', async () => {
    // Cambiar implementación del mock de mermaid para este caso
    const mermaid = await import('mermaid');
    // @ts-expect-error mock
    mermaid.default.render.mockImplementationOnce(async () => {
      throw new Error('fail');
    });
    const md = '```mermaid\nA-->B\n```';
    const html = await generatePreviewHTMLAsync(md);
    expect(html).toContain('<pre><code>');
    expect(html).not.toContain('<svg');
    expect(html).toContain('A--&gt;B');
  });
});

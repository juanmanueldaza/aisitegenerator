// Defer heavy libs (marked/Prism/DOMPurify) to lazy init
type MarkedAPI = {
  parse: (src: string) => string | Promise<string>;
  setOptions: (opts: Record<string, unknown>) => void;
  use: (ext: unknown) => void;
};
type DOMPurifyAPI = {
  sanitize: (dirty: string, cfg?: unknown) => string;
};

let _marked: MarkedAPI | null = null;
let _DOMPurify: DOMPurifyAPI | null = null;
let _Prism: typeof import('prismjs') | null = null;
let _markedHighlight: (typeof import('marked-highlight'))['markedHighlight'] | null = null;
let initPromise: Promise<void> | null = null;

async function ensureMarkdownRuntime() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const [markedMod, dompurifyMod, prismMod, mh] = await Promise.all([
      import('marked'),
      import('dompurify'),
      import('prismjs'),
      import('marked-highlight'),
    ]);
    // load minimal language
    await import('prismjs/components/prism-markup');
    _marked = markedMod.marked as unknown as MarkedAPI;
    const dompurifyNs = dompurifyMod as unknown as { default: DOMPurifyAPI };
    _DOMPurify = dompurifyNs.default as DOMPurifyAPI;
    const prismNs = prismMod as unknown as { default?: typeof import('prismjs') };
    _Prism = prismNs.default ?? (prismMod as unknown as typeof import('prismjs'));
    _markedHighlight = (
      mh as unknown as {
        markedHighlight: (typeof import('marked-highlight'))['markedHighlight'];
      }
    ).markedHighlight;

    // Configure marked only once
    _marked!.setOptions({ gfm: true, breaks: true });
    _marked!.use(
      _markedHighlight!({
        highlight(code: string, lang?: string) {
          try {
            const P = _Prism as unknown as {
              languages: Record<string, unknown>;
              highlight: (c: string, g: unknown, l: string) => string;
            };
            const language = lang && P.languages[lang] ? lang : 'markup';
            return P.highlight(code, P.languages[language], language);
          } catch {
            return code;
          }
        },
      })
    );
  })();
  return initPromise;
}

// Safely render markdown content to sanitized HTML
export function renderMarkdown(content: string): string {
  try {
    // Note: this version is synchronous for convenience, but will rely on prior lazy init
    // If not initialized, fall back to plain text escaping
    if (!_marked || !_DOMPurify) {
      // basic escape fallback
      const escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<pre><code>${escaped}</code></pre>`;
    }
    const html = _marked.parse(content) as string;
    return _DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div',
        'span',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'a',
        'img',
        // SVG for Mermaid
        'svg',
        'g',
        'path',
        'circle',
        'ellipse',
        'polygon',
        'polyline',
        'line',
        'rect',
        'text',
        'tspan',
        'defs',
        'marker',
        'linearGradient',
        'stop',
        'clipPath',
        'style',
        // Tables
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
        // Code highlighting wrappers
        'span',
      ],
      ALLOWED_ATTR: [
        'href',
        'rel',
        'src',
        'alt',
        'title',
        'class',
        'id',
        'style',
        'language',
        // Common SVG attributes
        'viewBox',
        'xmlns',
        'width',
        'height',
        'fill',
        'stroke',
        'stroke-width',
        'd',
        'points',
        'x',
        'y',
        'x1',
        'x2',
        'y1',
        'y2',
        'rx',
        'ry',
        'transform',
      ],
    });
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return '<p>Error rendering content</p>';
  }
}

// Generate a complete HTML document for iframe preview
export async function generatePreviewHTMLAsync(content: string): Promise<string> {
  // Ensure markdown runtime is ready for marked parsing
  await ensureMarkdownRuntime();
  // Detect mermaid code blocks and render them to SVG before sanitizing
  const mermaidBlockRegex = /```mermaid\s+([\s\S]*?)```/gi;
  const hasMermaid = mermaidBlockRegex.test(content);
  // Reset regex state for subsequent use
  mermaidBlockRegex.lastIndex = 0;

  let processedMarkdown = content;
  const svgMap = new Map<string, string>();

  if (hasMermaid) {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

    let idx = 0;
    processedMarkdown = processedMarkdown.replace(mermaidBlockRegex, (_m, code: string) => {
      const key = `@@MERMAID_${idx++}@@`;
      svgMap.set(key, code);
      return key;
    });

    // Render all collected diagrams
    for (const [key, code] of svgMap.entries()) {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const res = await mermaid.render(id, String(code));
        svgMap.set(key, res.svg);
      } catch {
        // On failure, degrade to a code block
        svgMap.set(key, `<pre><code>${String(code)}</code></pre>`);
      }
    }
  }

  // First, convert markdown (with placeholders) to HTML
  let html = _marked!.parse(processedMarkdown) as string;

  // Replace placeholders with SVG strings (or fallback) prior to sanitization
  if (svgMap.size) {
    for (const [key, svg] of svgMap.entries()) {
      html = html.replaceAll(key, svg);
    }
  }

  const renderedContent = renderMarkdown(html);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 { margin-bottom: 1rem; color: #111827; }
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    p { margin-bottom: 1rem; }
    ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
    li { margin-bottom: 0.5rem; }
    blockquote { border-left: 4px solid #3b82f6; margin: 1rem 0; padding: 1rem; background: #f8fafc; font-style: italic; }
    code { background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.875rem; }
    pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
    pre code { background: none; padding: 0; color: inherit; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  </style>
</head>
<body>
  ${renderedContent}
</body>
</html>`;
}

// Optional warmup to preload markdown/highlight stack without blocking UI
export function warmupMarkdownRuntime(): Promise<void> {
  return ensureMarkdownRuntime();
}

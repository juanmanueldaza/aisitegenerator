import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import { markedHighlight } from 'marked-highlight';
import 'prismjs/components/prism-markup';

// Configure marked for security and basic features
marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use(
  markedHighlight({
    highlight(code: string, lang?: string) {
      try {
        const P = Prism as unknown as {
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

// Safely render markdown content to sanitized HTML
export function renderMarkdown(content: string): string {
  try {
    const html = marked.parse(content) as string;
    return DOMPurify.sanitize(html, {
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
  let html = marked.parse(processedMarkdown) as string;

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

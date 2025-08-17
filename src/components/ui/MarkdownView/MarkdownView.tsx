import React, { useEffect, useState } from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className }) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('@/utils/content');
        await mod.warmupMarkdownRuntime();
        const rendered = mod.renderMarkdown(content);
        if (mounted) setHtml(rendered);
      } catch {
        if (mounted) setHtml('<p>Error rendering content</p>');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [content]);

  return (
    <div
      className={className}
      // Safe: renderMarkdown sanitizes HTML with DOMPurify
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownView;

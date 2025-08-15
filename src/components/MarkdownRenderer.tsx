import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { MarkdownRendererProps } from '../types/gemini';

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  sanitize = true,
  className = ''
}) => {
  const renderMarkdown = (): { __html: string } => {
    try {
      // Configure marked with secure options
      marked.setOptions({
        gfm: true, // GitHub Flavored Markdown
        breaks: true, // Convert line breaks to <br>
        sanitize: false, // We'll handle sanitization with DOMPurify
        highlight: null // Code highlighting handled by CodeHighlighter component
      });

      let html = marked(content) as string;

      // Sanitize HTML if requested
      if (sanitize) {
        html = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'strong', 'em', 'u', 's',
            'ul', 'ol', 'li',
            'blockquote',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'code', 'pre',
            'hr'
          ],
          ALLOWED_ATTR: {
            'a': ['href', 'title', 'target', 'rel'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'code': ['class'],
            'pre': ['class']
          },
          ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });
      }

      return { __html: html };
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return { __html: '<p>Error rendering content</p>' };
    }
  };

  return (
    <div 
      className={`markdown-renderer ${className}`}
      dangerouslySetInnerHTML={renderMarkdown()}
    />
  );
};

export default MarkdownRenderer;
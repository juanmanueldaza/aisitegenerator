import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { CodeHighlighterProps } from '../types/gemini';

// Dynamically import language components
const loadLanguage = async (language: string) => {
  const normalizedLang = normalizeLanguage(language);
  
  try {
    switch (normalizedLang) {
      case 'javascript':
        await import('prismjs/components/prism-javascript');
        break;
      case 'typescript':
        await import('prismjs/components/prism-typescript');
        break;
      case 'css':
        await import('prismjs/components/prism-css');
        break;
      case 'html':
        await import('prismjs/components/prism-markup');
        break;
      case 'json':
        await import('prismjs/components/prism-json');
        break;
      case 'markdown':
        await import('prismjs/components/prism-markdown');
        break;
    }
  } catch (error) {
    console.warn(`Failed to load syntax highlighting for ${normalizedLang}:`, error);
  }
};

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  title,
  filename,
  showCopy = true,
  onCopy,
  className = ''
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const highlightCode = async () => {
      await loadLanguage(language);
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    };
    
    highlightCode();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy?.(code);
      
      // Show temporary feedback (you could enhance this with a toast notification)
      if (showCopy) {
        console.log('Code copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const normalizedLanguage = normalizeLanguage(language);
  const displayTitle = title || filename || `${normalizedLanguage.toUpperCase()} Code`;

  return (
    <div className={`code-highlighter ${className}`}>
      <div className="code-header">
        <div className="code-info">
          <span className="code-title">{displayTitle}</span>
          {filename && <span className="code-filename">{filename}</span>}
        </div>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="copy-button"
            title="Copy to clipboard"
            aria-label="Copy code to clipboard"
          >
            <CopyIcon />
          </button>
        )}
      </div>
      <pre className={`language-${normalizedLanguage}`}>
        <code
          ref={codeRef}
          className={`language-${normalizedLanguage}`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};

function normalizeLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    md: 'markdown',
    htm: 'html',
    xml: 'html'
  };

  const normalized = language.toLowerCase();
  return languageMap[normalized] || normalized;
}

/**
 * Copy icon SVG component
 */
const CopyIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export default CodeHighlighter;
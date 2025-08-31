/**
 * useSyntaxHighlighting Hook
 * Manages PrismJS loading and language detection for syntax highlighting
 */

import { useState, useEffect, useCallback } from 'react';

// Lazy load PrismJS for syntax highlighting
let Prism: unknown = null;
let prismLoaded = false;

async function loadPrism() {
  if (prismLoaded) return Prism;
  try {
    const [prismMod] = await Promise.all([import('prismjs')]);
    Prism = prismMod.default || prismMod;

    // Load common language components
    await Promise.all([
      import('prismjs/components/prism-markup'),
      import('prismjs/components/prism-css'),
      import('prismjs/components/prism-javascript'),
      import('prismjs/components/prism-typescript'),
    ]);

    prismLoaded = true;
    return Prism;
  } catch (error) {
    console.warn('Failed to load PrismJS:', error);
    return null;
  }
}

// Detect language from content
function detectLanguage(content: string): string {
  const trimmed = content.trim();

  // Check for HTML
  if (
    trimmed.includes('<!DOCTYPE html>') ||
    (trimmed.includes('<html') && trimmed.includes('</html>')) ||
    (trimmed.includes('<div') && trimmed.includes('</div>')) ||
    /^<\w+.*>/.test(trimmed)
  ) {
    return 'markup';
  }

  // Check for CSS
  if (
    trimmed.includes('{') &&
    trimmed.includes('}') &&
    (trimmed.includes(';') || trimmed.includes(':')) &&
    !trimmed.includes('<')
  ) {
    return 'css';
  }

  // Check for JavaScript/TypeScript
  if (
    trimmed.includes('function') ||
    trimmed.includes('const') ||
    trimmed.includes('let') ||
    trimmed.includes('var') ||
    trimmed.includes('=>') ||
    trimmed.includes('console.log')
  ) {
    // Check for TypeScript-specific syntax
    if (
      trimmed.includes(': string') ||
      trimmed.includes(': number') ||
      trimmed.includes(': boolean') ||
      trimmed.includes('interface ') ||
      trimmed.includes('type ')
    ) {
      return 'typescript';
    }
    return 'javascript';
  }

  // Default to markup for HTML-like content
  return 'markup';
}

export interface UseSyntaxHighlightingReturn {
  syntaxHighlighting: boolean;
  detectedLanguage: string;
  updateLanguage: (content: string) => void;
  highlightCode: (code: string, language?: string) => string;
}

export function useSyntaxHighlighting(initialContent: string = ''): UseSyntaxHighlightingReturn {
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(() => detectLanguage(initialContent));

  // Load PrismJS on mount
  useEffect(() => {
    loadPrism().then(() => {
      setSyntaxHighlighting(true);
    });
  }, []);

  // Update detected language when content changes
  const updateLanguage = useCallback((content: string) => {
    setDetectedLanguage(detectLanguage(content));
  }, []);

  // Highlight code using PrismJS
  const highlightCode = useCallback(
    (code: string, language?: string) => {
      if (!syntaxHighlighting || !Prism) {
        return code;
      }

      try {
        const lang = language || detectedLanguage;
        // Type assertion for PrismJS
        const prismInstance = Prism as {
          highlight: (code: string, grammar: unknown, language: string) => string;
          languages: Record<string, unknown>;
        };

        if (prismInstance.highlight && prismInstance.languages[lang]) {
          return prismInstance.highlight(code, prismInstance.languages[lang], lang);
        }
      } catch (error) {
        console.warn('Syntax highlighting failed:', error);
      }

      return code;
    },
    [syntaxHighlighting, detectedLanguage]
  );

  return {
    syntaxHighlighting,
    detectedLanguage,
    updateLanguage,
    highlightCode,
  };
}

// Types for Gemini AI responses and processing
export interface GeminiResponse {
  id: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'markdown' | 'suggestion' | 'error';
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  language?: string;
  title?: string;
  actions?: SuggestionAction[];
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface SuggestionAction {
  id: string;
  label: string;
  type: 'apply' | 'preview' | 'copy' | 'modify';
  payload?: any;
}

export interface CodeBlock {
  language: string;
  code: string;
  title?: string;
  filename?: string;
}

export interface ParsedResponse {
  type: GeminiResponse['type'];
  content: string;
  codeBlocks: CodeBlock[];
  suggestions: SuggestionAction[];
  error?: ResponseMetadata['error'];
}

// Props for response display components
export interface ResponseDisplayProps {
  response: GeminiResponse;
  onAction?: (action: SuggestionAction) => void;
  className?: string;
}

export interface CodeHighlighterProps {
  code: string;
  language: string;
  title?: string;
  filename?: string;
  showCopy?: boolean;
  onCopy?: (code: string) => void;
}

export interface MarkdownRendererProps {
  content: string;
  sanitize?: boolean;
  className?: string;
}

export interface SuggestionButtonProps {
  action: SuggestionAction;
  onAction: (action: SuggestionAction) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export interface ErrorDisplayProps {
  error: ResponseMetadata['error'];
  onRetry?: () => void;
  className?: string;
}
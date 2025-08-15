export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface WebsiteConfig {
  title: string;
  description: string;
  theme: string;
  content: {
    pages: Page[];
  };
}

export interface Page {
  id: string;
  title: string;
  content: string;
  path: string;
}

export interface SuggestionAction {
  type: 'apply' | 'preview' | 'modify';
  content: string;
  target?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  retryable: boolean;
}
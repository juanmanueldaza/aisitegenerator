// Common type definitions for the AI Site Generator application

// User authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

// GitHub integration types
export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
}

// Site generation types
export interface SiteConfiguration {
  id: string;
  name: string;
  description?: string;
  template: string;
  theme: string;
  pages: SitePage[];
  metadata: SiteMetadata;
}

export interface SitePage {
  id: string;
  title: string;
  path: string;
  content: string;
  metadata: PageMetadata;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  language: string;
}

export interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
}

// AI Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  siteId?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
// Settings types
export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
}

export interface ProviderConfig {
  name: string;
  displayName: string;
  apiKeyEnv: string;
  models: string[];
  defaultModel: string;
  description: string;
}

export interface ApiKeyStatus {
  provider: string;
  configured: boolean;
  hasKey: boolean;
}

export interface SettingsState {
  activeSection: string;
  apiKeys: Record<string, string>;
  selectedProvider: string;
  testResults: Record<string, boolean>;
}

// Editor types
export type ViewMode = 'browser' | 'mobile' | 'tablet' | 'desktop';

export type LanguageType = 'markup' | 'css' | 'javascript' | 'typescript';

export interface EditorState {
  content: string;
  isDirty: boolean;
  detectedLanguage: LanguageType;
  viewMode: ViewMode;
  syntaxHighlighting: boolean;
}

export interface EditorActions {
  handleContentChange: (content: string) => void;
  handleSave: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  setViewMode: (mode: ViewMode) => void;
}

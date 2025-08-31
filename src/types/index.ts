/**
 * Main application types following SOLID principles
 * Comprehensive type definitions for the AI Site Generator
 */

// User authentication types
export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string | null;
  readonly avatarUrl?: string;
  readonly name?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// GitHub integration types
export interface GitHubRepository {
  readonly id: number;
  readonly name: string;
  readonly fullName: string;
  readonly private: boolean;
  readonly htmlUrl: string;
  readonly cloneUrl: string;
  readonly description?: string;
  readonly language?: string;
  readonly stargazersCount: number;
  readonly forksCount: number;
  readonly openIssuesCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Site generation types following Interface Segregation
export interface SiteConfiguration {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly template: string;
  readonly theme: string;
  readonly pages: readonly SitePage[];
  readonly metadata: SiteMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SitePage {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly content: string;
  readonly metadata: PageMetadata;
  readonly order?: number;
}

export interface SiteMetadata {
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly author: string;
  readonly language: string;
  readonly ogImage?: string;
  readonly twitterCard?: string;
}

export interface PageMetadata {
  readonly title: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly ogImage?: string;
  readonly canonicalUrl?: string;
}

// AI Chat types following Single Responsibility
export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface ChatSession {
  readonly id: string;
  readonly messages: readonly ChatMessage[];
  readonly siteId?: string;
  readonly title?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// API Response types with enhanced error handling
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: Date;
  readonly requestId?: string;
}

// Error types following Interface Segregation
export interface AppError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
}

// Settings types with better organization
export interface SettingsSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
  readonly component: React.ComponentType;
  readonly order?: number;
}

export interface ProviderConfig {
  readonly name: string;
  readonly displayName: string;
  readonly apiKeyEnv: string;
  readonly models: readonly string[];
  readonly defaultModel: string;
  readonly description: string;
  readonly website?: string;
  readonly maxTokens?: number;
}

export interface ApiKeyStatus {
  readonly provider: string;
  readonly configured: boolean;
  readonly hasKey: boolean;
  readonly lastValidated?: Date;
}

export interface SettingsState {
  readonly activeSection: string;
  readonly apiKeys: Readonly<Record<string, string>>;
  readonly selectedProvider: string;
  readonly testResults: Readonly<Record<string, boolean>>;
  readonly isLoading: boolean;
  readonly error?: string;
}

// Editor types following Single Responsibility
export type ViewMode = 'browser' | 'mobile' | 'tablet' | 'desktop';

export type LanguageType = 'markup' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown';

export interface EditorState {
  readonly content: string;
  readonly isDirty: boolean;
  readonly detectedLanguage: LanguageType;
  readonly viewMode: ViewMode;
  readonly syntaxHighlighting: boolean;
  readonly wordCount: number;
  readonly lineCount: number;
}

export interface EditorActions {
  readonly handleContentChange: (content: string) => void;
  readonly handleSave: () => Promise<void>;
  readonly handleUndo: () => void;
  readonly handleRedo: () => void;
  readonly setViewMode: (mode: ViewMode) => void;
  readonly toggleSyntaxHighlighting: () => void;
  readonly formatContent: () => void;
}

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

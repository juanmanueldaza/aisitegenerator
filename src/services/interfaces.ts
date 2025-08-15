// Service layer following Dependency Inversion Principle (SOLID)
// Abstract interfaces that higher-level modules depend on

import type { User, GitHubRepository, SiteConfiguration, ApiResponse } from '@types';

/**
 * Abstract authentication service interface
 * Following Interface Segregation Principle
 */
export interface IAuthService {
  login(): Promise<ApiResponse<User>>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  isAuthenticated(): boolean;
}

/**
 * Abstract GitHub integration service interface
 */
export interface IGitHubService {
  getRepositories(): Promise<ApiResponse<GitHubRepository[]>>;
  createRepository(name: string, description?: string): Promise<ApiResponse<GitHubRepository>>;
  deployToPages(repoName: string, content: string): Promise<ApiResponse<string>>;
}

/**
 * Abstract site generation service interface
 */
export interface ISiteService {
  createSite(config: Partial<SiteConfiguration>): Promise<ApiResponse<SiteConfiguration>>;
  updateSite(
    id: string,
    updates: Partial<SiteConfiguration>
  ): Promise<ApiResponse<SiteConfiguration>>;
  deleteSite(id: string): Promise<ApiResponse<void>>;
  getSite(id: string): Promise<ApiResponse<SiteConfiguration>>;
  listSites(): Promise<ApiResponse<SiteConfiguration[]>>;
}

/**
 * Abstract AI chat service interface
 */
export interface IAIService {
  sendMessage(message: string, context?: Record<string, unknown>): Promise<ApiResponse<string>>;
  generateSiteContent(prompt: string): Promise<ApiResponse<string>>;
  generatePageContent(prompt: string, pageType: string): Promise<ApiResponse<string>>;
}

// Concrete implementations will be created in separate files
// This follows the Dependency Inversion Principle - high-level modules
// depend on abstractions, not on concrete implementations

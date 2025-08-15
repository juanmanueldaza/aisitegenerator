export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_pages: boolean;
  default_branch: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

export interface SiteConfig {
  name: string;
  description: string;
  theme: string;
  pages: Page[];
}

export interface Page {
  id: string;
  title: string;
  content: string;
  path: string;
  layout: string;
}

export interface AIResponse {
  text: string;
  suggestions?: string[];
}

export interface DeploymentStatus {
  status: 'pending' | 'success' | 'error';
  message: string;
  url?: string;
}
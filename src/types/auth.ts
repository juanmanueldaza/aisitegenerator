export interface User {
  login: string;
  avatar_url: string;
  html_url: string;
  id: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GitHubAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}
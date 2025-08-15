export interface User {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  clearError: () => void;
}

export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubUserResponse {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}
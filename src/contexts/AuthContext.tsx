import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';
import { TokenStorage, GitHubAuthService } from '../services/auth';

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'SIGN_OUT_START' }
  | { type: 'SIGN_OUT_SUCCESS' }
  | { type: 'SIGN_OUT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      };
    case 'SIGN_OUT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'SIGN_OUT_SUCCESS':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case 'SIGN_OUT_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
interface AuthContextType {
  state: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  revokePermissions: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenStorage.getToken();
      const user = TokenStorage.getUser();

      if (token && user) {
        // Validate token is still valid
        const isValid = await GitHubAuthService.validateToken(token);
        if (isValid) {
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } else {
          // Token is invalid, clear storage
          TokenStorage.clear();
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please sign in again.' });
        }
      } else {
        dispatch({ type: 'SIGN_OUT_SUCCESS' });
      }
    };

    initializeAuth();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        dispatch({ type: 'AUTH_ERROR', payload: `OAuth error: ${error}` });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state) {
        dispatch({ type: 'AUTH_START' });
        try {
          const { token, user } = await GitHubAuthService.handleCallback(code, state);
          TokenStorage.setToken(token);
          TokenStorage.setUser(user);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Authentication failed' });
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, []);

  const signIn = async () => {
    dispatch({ type: 'AUTH_START' });
    try {
      await GitHubAuthService.initiateOAuth();
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Failed to initiate authentication' });
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SIGN_OUT_START' });
    try {
      await GitHubAuthService.signOut(state.token || undefined);
      dispatch({ type: 'SIGN_OUT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SIGN_OUT_ERROR', payload: error instanceof Error ? error.message : 'Failed to sign out' });
    }
  };

  const revokePermissions = async () => {
    dispatch({ type: 'SIGN_OUT_START' });
    try {
      if (state.token) {
        await GitHubAuthService.revokeToken(state.token);
      }
      await GitHubAuthService.signOut(state.token || undefined);
      dispatch({ type: 'SIGN_OUT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SIGN_OUT_ERROR', payload: error instanceof Error ? error.message : 'Failed to revoke permissions' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    signIn,
    signOut,
    revokePermissions,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
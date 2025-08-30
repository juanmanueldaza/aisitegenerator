// Safe env reader that works in Vite (browser) and Node (server/tools)
export function readEnv(...keys: string[]): string | undefined {
  // Prefer Vite's import.meta.env (only exposes VITE_* variables)
  let viteEnv: Record<string, string | undefined> | undefined;
  // Narrow import.meta type safely
  const im = (typeof import.meta !== 'undefined' ? (import.meta as unknown) : undefined) as
    | { env?: Record<string, string | undefined> }
    | undefined;
  if (im && im.env) viteEnv = im.env;
  if (viteEnv) {
    for (const k of keys) {
      const v = viteEnv[k];
      if (typeof v !== 'undefined') return v;
    }
  }
  // Optionally read from process.env when available (SSR/tests)
  // Guard against ReferenceError in the browser
  const hasProcess =
    typeof process !== 'undefined' && typeof (process as { env?: unknown }).env !== 'undefined';
  if (hasProcess) {
    const penv = (process as { env: Record<string, string | undefined> }).env;
    for (const k of keys) {
      const v = penv[k];
      if (typeof v !== 'undefined') return v;
    }
  }
  return undefined;
}

// Application configuration constants
export const APP_CONFIG = {
  APP_NAME: 'AI Site Generator',
  VERSION: readEnv('VITE_APP_VERSION', 'REACT_APP_VERSION') || '1.0.0',
  GITHUB_CLIENT_ID: readEnv('VITE_GITHUB_CLIENT_ID', 'REACT_APP_GITHUB_CLIENT_ID') || '',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml'],
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: readEnv('VITE_API_URL', 'REACT_APP_API_URL') || 'http://localhost:3001',
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
} as const;

// Simplified proxy configuration - single source of truth
export const PROXY_CONFIG = {
  // Single proxy endpoint - no complex fallbacks
  BASE_URL: readEnv('VITE_AI_PROXY_BASE_URL', 'REACT_APP_AI_PROXY_BASE_URL') || '',

  // Clean boolean to determine proxy mode
  ENABLED: Boolean(readEnv('VITE_AI_PROXY_BASE_URL', 'REACT_APP_AI_PROXY_BASE_URL')?.trim()),

  // Health check endpoint
  HEALTH_ENDPOINT: '/health',

  // Provider capability endpoint
  PROVIDERS_ENDPOINT: '/providers',
} as const;

// Simplified AI configuration
export const AI_CONFIG = {
  // Single proxy base URL - simplified from multiple proxy configurations
  PROXY_BASE_URL: PROXY_CONFIG.BASE_URL,

  // Client-side defaults for chat provider/model
  DEFAULT_PROVIDER: (
    readEnv('VITE_AI_DEFAULT_PROVIDER', 'REACT_APP_AI_DEFAULT_PROVIDER') || 'google'
  ).toLowerCase(),
  DEFAULT_MODEL:
    readEnv('VITE_AI_DEFAULT_MODEL', 'REACT_APP_AI_DEFAULT_MODEL') || 'gemini-2.0-flash',
} as const;

// Proxy utility functions for clean mode detection
export const ProxyUtils = {
  /**
   * Clean boolean check for proxy mode - no complex fallbacks
   */
  isEnabled: () => PROXY_CONFIG.ENABLED,

  /**
   * Get proxy base URL with validation
   */
  getBaseUrl: () => {
    const url = PROXY_CONFIG.BASE_URL;
    if (!url || !url.trim()) {
      throw new Error('Proxy is not configured. Set VITE_AI_PROXY_BASE_URL or REACT_APP_AI_PROXY_BASE_URL');
    }
    return url.replace(/\/$/, ''); // Remove trailing slash
  },

  /**
   * Get full proxy endpoint URL
   */
  getEndpointUrl: (endpoint: string) => {
    const base = ProxyUtils.getBaseUrl();
    return `${base}${endpoint}`;
  },

  /**
   * Validate proxy configuration
   */
  validate: () => {
    if (!PROXY_CONFIG.BASE_URL?.trim()) {
      return { valid: false, error: 'Proxy base URL is not configured' };
    }

    try {
      new URL(PROXY_CONFIG.BASE_URL);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Proxy base URL is not a valid URL' };
    }
  },

  /**
   * Check if proxy is healthy (async)
   */
  checkHealth: async (): Promise<boolean> => {
    if (!ProxyUtils.isEnabled()) {
      return false;
    }

    try {
      const healthUrl = ProxyUtils.getEndpointUrl(PROXY_CONFIG.HEALTH_ENDPOINT);
      const response = await fetch(healthUrl, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
} as const;

// Safe env reader that works in Vite (browser) and Node (server/tools)
function readEnv(...keys: string[]): string | undefined {
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

// Optional AI proxy configuration (server that calls Gemini securely)
export const AI_CONFIG = {
  // Prefer VITE_* in Vite projects; keep REACT_APP_* as a fallback for compatibility
  PROXY_BASE_URL: readEnv('VITE_AI_PROXY_BASE_URL', 'REACT_APP_AI_PROXY_BASE_URL') || '', // e.g., '/api/ai'
} as const;

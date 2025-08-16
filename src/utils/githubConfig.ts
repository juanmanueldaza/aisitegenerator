// Utilities to manage GitHub OAuth runtime configuration

const CLIENT_ID_KEY = 'github_client_id';
const REDIRECT_URI_KEY = 'github_redirect_uri';

export function getRuntimeClientId(): string | null {
  try {
    const stored = localStorage.getItem(CLIENT_ID_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore localStorage access issues
  }

  // Also support URL param ?gh_client_id=...
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('gh_client_id');
    if (fromQuery && fromQuery.trim()) return fromQuery.trim();
  } catch {
    // ignore URL parsing issues
  }

  return null;
}

export function setRuntimeClientId(clientId: string) {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

export function clearRuntimeClientId() {
  localStorage.removeItem(CLIENT_ID_KEY);
}

// Optional: allow overriding redirect_uri at runtime for OAuth flows
export function getRuntimeRedirectUri(): string | null {
  // URL param takes precedence
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('gh_redirect');
    if (fromQuery && fromQuery.trim()) return fromQuery.trim();
  } catch {
    // ignore URL parsing issues
  }
  try {
    const stored = localStorage.getItem(REDIRECT_URI_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore localStorage access issues
  }
  return null;
}

export function setRuntimeRedirectUri(uri: string) {
  localStorage.setItem(REDIRECT_URI_KEY, uri.trim());
}

export function clearRuntimeRedirectUri() {
  localStorage.removeItem(REDIRECT_URI_KEY);
}

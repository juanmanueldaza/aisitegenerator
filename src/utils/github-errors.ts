export type NormalizedGitHubError = {
  code:
    | 'unauthorized'
    | 'forbidden'
    | 'rate_limited'
    | 'not_found'
    | 'validation'
    | 'server'
    | 'network'
    | 'unknown';
  message: string;
  retryAfterMs?: number;
  status?: number;
};

export function normalizeGitHubError(
  err: unknown,
  status?: number,
  headers?: Headers
): NormalizedGitHubError {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  // Rate limit headers
  let retryAfterMs: number | undefined;
  const ra = headers?.get('Retry-After');
  if (ra) {
    const n = Number(ra);
    if (!Number.isNaN(n)) retryAfterMs = n * 1000;
  }

  if (status === 401 || /unauthorized|bad credentials/.test(lower)) {
    return { code: 'unauthorized', message: 'GitHub: Unauthorized. Please sign in again.', status };
  }
  if (status === 403 && headers?.get('X-RateLimit-Remaining') === '0') {
    const reset = headers?.get('X-RateLimit-Reset');
    const resetAt = reset ? new Date(Number(reset) * 1000) : null;
    const when = resetAt ? ` Try after ${resetAt.toLocaleTimeString()}.` : '';
    return {
      code: 'rate_limited',
      message: 'GitHub: Rate limit exceeded.' + when,
      retryAfterMs,
      status,
    };
  }
  if (status === 403) {
    return {
      code: 'forbidden',
      message: 'GitHub: Access forbidden. Check repository permissions or scopes.',
      status,
    };
  }
  if (status === 404) {
    return { code: 'not_found', message: 'GitHub: Resource not found.', status };
  }
  if (status && status >= 500) {
    return { code: 'server', message: 'GitHub: Temporary server error. Please retry.', status };
  }
  if (/validation|unprocessable/.test(lower)) {
    return {
      code: 'validation',
      message: 'GitHub: Validation error. Please verify inputs.',
      status,
    };
  }
  if (/network/.test(lower)) {
    return {
      code: 'network',
      message: 'GitHub: Network error. Check your connection and retry.',
      status,
    };
  }
  return { code: 'unknown', message: `GitHub error: ${msg}`, status };
}

export async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

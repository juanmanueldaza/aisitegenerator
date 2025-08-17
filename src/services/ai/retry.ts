// Exponential backoff with jitter for retrying transient AI errors
export interface RetryOptions {
  maxAttempts?: number; // total attempts including the first
  baseDelayMs?: number; // initial backoff delay
  maxDelayMs?: number; // cap backoff delay
  shouldRetry?: (err: unknown, attempt: number) => boolean;
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 800,
    maxDelayMs = 8000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = opts;

  let attempt = 0;
  let lastErr: unknown;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt >= maxAttempts || !shouldRetry(err, attempt)) break;

      // Respect Retry-After if provided
      let delay = backoffDelay(attempt, baseDelayMs, maxDelayMs);
      const retryAfterMs = getRetryAfterMs(err);
      if (retryAfterMs != null) {
        delay = Math.min(retryAfterMs, maxDelayMs);
      }
      onRetry?.({ attempt, delayMs: delay, error: err });
      await sleep(delay);
    }
  }
  // Re-throw with original type
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function defaultShouldRetry(err: unknown) {
  const e = toHttpLikeError(err);
  const msg: string = e.message || '';
  const status: number | undefined = e.status;
  if (status === 429) return true;
  if (status && status >= 500) return true;
  if (/rate|quota|429/i.test(msg)) return true;
  if (/temporar|timeout|network|failed fetch|etimedout|econnreset/i.test(msg)) return true;
  return false;
}

function backoffDelay(attempt: number, base: number, cap: number) {
  // Exponential backoff with jitter
  const exp = Math.min(cap, base * Math.pow(2, attempt - 1));
  const jitter = Math.random() * (exp * 0.25);
  return Math.min(cap, Math.floor(exp + jitter));
}

function getRetryAfterMs(err: unknown): number | null {
  const e = toHttpLikeError(err);
  const retryAfter = e.headers?.get?.('retry-after');
  if (!retryAfter) return null;
  const n = Number(retryAfter);
  if (!Number.isNaN(n)) return n * 1000;
  // HTTP-date format not handled; ignore for simplicity
  return null;
}

// Minimal shape extractor for common fetch/HTTP errors
function toHttpLikeError(err: unknown): {
  message: string;
  status?: number;
  headers?: { get?: (name: string) => string | null };
} {
  const anyErr = err as Record<string, unknown> | undefined;
  const message = (anyErr?.message as string) || '';
  // Prefer response.status, then status
  const status = (anyErr?.response as Record<string, unknown> | undefined)?.status as
    | number
    | undefined;
  const headers = (anyErr?.response as Record<string, unknown> | undefined)?.headers as
    | { get?: (name: string) => string | null }
    | undefined;
  return { message, status: status ?? (anyErr?.status as number | undefined), headers };
}

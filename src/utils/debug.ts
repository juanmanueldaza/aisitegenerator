// Centralized auth debug helpers

export function isAuthDebugEnabled(): boolean {
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('auth_debug');
    if (q === '1') return true;
    if (q === '0') return false;
  } catch {
    // ignore URL parsing issues
  }
  try {
    const flag = localStorage.getItem('auth_debug');
    if (flag === '1') return true;
    if (flag === '0') return false;
  } catch {
    // ignore localStorage access issues
  }
  // Enable by default in dev to help diagnose
  // Vite exposes import.meta.env.DEV at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env: any = (import.meta as any).env || {};
  return !!env.DEV;
}

export function mask(
  value: string | null | undefined,
  opts: { head?: number; tail?: number } = {}
) {
  if (!value) return '(empty)';
  const head = opts.head ?? 4;
  const tail = opts.tail ?? 3;
  if (value.length <= head + tail) return '*'.repeat(value.length);
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dlog(...args: any[]) {
  if (!isAuthDebugEnabled()) return;
  console.log('[AUTH]', ...args);
}

// Helper utilities that enforce explicit origin when using window.postMessage
// Avoids broadcasting to '*' and provides an origin validation helper.

export function getTrustedParentOrigin(): string | null {
  // Prefer an explicit environment variable set during build/runtime
  try {
    // process.env is available at build time in most bundlers for NEXT_PUBLIC_* vars
    // eslint-disable-next-line no-undef
    const env = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_PARENT_ORIGIN as string | undefined) : undefined;
    if (env) return env;
  } catch {
    // ignore
  }

  // Try to derive origin from document.referrer (when embedded in an iframe)
  if (typeof document !== 'undefined') {
    try {
      const ref = document.referrer;
      if (ref) return new URL(ref).origin;
    } catch {
      // fallthrough
    }
    // fallback to same-origin
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  }

  return null;
}

export function postToParent(message: unknown) {
  const origin = getTrustedParentOrigin();
  if (!origin) {
    // Do not send to '*' — fail closed for safety
    // This prevents broadcasting messages to unknown origins.
    // Log for debugging, but don't send.
    // eslint-disable-next-line no-console
    console.warn('postToParent suppressed because no trusted parent origin could be determined. Set NEXT_PUBLIC_PARENT_ORIGIN to fix.');
    return;
  }
  try {
    window.parent.postMessage(message, origin);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('postToParent failed:', err);
  }
}

export function isTrustedEventOrigin(event: MessageEvent) {
  const trusted = getTrustedParentOrigin();
  if (!trusted) {
    // If no trusted origin configured, fall back to same-origin check
    try {
      return event.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return event.origin === trusted;
}

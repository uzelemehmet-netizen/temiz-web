/**
 * Minimal fetch wrapper used during dev+SSR. In the real project this may
 * add headers, cookie handling, or a base URL — for local preview we just
 * forward to the native fetch implementation.
 */
export default function updatedFetch(input: RequestInfo | URL, init?: RequestInit) {
  // Defer to global fetch which is available in modern Node and browsers.
  return globalThis.fetch(input as any, init as any);
}

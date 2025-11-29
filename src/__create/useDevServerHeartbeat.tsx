import { useEffect } from 'react';

// Top-level dev heartbeat stub expected by root.tsx
export function useDevServerHeartbeat() {
  useEffect(() => {
    // no-op for local dev preview
    return () => {};
  }, []);
}

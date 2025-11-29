import { useEffect } from 'react';

// Minimal heartbeat used for the dev sandbox. No-op in production.
export function useDevServerHeartbeat() {
  useEffect(() => {
    // Intentionally empty — the app expects this hook to exist in dev builds
    return () => {};
  }, []);
}

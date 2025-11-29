import type { Plugin } from 'vite';

// Lightweight plugin keeping NEXT_PUBLIC_ env semantics available if the
// project expects special handling — currently a noop that keeps import
// resolution working for development.
export function nextPublicProcessEnv(): Plugin {
  return {
    name: 'next-public-process-env',
  };
}

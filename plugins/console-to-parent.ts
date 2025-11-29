import type { Plugin } from 'vite';

// Minimal, safe plugin stub for console forwarding in the dev sandbox.
// The project previously referenced a console-to-parent plugin. For local dev
// we provide a small stub so import resolution succeeds; behaviour can be
// expanded later if you need runtime console forwarding.
export default function consoleToParent(): Plugin {
  return {
    name: 'console-to-parent',
    // intentionally minimal — no transforms here, just provide a plugin object
  };
}

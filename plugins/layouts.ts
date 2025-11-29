import type { Plugin } from 'vite';

// Minimal layout wrapper plugin.
// This keeps a named export `layoutWrapperPlugin` that the Vite config expects.
// It's intentionally conservative and does not mutate files — it only exists so
// config imports resolve. Future behavior (e.g., adding noLayout queries)
// can be implemented here if needed.
export function layoutWrapperPlugin(): Plugin {
  return {
    name: 'layout-wrapper-plugin',
    enforce: 'pre',
  };
}

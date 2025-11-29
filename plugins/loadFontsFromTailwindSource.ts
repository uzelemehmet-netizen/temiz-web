import type { Plugin } from 'vite';

// Small no-op plugin to satisfy import in vite.config.ts. The real plugin
// used in the project originally helped load fonts found in Tailwind sources.
// For local development we don't need extra behaviour — just provide a stable
// plugin object to avoid resolution errors.
export function loadFontsFromTailwindSource(): Plugin {
  return {
    name: 'load-fonts-from-tailwind-source',
    resolveId(id) {
      if (id === 'virtual:load-fonts.jsx') return id;
      return null;
    },
    load(id) {
      if (id !== 'virtual:load-fonts.jsx') return null;
      // Provide a tiny React component so imports of `virtual:load-fonts.jsx`
      // resolve during dev. The real implementation scans tailwind sources
      // and generates <link rel="preload"> for fonts — not required here.
      return `import React from 'react';\nexport function LoadFonts() { return null; }\nexport default LoadFonts;`;
    },
  };
}

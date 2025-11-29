import React from 'react';

// Exported at top-level `src/__create/HotReload` so imports from
// `src/app/root.tsx` resolve correctly.
export function HotReloadIndicator(): JSX.Element | null {
  // Keep it minimal — we purposely avoid DOM operations here.
  return null;
}

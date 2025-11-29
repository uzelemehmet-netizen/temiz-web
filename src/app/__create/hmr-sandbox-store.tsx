import { useCallback } from 'react';

// Small stub store used by the dev environment to track codegen/refresh state.
// The real project has richer state; for local preview we expose the hooks used
// by components in a minimal no-op fashion.
export function useSandboxStore() {
  const noOp = useCallback(() => {}, []);
  return {
    startCodeGen: noOp,
    setCodeGenGenerating: noOp,
    completeCodeGen: noOp,
    errorCodeGen: noOp,
    stopCodeGen: noOp,
  };
}

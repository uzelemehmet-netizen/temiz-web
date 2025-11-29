import { useCallback } from 'react';

// Top-level stub so imports like `../__create/hmr-sandbox-store` resolve.
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

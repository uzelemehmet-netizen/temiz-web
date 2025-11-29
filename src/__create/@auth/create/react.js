import React, { createContext, useContext } from 'react';

// Minimal stub of the `@auth/create/react` runtime used in dev to avoid
// making real network requests for session state. This mirrors a tiny
// subset of the real API: `SessionProvider`, `useSession`, `signIn`, `signOut`.

const SessionContext = createContext({ session: null });

export function SessionProvider({ children }) {
  return React.createElement(SessionContext.Provider, { value: { session: null } }, children);
}

export function useSession() {
  const ctx = useContext(SessionContext);
  return [ctx.session, false];
}

export async function signIn() {
  // no-op stub
  return { ok: true };
}

export async function signOut() {
  // no-op stub
  return { ok: true };
}

export default {
  SessionProvider,
  useSession,
  signIn,
  signOut,
};

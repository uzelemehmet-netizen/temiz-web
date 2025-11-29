import * as React from 'react';
import { useSession } from "@auth/create/react";


const useUser = () => {
  const { data: session, status } = useSession();
  const id = session?.user?.id

  const [user, setUser] = React.useState(session?.user ?? null);

  const fetchUser = React.useCallback(async (session) => {
  return session?.user;
}, [])

  const refetchUser = React.useCallback(() => {
    // Use standard NODE_ENV to determine production mode rather than a vendor-specific
    // environment variable. This avoids coupling to a third-party vendor.
    if(process.env.NODE_ENV === 'production') {
      if (id) {
        fetchUser(session).then(setUser);
      } else {
        setUser(null);
      }
    }
  }, [fetchUser, id])

  React.useEffect(refetchUser, [refetchUser]);

  if (process.env.NODE_ENV !== 'production') {
    return { user, data: session?.user || null, loading: status === 'loading', refetch: refetchUser };
  }
  return { user, data: user, loading: status === 'loading' || (status === 'authenticated' && !user), refetch: refetchUser };
};

export { useUser }

export default useUser;
import { useCallback, useState } from "react";
import type { AppUser } from "@/types/hms";
import { getSession, login as signInUser, loginAs, logout as signOutUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => getSession());

  const signIn = useCallback(async (email: string, password: string) => {
    const loggedIn = await signInUser(email, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const signInAs = useCallback((account: AppUser) => {
    const loggedIn = loginAs(account);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  return { user, isAuthenticated: Boolean(user), signIn, signInAs, signOut };
}

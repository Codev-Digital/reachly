import { signOut } from 'next-auth/react';

const APP_KEY = /^(reachly_|user_|creator_|signupEmail)/;

/** Remove every cached/draft value this app stored in the browser. */
export function clearClientData() {
  try {
    sessionStorage.clear();
    Object.keys(localStorage)
      .filter((k) => APP_KEY.test(k))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/** Full logout: server cookie, NextAuth session, and all locally cached data. */
export async function logout(callbackUrl: string = '/login') {
  clearClientData();
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
  await signOut({ callbackUrl });
}

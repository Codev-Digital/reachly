import { signOut } from 'next-auth/react';

const APP_KEY = /^(reachly_|user_|creator_|signupEmail)/;
const PRESERVED_KEYS = new Set(['reachly_remember_email']);

/** Remove every cached/draft value this app stored in the browser while keeping remembered login email. */
export function clearClientData() {
  try {
    const rememberedEmail = localStorage.getItem('reachly_remember_email');
    sessionStorage.clear();
    Object.keys(localStorage)
      .filter((k) => APP_KEY.test(k) && !PRESERVED_KEYS.has(k))
      .forEach((k) => localStorage.removeItem(k));
    if (rememberedEmail) {
      localStorage.setItem('reachly_remember_email', rememberedEmail);
    }
  } catch {}
}

/** Full logout: server cookie, NextAuth session, and all locally cached data. */
export async function logout(callbackUrl: string = '/login') {
  const rememberedEmail = typeof window !== 'undefined' ? localStorage.getItem('reachly_remember_email') : null;
  clearClientData();
  if (rememberedEmail && typeof window !== 'undefined') {
    localStorage.setItem('reachly_remember_email', rememberedEmail);
  }
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
  await signOut({ callbackUrl });
}

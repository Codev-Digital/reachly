import { NextResponse } from 'next/server';

// Clears the custom auth_token cookie (HttpOnly, so the browser can't remove it itself).
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

import { NextResponse } from 'next/server';

const PROTECTED_ROLES = ['admin', 'supervisor', 'shopper', 'rider'];
const COOKIE_NAME = 'mm_session';

// ── Verify a signed session token using Web Crypto (Edge-compatible) ──────────
async function verifyToken(token, secret) {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(payloadB64)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp && Date.now() > payload.exp) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only guard the four staff routes
  const role = PROTECTED_ROLES.find(r => pathname === `/${r}` || pathname.startsWith(`/${r}/`));
  if (!role) return NextResponse.next();

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Safety net: if the env var is missing in production, block access entirely
    return NextResponse.redirect(new URL(`/login?role=${role}&err=misconfigured`, request.url));
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (sessionCookie?.value) {
    const payload = await verifyToken(sessionCookie.value, secret);
    if (payload?.role === role) {
      return NextResponse.next(); // ✅ valid session for this role
    }
  }

  // No valid session → send to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('role', role);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/supervisor/:path*', '/shopper/:path*', '/rider/:path*'],
};

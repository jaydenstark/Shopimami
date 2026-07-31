import { NextResponse } from 'next/server';

const COOKIE_NAME = 'mm_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

const ROLE_ENV_MAP = {
  admin:      'ADMIN_PASSWORD',
  supervisor: 'SUPERVISOR_PASSWORD',
  shopper:    'SHOPPER_PASSWORD',
  rider:      'RIDER_PASSWORD',
};

// ── Sign a payload with HMAC-SHA-256 ─────────────────────────────────────────
async function signToken(payload, secret) {
  const payloadB64 = btoa(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

  return `${payloadB64}.${sigB64}`;
}

// ── Timing-safe string comparison (prevents timing attacks) ───────────────────
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, password } = body;

    // Validate role
    if (!role || !ROLE_ENV_MAP[role]) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    // Validate password against env var
    const expected = process.env[ROLE_ENV_MAP[role]];
    const secret   = process.env.AUTH_SECRET;

    if (!expected || !secret) {
      return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 });
    }

    if (!safeEqual(password ?? '', expected)) {
      // Deliberate small delay to blunt brute-force
      await new Promise(r => setTimeout(r, 300));
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    // Build signed session token
    const token = await signToken(
      { role, exp: Date.now() + SESSION_DURATION_MS },
      secret
    );

    const response = NextResponse.json({ ok: true, role });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   SESSION_DURATION_MS / 1000,
      path:     '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
}

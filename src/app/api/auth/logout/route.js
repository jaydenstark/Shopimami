import { NextResponse } from 'next/server';

const COOKIE_NAME = 'mm_session';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('next') || '/login';

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   0,   // expire immediately
    path:     '/',
  });

  return response;
}

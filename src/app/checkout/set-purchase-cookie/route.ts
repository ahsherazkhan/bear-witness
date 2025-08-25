import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set('purchase-success', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5,
  });

  return res;
}

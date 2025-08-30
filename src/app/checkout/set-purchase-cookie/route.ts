import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set('purchase-success', 'true', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5,
  });

  return res;
}

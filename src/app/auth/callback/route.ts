// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { signUserId } from '@/lib/signed-cookie';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const fromExtension = searchParams.get('from') === 'extension';
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const userId = data.session.user.id;
      const signedUserId = signUserId(userId);

      const cookieStore = await cookies();

      // Set your existing user cookie
      cookieStore.set('x-user-id', signedUserId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // Set auth success cookie if from extension
      if (fromExtension) {
        cookieStore.set('auth-success', 'true', {
          httpOnly: false, // extension needs to read it
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 5, // 5 minutes (short-lived)
        });
      }

      const redirectUrl = fromExtension ? `${origin}/auth/extension-success` : `${origin}${next}`;

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

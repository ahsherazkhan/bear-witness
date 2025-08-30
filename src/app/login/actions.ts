'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}
export async function login(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: true };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `https://paddle-billing.vercel.app/auth/callback`,
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithGoogle(fromExtension = false) {
  const supabase = await createClient();

  // Determine base URL depending on environment
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://bear-witness.vercel.app';

  // Build callback URL (append ?from=extension if needed)
  const callbackUrl = fromExtension ? `${baseUrl}/auth/callback?from=extension` : `${baseUrl}/auth/callback`;
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    throw new Error('OAuth sign-in failed');
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `bearwitness+${Date.now().toString(36)}@paddle.com`,
  });

  if (signInError || updateUserError) {
    return { error: true };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

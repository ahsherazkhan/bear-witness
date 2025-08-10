import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const ALLOWED_ORIGINS = [
  'chrome-extension://obhbibkigecipphgofligjlkjnchndbi',
  'https://www.linkedin.com',
  'http://localhost:3000',
];

function corsHeaders(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    };
  }
  return {};
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

export async function GET(request) {
  const origin = request.headers.get('origin');

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log('Get session - Error:', error);
      return NextResponse.json(
        {
          authenticated: false,
          error: error.message,
        },
        {
          status: 401,
          headers: corsHeaders(origin),
        },
      );
    }

    if (!session) {
      console.log('Get session - No session found');
      return NextResponse.json(
        {
          authenticated: false,
          message: 'No active session',
        },
        {
          headers: corsHeaders(origin),
        },
      );
    }

    console.log('Get session - User authenticated:', session.user.email);

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        },
        accessToken: session.access_token,
      },
      {
        headers: corsHeaders(origin),
      },
    );
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders(origin),
      },
    );
  }
}
